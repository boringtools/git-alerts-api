from django.urls import URLPattern, path
from .views import SystemSettingsView

urlpatterns = [
    path('settings/', SystemSettingsView.as_view(), name='settings')
]
