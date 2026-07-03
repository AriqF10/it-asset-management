from rest_framework import generics
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsAdmin
from .serializers import CreateStaffSerializer, UserSerializer
from .soc_webhook import send_login_event


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        try:
            response = super().post(request, *args, **kwargs)
        except Exception:
            send_login_event(request, username, success=False)
            raise
        send_login_event(request, username, success=(response.status_code == 200))
        return response


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class StaffListCreateView(generics.ListCreateAPIView):
    """Admin-only: list and create staff accounts. No public registration exists."""
    queryset = User.objects.all()
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        return CreateStaffSerializer if self.request.method == 'POST' else UserSerializer
