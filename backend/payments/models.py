from django.db import models

from orders.models import Order
from vendors.models import Company


class Payment(models.Model):
    """Tracks the actual money-movement attempt for an order.

    One Order has at most one Payment. M-Pesa STK Push is async (the
    `provider_reference` is the CheckoutRequestID, confirmed later by
    Safaricom's callback); PayPal capture is synchronous (confirmed in the
    same request that creates this row).
    """

    METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    # M-Pesa: CheckoutRequestID from the STK push request. PayPal: the Order ID
    # returned by PayPal's Orders API.
    provider_reference = models.CharField(max_length=100, blank=True)
    # Final receipt number (M-Pesa MpesaReceiptNumber / PayPal capture id).
    receipt_number = models.CharField(max_length=100, blank=True)
    failure_reason = models.CharField(max_length=255, blank=True)
    raw_response = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Payment for Order #{self.order_id} ({self.method}, {self.status})'


class VendorPayout(models.Model):
    """The platform's record of what's owed to a vendor for one order, after
    the platform commission is deducted. Created once the order's payment is
    confirmed; settled later via the admin "Pay" action.
    """

    STATUS_CHOICES = [
        ('owed', 'Owed'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='vendor_payouts')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='payouts')

    gross_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Company's share of the order before commission.")
    commission_percent = models.DecimalField(max_digits=5, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text='Amount actually owed to the vendor.')

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='owed')
    payout_method = models.CharField(max_length=10, blank=True)
    provider_reference = models.CharField(max_length=100, blank=True)
    failure_reason = models.CharField(max_length=255, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('order', 'company')
        ordering = ['-created_at']

    def __str__(self):
        return f'Payout to {self.company.name} for Order #{self.order_id} ({self.status})'
