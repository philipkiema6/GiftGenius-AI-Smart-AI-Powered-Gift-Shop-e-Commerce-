from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.VendorRegisterView.as_view(), name='vendor-register'),
    path('me/', views.CompanyProfileView.as_view(), name='vendor-company-profile'),
    path('products/', views.VendorProductListCreateView.as_view(), name='vendor-product-list'),
    path('products/<int:pk>/', views.VendorProductDetailView.as_view(), name='vendor-product-detail'),
    path('sales/', views.VendorSalesView.as_view(), name='vendor-sales'),
    path('companies/', views.CompanyAdminListView.as_view(), name='admin-company-list'),
    path('companies/<int:pk>/status/', views.CompanyStatusUpdateView.as_view(), name='admin-company-status'),
]
