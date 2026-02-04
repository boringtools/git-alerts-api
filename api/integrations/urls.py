from django.urls import path
from .views import UserIntegrationView, UserIntegrationValidateView

urlpatterns = [
    path('integrations/', UserIntegrationView.as_view(), name='integration'),
    path('integrations/<int:pk>/validate/', UserIntegrationValidateView.as_view(), name='integration-validate'),
]