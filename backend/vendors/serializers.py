from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from orders.models import OrderItem
from users.models import User

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Company
        fields = (
            'id', 'name', 'description', 'contact_email', 'contact_phone',
            'logo_url', 'status', 'payout_method', 'mpesa_phone', 'paypal_email',
            'product_count', 'created_at',
        )
        read_only_fields = ('id', 'status', 'created_at')


class CompanyStatusSerializer(serializers.ModelSerializer):
    """Admin-only: approve/reject a vendor's company."""

    class Meta:
        model = Company
        fields = ('id', 'name', 'status')
        read_only_fields = ('id', 'name')


class CompanyAdminListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Company
        fields = (
            'id', 'name', 'username', 'description', 'contact_email', 'contact_phone',
            'status', 'payout_method', 'mpesa_phone', 'paypal_email', 'product_count', 'created_at',
        )


class VendorSaleItemSerializer(serializers.ModelSerializer):
    """One line item sold from the vendor's own catalogue."""
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    order_date = serializers.DateTimeField(source='order.created_at', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            'id', 'order_id', 'order_date', 'order_status',
            'product', 'product_name', 'product_image', 'quantity', 'price', 'subtotal',
        )


class VendorRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)
    company_name = serializers.CharField(max_length=150)
    company_description = serializers.CharField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            is_vendor=True,
        )
        user.set_password(validated_data['password'])
        user.save()
        company = Company.objects.create(
            user=user,
            name=validated_data['company_name'],
            description=validated_data.get('company_description', ''),
            contact_email=validated_data['email'],
            contact_phone=validated_data.get('contact_phone', ''),
        )
        user.company_instance = company
        return user
