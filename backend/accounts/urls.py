from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import MeView, StaffListCreateView, ThrottledTokenObtainPairView

urlpatterns = [
    path('login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('staff/', StaffListCreateView.as_view(), name='staff-list-create'),
]
