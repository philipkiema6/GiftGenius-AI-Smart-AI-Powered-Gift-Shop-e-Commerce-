from django.urls import path

from . import views

urlpatterns = [
    path('mpesa/callback/', views.MpesaCallbackView.as_view(), name='mpesa-callback'),
    path('mpesa/b2c-result/', views.MpesaB2CResultView.as_view(), name='mpesa-b2c-result'),
    path('mpesa/b2c-timeout/', views.MpesaB2CTimeoutView.as_view(), name='mpesa-b2c-timeout'),
    path('paypal/capture/', views.PaypalCaptureView.as_view(), name='paypal-capture'),
    path('status/<int:order_id>/', views.PaymentStatusView.as_view(), name='payment-status'),
    path('vendor-payouts/', views.VendorPayoutListView.as_view(), name='vendor-payout-list'),
    path('vendor-payouts/<int:pk>/pay/', views.VendorPayoutPayView.as_view(), name='vendor-payout-pay'),
    path('my-payouts/', views.MyVendorPayoutListView.as_view(), name='my-vendor-payouts'),
]
