from django.utils.text import slugify
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.models import OrderItem
from products.models import Product
from products.serializers import VendorProductSerializer
from users.serializers import UserSerializer
from users.views import tokens_for_user

from .models import Company
from .permissions import IsApprovedVendor, IsVendor
from .serializers import (
    CompanyAdminListSerializer,
    CompanySerializer,
    CompanyStatusSerializer,
    VendorRegisterSerializer,
    VendorSaleItemSerializer,
)


class VendorRegisterView(APIView):
    """POST /api/vendors/register/ - create a vendor account + company profile.

    The account can log in immediately, but the company starts 'pending'
    and cannot list products until an admin approves it.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VendorRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'user': UserSerializer(user).data,
                'company': CompanySerializer(user.company_instance).data,
                **tokens_for_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class CompanyProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/vendors/me/ - the logged-in vendor's own company profile."""
    serializer_class = CompanySerializer
    permission_classes = [IsVendor]

    def get_object(self):
        return self.request.user.company


class VendorProductListCreateView(generics.ListCreateAPIView):
    """GET /api/vendors/products/ - vendor's own products (any approval state).
    POST /api/vendors/products/ - submit a new product for admin review.
    """
    serializer_class = VendorProductSerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsApprovedVendor()]
        return [IsVendor()]

    def get_queryset(self):
        return Product.objects.filter(company=self.request.user.company).select_related('category')

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, is_approved=False, slug=self._unique_slug(serializer.validated_data['name']))

    @staticmethod
    def _unique_slug(name):
        base_slug = slugify(name)
        slug = base_slug
        suffix = 1
        while Product.objects.filter(slug=slug).exists():
            suffix += 1
            slug = f'{base_slug}-{suffix}'
        return slug


class VendorProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH/DELETE /api/vendors/products/<id>/ - manage one of the vendor's own products."""
    serializer_class = VendorProductSerializer
    permission_classes = [IsVendor]

    def get_queryset(self):
        return Product.objects.filter(company=self.request.user.company)

    def perform_update(self, serializer):
        # Editing a listing sends it back for re-review rather than silently
        # keeping a stale admin approval on changed content.
        serializer.save(is_approved=False)


class VendorSalesView(generics.ListAPIView):
    """GET /api/vendors/sales/ - line items sold from the vendor's own
    products, restricted to orders that have actually been paid for."""
    serializer_class = VendorSaleItemSerializer
    permission_classes = [IsVendor]
    pagination_class = None

    def get_queryset(self):
        return (
            OrderItem.objects.filter(
                product__company=self.request.user.company,
                order__status__in=['paid', 'processing', 'completed'],
            )
            .select_related('order', 'product')
            .order_by('-order__created_at')
        )


class CompanyAdminListView(generics.ListAPIView):
    """GET /api/vendors/companies/ - admin: list all vendor companies."""
    queryset = Company.objects.all().order_by('-created_at')
    serializer_class = CompanyAdminListSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None


class CompanyStatusUpdateView(generics.UpdateAPIView):
    """PATCH /api/vendors/companies/<id>/status/ - admin approves/rejects a company."""
    queryset = Company.objects.all()
    serializer_class = CompanyStatusSerializer
    permission_classes = [permissions.IsAdminUser]
