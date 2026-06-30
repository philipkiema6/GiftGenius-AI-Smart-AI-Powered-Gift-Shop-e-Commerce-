from django.conf import settings
from django.db import models


class Company(models.Model):
    """A supplier/company account that can list its own products for admin review."""

    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='company')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True)
    logo_url = models.URLField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    PAYOUT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
    ]
    payout_method = models.CharField(max_length=10, choices=PAYOUT_METHOD_CHOICES, default='mpesa')
    mpesa_phone = models.CharField(
        max_length=20, blank=True, help_text='Phone number to receive M-Pesa payouts, format 2547XXXXXXXX.',
    )
    paypal_email = models.EmailField(blank=True, help_text='PayPal email to receive payouts.')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'companies'

    def __str__(self):
        return f'{self.name} ({self.status})'

    @property
    def is_approved(self):
        return self.status == 'approved'
