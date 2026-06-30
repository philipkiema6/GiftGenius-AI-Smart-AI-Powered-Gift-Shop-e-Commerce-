@echo off
REM Exposes the local Django backend (port 8000) on a public HTTPS URL so
REM Safaricom's Daraja sandbox can reach the M-Pesa callback/result endpoints.
REM First-time setup (only once): sign up free at https://dashboard.ngrok.com/signup,
REM copy your authtoken, then run:  tools\ngrok.exe config add-authtoken YOUR_TOKEN
echo Starting ngrok tunnel to http://localhost:8000 ...
echo Copy the "Forwarding" https URL below into backend\.env (MPESA_CALLBACK_URL,
echo MPESA_B2C_RESULT_URL, MPESA_B2C_TIMEOUT_URL), then restart the Django server.
"%~dp0ngrok.exe" http 8000
