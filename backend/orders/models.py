from django.conf import settings
from django.db import models

from products.models import Product


class Order(models.Model):
    # No "cash on delivery" - an order only becomes real once payment clears.
    STATUS_CHOICES = [
        ('awaiting_payment', 'Awaiting Payment'),
        ('payment_failed', 'Payment Failed'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='awaiting_payment')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES)

    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} - {self.user.username}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text='Unit price at time of purchase')

    def __str__(self):
        return f'{self.quantity} x {self.product}'

    @property
    def subtotal(self):
        return self.price * self.quantity
