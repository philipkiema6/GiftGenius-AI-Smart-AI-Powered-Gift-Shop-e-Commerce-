import logging

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import Order
from orders.serializers import OrderSerializer
from vendors.permissions import IsVendor

from . import mpesa, paypal
from .models import Payment, VendorPayout
from .serializers import PaymentSerializer, VendorPayoutSerializer
from .services import confirm_payment_success, mark_payment_failed

logger = logging.getLogger(__name__)


class MpesaCallbackView(APIView):
    """POST /api/payments/mpesa/callback/ - Safaricom calls this directly,
    so it must stay unauthenticated. Must be reachable over public HTTPS
    (e.g. via ngrok in dev) - see MPESA_CALLBACK_URL in backend/.env.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        body = request.data.get('Body', {})
        callback = body.get('stkCallback', {})
        checkout_request_id = callback.get('CheckoutRequestID')
        result_code = callback.get('ResultCode')
        result_desc = callback.get('ResultDesc', '')

        try:
            payment = Payment.objects.get(provider_reference=checkout_request_id, method='mpesa')
        except Payment.DoesNotExist:
            logger.warning('M-Pesa callback for unknown CheckoutRequestID=%s', checkout_request_id)
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

        payment.raw_response = request.data
        payment.save()

        if result_code == 0:
            items = callback.get('CallbackMetadata', {}).get('Item', [])
            receipt = next((i['Value'] for i in items if i.get('Name') == 'MpesaReceiptNumber'), '')
            confirm_payment_success(payment, receipt_number=receipt)
        else:
            mark_payment_failed(payment, reason=result_desc)

        # Safaricom expects this exact acknowledgement shape regardless of outcome.
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class MpesaB2CResultView(APIView):
    """POST /api/payments/mpesa/b2c-result/ - Safaricom's async result for a vendor payout."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        result = request.data.get('Result', {})
        conversation_id = result.get('ConversationID')
        result_code = result.get('ResultCode')

        payout = VendorPayout.objects.filter(provider_reference=conversation_id).first()
        if payout:
            if result_code == 0:
                payout.status = 'paid'
                payout.paid_at = timezone.now()
            else:
                payout.status = 'failed'
                payout.failure_reason = result.get('ResultDesc', '')[:255]
            payout.save()
        else:
            logger.warning('M-Pesa B2C result for unknown ConversationID=%s', conversation_id)

        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class MpesaB2CTimeoutView(APIView):
    """POST /api/payments/mpesa/b2c-timeout/ - Safaricom calls this if a B2C request times out."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.warning('M-Pesa B2C timeout: %s', request.data)
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class PaypalCaptureView(APIView):
    """POST /api/payments/paypal/capture/ - frontend calls this right after
    the buyer approves payment in the PayPal popup."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order = get_object_or_404(Order, pk=request.data.get('order'), user=request.user)
        payment = getattr(order, 'payment', None)
        if not payment or payment.method != 'paypal':
            return Response({'detail': 'No PayPal payment found for this order.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = paypal.capture_order(payment.provider_reference)
        except paypal.PaypalError as exc:
            mark_payment_failed(payment, reason=str(exc))
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        capture_id = result['purchase_units'][0]['payments']['captures'][0]['id']
        payment.raw_response = result
        confirm_payment_success(payment, receipt_number=capture_id)
        return Response(OrderSerializer(order).data)


class PaymentStatusView(APIView):
    """GET /api/payments/status/<order_id>/ - frontend polls this while
    waiting on an async M-Pesa STK push to resolve."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id)
        if order.user_id != request.user.id and not request.user.is_staff:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment = getattr(order, 'payment', None)
        if not payment:
            return Response({'detail': 'No payment found for this order.'}, status=status.HTTP_404_NOT_FOUND)

        # If the callback hasn't landed yet, ask Daraja directly as a fallback.
        # While the push is still awaiting the user's PIN, Daraja's query
        # endpoint returns an `errorCode`/`errorMessage` shape with no
        # `ResultCode` at all - that case is left alone here, so we only
        # act once Safaricom has actually resolved the transaction.
        if payment.status == 'pending' and payment.method == 'mpesa' and payment.provider_reference:
            try:
                query_result = mpesa.stk_query(payment.provider_reference)
                result_code = query_result.get('ResultCode')
                if result_code == '0':
                    confirm_payment_success(payment, receipt_number=query_result.get('MpesaReceiptNumber', ''))
                elif result_code is not None:
                    mark_payment_failed(payment, reason=query_result.get('ResultDesc', ''))
            except mpesa.MpesaError:
                pass  # query failing just means we keep waiting for the callback

        return Response(PaymentSerializer(payment).data)


class VendorPayoutListView(generics.ListAPIView):
    """GET /api/payments/vendor-payouts/ - admin ledger of what's owed to each vendor."""
    serializer_class = VendorPayoutSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        qs = VendorPayout.objects.select_related('company', 'order').order_by('-created_at')
        payout_status = self.request.query_params.get('status')
        return qs.filter(status=payout_status) if payout_status else qs


class MyVendorPayoutListView(generics.ListAPIView):
    """GET /api/payments/my-payouts/ - the logged-in vendor's own earnings ledger."""
    serializer_class = VendorPayoutSerializer
    permission_classes = [IsVendor]
    pagination_class = None

    def get_queryset(self):
        return (
            VendorPayout.objects.filter(company=self.request.user.company)
            .select_related('order')
            .order_by('-created_at')
        )


class VendorPayoutPayView(APIView):
    """POST /api/payments/vendor-payouts/<id>/pay/ - admin releases a vendor's
    owed share via sandbox M-Pesa B2C or PayPal Payouts, based on the
    company's chosen payout method."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        payout = get_object_or_404(VendorPayout, pk=pk)
        if payout.status == 'paid':
            return Response({'detail': 'Already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        company = payout.company
        payout.payout_method = company.payout_method

        try:
            if company.payout_method == 'mpesa':
                if not company.mpesa_phone:
                    raise ValueError(f'{company.name} has not set an M-Pesa payout phone number.')
                result = mpesa.b2c_payment(
                    company.mpesa_phone, payout.net_amount, remarks=f'GiftGenius payout - Order #{payout.order_id}'
                )
                payout.provider_reference = result.get('ConversationID', '')
                payout.status = 'paid'
                payout.paid_at = timezone.now()
            elif company.payout_method == 'paypal':
                if not company.paypal_email:
                    raise ValueError(f'{company.name} has not set a PayPal payout email.')
                from .services import kes_to_usd
                result = paypal.create_payout(
                    company.paypal_email, kes_to_usd(payout.net_amount), currency='USD',
                    note=f'GiftGenius payout - Order #{payout.order_id}',
                )
                payout.provider_reference = result.get('batch_header', {}).get('payout_batch_id', '')
                payout.status = 'paid'
                payout.paid_at = timezone.now()
            else:
                raise ValueError('Unknown payout method.')
        except (mpesa.MpesaError, paypal.PaypalError, ValueError) as exc:
            payout.status = 'failed'
            payout.failure_reason = str(exc)[:255]
            payout.save()
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        payout.save()
        return Response(VendorPayoutSerializer(payout).data)
