from rest_framework import serializers

from products.serializers import ProductSerializer

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_detail', 'quantity', 'price', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'username', 'total_amount', 'status', 'payment_method',
            'full_name', 'phone_number', 'address', 'city', 'notes',
            'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'total_amount', 'created_at', 'updated_at')


class CheckoutSerializer(serializers.Serializer):
    """Validates the shipping form submitted from the checkout page."""
    full_name = serializers.CharField(max_length=150)
    phone_number = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_CHOICES)

    def validate(self, attrs):
        if attrs['payment_method'] == 'mpesa':
            attrs['mpesa_phone'] = _normalize_mpesa_phone(attrs['phone_number'])
        return attrs


def _normalize_mpesa_phone(raw):
    """Daraja requires the 2547XXXXXXXX format - accept whatever a Kenyan
    shopper is likely to type and normalize it."""
    digits = ''.join(ch for ch in raw if ch.isdigit())
    if digits.startswith('254') and len(digits) == 12:
        return digits
    if digits.startswith('0') and len(digits) == 10:
        return '254' + digits[1:]
    if digits.startswith('7') and len(digits) == 9:
        return '254' + digits
    raise serializers.ValidationError(
        {'phone_number': 'Enter a valid Kenyan phone number for M-Pesa, e.g. 0712345678.'}
    )
