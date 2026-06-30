"""Shared logic for what happens once a payment actually clears, regardless
of whether it came from the M-Pesa callback or a PayPal capture."""
from collections import defaultdict
from decimal import Decimal

from django.conf import settings
from django.db import transaction

from cart.models import CartItem

from .models import VendorPayout


@transaction.atomic
def confirm_payment_success(payment, receipt_number=''):
    order = payment.order
    if order.status == 'paid':
        return  # already processed - guards against duplicate callbacks

    payment.status = 'completed'
    payment.receipt_number = receipt_number
    payment.save()

    order.status = 'paid'
    order.save()

    # Stock is only committed once money has actually moved.
    for item in order.items.select_related('product'):
        if item.product:
            item.product.stock = max(0, item.product.stock - item.quantity)
            item.product.save()

    CartItem.objects.filter(user=order.user).delete()
    _create_vendor_payouts(order)


def mark_payment_failed(payment, reason=''):
    payment.status = 'failed'
    payment.failure_reason = reason[:255]
    payment.save()

    order = payment.order
    order.status = 'payment_failed'
    order.save()


def _create_vendor_payouts(order):
    """Splits the order into one payout-owed row per supplying company,
    after deducting the platform's commission. Admin-fulfilled items
    (product.company is None) generate no payout - that revenue is the
    platform's outright."""
    totals = defaultdict(Decimal)
    for item in order.items.select_related('product__company'):
        if item.product and item.product.company_id:
            totals[item.product.company_id] += item.subtotal

    commission_percent = Decimal(str(settings.PLATFORM_COMMISSION_PERCENT))
    for company_id, gross in totals.items():
        commission_amount = (gross * commission_percent / Decimal('100')).quantize(Decimal('0.01'))
        net_amount = gross - commission_amount
        VendorPayout.objects.get_or_create(
            order=order,
            company_id=company_id,
            defaults={
                'gross_amount': gross,
                'commission_percent': commission_percent,
                'commission_amount': commission_amount,
                'net_amount': net_amount,
            },
        )


def kes_to_usd(amount_kes):
    return round(float(amount_kes) * settings.KES_TO_USD_RATE, 2)
