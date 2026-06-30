from rest_framework import serializers

from .models import Payment, VendorPayout


class PaymentSerializer(serializers.ModelSerializer):
    order_status = serializers.CharField(source='order.status', read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id', 'order', 'order_status', 'method', 'status', 'amount',
            'receipt_number', 'failure_reason', 'created_at', 'updated_at',
        )


class VendorPayoutSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = VendorPayout
        fields = (
            'id', 'order_id', 'company', 'company_name', 'gross_amount',
            'commission_percent', 'commission_amount', 'net_amount',
            'status', 'payout_method', 'provider_reference', 'failure_reason',
            'paid_at', 'created_at',
        )
