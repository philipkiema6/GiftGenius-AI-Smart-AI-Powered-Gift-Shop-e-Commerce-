"""PayPal REST API client (Orders v2 capture + Payouts).

Swap PAYPAL_ENV to 'live' and the client id/secret in backend/.env to go
to production - the calls themselves don't change.
"""
import requests
from django.conf import settings

BASE_URL = 'https://api-m.sandbox.paypal.com' if settings.PAYPAL_ENV == 'sandbox' else 'https://api-m.paypal.com'


class PaypalError(Exception):
    pass


def get_access_token():
    response = requests.post(
        f'{BASE_URL}/v1/oauth2/token',
        data={'grant_type': 'client_credentials'},
        auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
        timeout=15,
    )
    if response.status_code != 200:
        raise PaypalError(f'Could not get PayPal access token: {response.text}')
    return response.json()['access_token']


def create_order(amount, currency='USD'):
    token = get_access_token()
    payload = {
        'intent': 'CAPTURE',
        'purchase_units': [{'amount': {'currency_code': currency, 'value': f'{amount:.2f}'}}],
    }
    response = requests.post(
        f'{BASE_URL}/v2/checkout/orders',
        json=payload,
        headers={'Authorization': f'Bearer {token}'},
        timeout=15,
    )
    data = response.json()
    if response.status_code not in (200, 201):
        raise PaypalError(data.get('message') or 'Could not create PayPal order')
    return data


def capture_order(paypal_order_id):
    token = get_access_token()
    response = requests.post(
        f'{BASE_URL}/v2/checkout/orders/{paypal_order_id}/capture',
        json={},
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        timeout=15,
    )
    data = response.json()
    if response.status_code not in (200, 201) or data.get('status') != 'COMPLETED':
        raise PaypalError(data.get('message') or 'PayPal capture was not completed')
    return data


def create_payout(email, amount, currency='USD', note='GiftGenius vendor payout'):
    token = get_access_token()
    import time
    payload = {
        'sender_batch_header': {
            'sender_batch_id': f'giftgenius-{int(time.time())}',
            'email_subject': 'You have a payout from GiftGenius AI',
        },
        'items': [
            {
                'recipient_type': 'EMAIL',
                'amount': {'value': f'{amount:.2f}', 'currency': currency},
                'receiver': email,
                'note': note,
            }
        ],
    }
    response = requests.post(
        f'{BASE_URL}/v1/payments/payouts',
        json=payload,
        headers={'Authorization': f'Bearer {token}'},
        timeout=15,
    )
    data = response.json()
    if response.status_code not in (200, 201):
        raise PaypalError(data.get('message') or 'PayPal payout failed')
    return data
