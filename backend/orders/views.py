from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import CartItem
from payments import mpesa, paypal
from payments.models import Payment
from payments.services import kes_to_usd

from .models import Order, OrderItem
from .serializers import CheckoutSerializer, OrderSerializer


class OrderListView(generics.ListAPIView):
    """GET /api/orders/ - the current user's order history (or all orders for admins)."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items__product')
        if user.is_staff and self.request.query_params.get('all') == 'true':
            return qs.all()
        return qs.filter(user=user)


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/<id>/"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items__product')
        return qs if user.is_staff else qs.filter(user=user)


class OrderStatusUpdateView(APIView):
    """PATCH /api/orders/<id>/status/ - admin updates an order's fulfillment status."""
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)


class CheckoutView(APIView):
    """POST /api/orders/checkout/ - reserves the cart as an Order and kicks
    off payment. The order only becomes 'paid' once M-Pesa's callback or a
    PayPal capture actually confirms the money moved - see payments/services.py.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        mpesa_phone = data.pop('mpesa_phone', None)

        cart_items = CartItem.objects.filter(user=request.user).select_related('product')
        if not cart_items.exists():
            return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        for cart_item in cart_items:
            if cart_item.quantity > cart_item.product.stock:
                return Response(
                    {'detail': f'Not enough stock for {cart_item.product.name}.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        total_amount = sum(item.subtotal for item in cart_items)
        order = Order.objects.create(user=request.user, total_amount=total_amount, **data)

        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order, product=cart_item.product, quantity=cart_item.quantity, price=cart_item.product.price,
            )
        # Stock is intentionally NOT decremented here - only once payment clears.

        payment = Payment.objects.create(order=order, method=data['payment_method'], amount=total_amount)

        if data['payment_method'] == 'mpesa':
            return self._start_mpesa(order, payment, mpesa_phone)
        return self._start_paypal(order, payment)

    def _start_mpesa(self, order, payment, phone):
        try:
            result = mpesa.stk_push(phone, payment.amount, account_reference=f'GG-Order-{order.id}')
        except mpesa.MpesaError as exc:
            order.status = 'payment_failed'
            order.save()
            payment.status = 'failed'
            payment.failure_reason = str(exc)
            payment.save()
            return Response({'detail': f'Could not start M-Pesa payment: {exc}'}, status=status.HTTP_502_BAD_GATEWAY)

        payment.provider_reference = result.get('CheckoutRequestID', '')
        payment.raw_response = result
        payment.save()
        return Response(
            {'order': OrderSerializer(order).data, 'message': 'Check your phone to complete payment.'},
            status=status.HTTP_201_CREATED,
        )

    def _start_paypal(self, order, payment):
        try:
            result = paypal.create_order(kes_to_usd(payment.amount), currency='USD')
        except paypal.PaypalError as exc:
            order.status = 'payment_failed'
            order.save()
            payment.status = 'failed'
            payment.failure_reason = str(exc)
            payment.save()
            return Response({'detail': f'Could not start PayPal payment: {exc}'}, status=status.HTTP_502_BAD_GATEWAY)

        payment.provider_reference = result['id']
        payment.raw_response = result
        payment.save()
        return Response(
            {
                'order': OrderSerializer(order).data,
                'paypal_order_id': result['id'],
                'paypal_amount_usd': kes_to_usd(payment.amount),
            },
            status=status.HTTP_201_CREATED,
        )
