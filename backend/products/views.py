from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ProductFilter
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductWriteSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_staff


class CategoryListView(generics.ListAPIView):
    """GET /api/products/categories/"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


def visible_products(user):
    """Customers only ever see admin-approved products; staff see everything
    (so they can review/approve pending vendor submissions)."""
    qs = Product.objects.select_related('category', 'company')
    if user.is_authenticated and user.is_staff:
        return qs
    return qs.filter(is_approved=True)


class ProductListCreateView(generics.ListCreateAPIView):
    """GET /api/products/ - browse/search/filter/sort approved products.
    POST /api/products/ - admin creates a product.
    """
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'rating', 'created_at', 'name']
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return visible_products(self.request.user)

    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method == 'POST' else ProductSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/products/<slug>/"""
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return visible_products(self.request.user)

    def get_serializer_class(self):
        return ProductWriteSerializer if self.request.method in ('PUT', 'PATCH') else ProductSerializer

    def get_serializer_context(self):
        return {'request': self.request}


class TrendingProductsView(generics.ListAPIView):
    """GET /api/products/trending/"""
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(is_trending=True, is_approved=True)[:8]

    def get_serializer_context(self):
        return {'request': self.request}


class FeaturedProductsView(generics.ListAPIView):
    """GET /api/products/featured/"""
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Product.objects.filter(is_featured=True, is_approved=True)[:8]

    def get_serializer_context(self):
        return {'request': self.request}


class SalesStatsView(APIView):
    """GET /api/products/stats/ - lightweight stats for the admin dashboard."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Sum
        from orders.models import Order, OrderItem
        from users.models import User

        total_orders = Order.objects.count()
        # Revenue counts anything actually paid for, not just fulfilled -
        # an order sits at 'paid'/'processing' before it reaches 'completed'.
        total_revenue = Order.objects.filter(status__in=['paid', 'processing', 'completed']).aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        total_users = User.objects.count()
        total_products = Product.objects.count()
        low_stock = Product.objects.filter(stock__lte=5).count()
        best_sellers = (
            OrderItem.objects.values('product__name')
            .annotate(units_sold=Sum('quantity'))
            .order_by('-units_sold')[:5]
        )

        from vendors.models import Company

        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_users': total_users,
            'total_products': total_products,
            'low_stock_products': low_stock,
            'best_sellers': list(best_sellers),
            'pending_vendor_products': Product.objects.filter(is_approved=False).count(),
            'pending_companies': Company.objects.filter(status='pending').count(),
        })
