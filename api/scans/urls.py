from django.urls import path
from .views import ScanView, ScanDetailsView, ScanFindingsView

urlpatterns = [
    path('scans/', ScanView.as_view(), name='scan'),
    path('scans/<int:pk>/', ScanDetailsView.as_view(), name='scan-details'),
    path('scans/<int:pk>/findings/', ScanFindingsView.as_view(), name='scan-findings')
]
