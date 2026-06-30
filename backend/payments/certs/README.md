# M-Pesa B2C certificate

B2C payouts (paying a vendor's share to their phone) require Safaricom's
public certificate to encrypt `MPESA_INITIATOR_PASSWORD` into a
`SecurityCredential`. This repo intentionally does not bundle that file -
download it yourself from the Daraja portal:

1. Log in at https://developer.safaricom.co.ke
2. Open your app > APIs > B2C > "Get Security Credential" (sandbox and
   production each have their own certificate).
3. Save the downloaded `.cer` file as `sandbox_cert.cer` in this folder
   (or point `MPESA_CERT_PATH` in `backend/.env` at wherever you saved it).

Without this file, `b2c_payment()` in `payments/mpesa.py` will raise a
`FileNotFoundError` - everything else (STK push, PayPal) works without it.
