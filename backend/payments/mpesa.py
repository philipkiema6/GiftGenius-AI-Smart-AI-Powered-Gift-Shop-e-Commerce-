"""Safaricom Daraja API client (STK Push + B2C payouts).

Every URL below switches between sandbox and production based on
MPESA_ENV in backend/.env - swap that one value plus the credentials
(MPESA_CONSUMER_KEY/SECRET/SHORTCODE/PASSKEY/INITIATOR_*) to go live.
Nothing in this module is sandbox-specific by itself.
"""
import base64
from datetime import datetime

import requests
from django.conf import settings

BASE_URL = 'https://sandbox.safaricom.co.ke' if settings.MPESA_ENV == 'sandbox' else 'https://api.safaricom.co.ke'


class MpesaError(Exception):
    pass


def get_access_token():
    response = requests.get(
        f'{BASE_URL}/oauth/v1/generate?grant_type=client_credentials',
        auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
        timeout=15,
    )
    if response.status_code != 200:
        raise MpesaError(f'Could not get Daraja access token: {response.text}')
    return response.json()['access_token']


def _password_and_timestamp():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    raw = f'{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}'
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp


def stk_push(phone, amount, account_reference, transaction_desc='GiftGenius order'):
    """Initiates an STK push prompt on the customer's phone.

    `phone` must be in 2547XXXXXXXX format. Returns the Daraja response,
    which includes CheckoutRequestID - store that on the Payment row so the
    callback (or a status query) can be matched back to the order.
    """
    token = get_access_token()
    password, timestamp = _password_and_timestamp()
    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE,
        'Password': password,
        'Timestamp': timestamp,
        'TransactionType': 'CustomerPayBillOnline',
        'Amount': int(amount),
        'PartyA': phone,
        'PartyB': settings.MPESA_SHORTCODE,
        'PhoneNumber': phone,
        'CallBackURL': settings.MPESA_CALLBACK_URL,
        'AccountReference': account_reference,
        'TransactionDesc': transaction_desc,
    }
    response = requests.post(
        f'{BASE_URL}/mpesa/stkpush/v1/processrequest',
        json=payload,
        headers={'Authorization': f'Bearer {token}'},
        timeout=15,
    )
    data = response.json()
    if response.status_code != 200 or data.get('ResponseCode') != '0':
        raise MpesaError(data.get('errorMessage') or data.get('ResponseDescription') or 'STK push failed')
    return data


def stk_query(checkout_request_id):
    """Polls the status of an STK push, used as a fallback if the callback
    is slow to arrive (sandbox callbacks can lag)."""
    token = get_access_token()
    password, timestamp = _password_and_timestamp()
    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE,
        'Password': password,
        'Timestamp': timestamp,
        'CheckoutRequestID': checkout_request_id,
    }
    response = requests.post(
        f'{BASE_URL}/mpesa/stkpushquery/v1/query',
        json=payload,
        headers={'Authorization': f'Bearer {token}'},
        timeout=15,
    )
    return response.json()


def _security_credential():
    """Encrypts the B2C initiator password with Safaricom's public
    certificate, as required by the B2C API. Download the sandbox
    certificate from the Daraja portal (Docs > B2C > Get Security
    Credential) and save it at the path in MPESA_CERT_PATH.
    """
    from cryptography.hazmat.primitives.asymmetric.padding import PKCS1v15
    from cryptography.x509 import load_pem_x509_certificate, load_der_x509_certificate

    with open(settings.MPESA_CERT_PATH, 'rb') as f:
        cert_bytes = f.read()
    try:
        cert = load_pem_x509_certificate(cert_bytes)
    except ValueError:
        cert = load_der_x509_certificate(cert_bytes)
    encrypted = cert.public_key().encrypt(settings.MPESA_INITIATOR_PASSWORD.encode(), PKCS1v15())
    return base64.b64encode(encrypted).decode()


def b2c_payment(phone, amount, remarks, occasion='VendorPayout'):
    """Sends money from the platform's M-Pesa account to a vendor's phone."""
    token = get_access_token()
    payload = {
        'InitiatorName': settings.MPESA_INITIATOR_NAME,
        'SecurityCredential': _security_credential(),
        'CommandID': 'BusinessPayment',
        'Amount': int(amount),
        'PartyA': settings.MPESA_SHORTCODE,
        'PartyB': phone,
        'Remarks': remarks,
        'QueueTimeOutURL': settings.MPESA_B2C_TIMEOUT_URL,
        'ResultURL': settings.MPESA_B2C_RESULT_URL,
        'Occasion': occasion,
    }
    response = requests.post(
        f'{BASE_URL}/mpesa/b2c/v3/paymentrequest',
        json=payload,
        headers={'Authorization': f'Bearer {token}'},
        timeout=15,
    )
    data = response.json()
    if response.status_code != 200 or data.get('ResponseCode') not in ('0', 0):
        raise MpesaError(data.get('errorMessage') or 'B2C payout failed')
    return data
