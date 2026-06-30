from django.contrib import admin

from .models import Payment, VendorPayout


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'method', 'status', 'amount', 'receipt_number', 'created_at')
    list_filter = ('method', 'status')
    search_fields = ('order__id', 'provider_reference', 'receipt_number')


@admin.register(VendorPayout)
class VendorPayoutAdmin(admin.ModelAdmin):
    list_display = ('company', 'order', 'net_amount', 'status', 'payout_method', 'paid_at')
    list_filter = ('status', 'payout_method')
    search_fields = ('company__name', 'order__id')
