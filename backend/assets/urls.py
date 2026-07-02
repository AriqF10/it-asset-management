from rest_framework.routers import DefaultRouter

from .views import AssetViewSet, EmployeeViewSet

router = DefaultRouter()
router.register('assets', AssetViewSet, basename='asset')
router.register('employees', EmployeeViewSet, basename='employee')

urlpatterns = router.urls
