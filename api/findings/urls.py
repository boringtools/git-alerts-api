from django.urls import path
from .views import FindingView, FindingDetailsView, IgnoreFindingTypeView, IgnoreFindingTypeDetailsView, IgnoreFindingDomainView, IgnoredFindingDomainDetailView

urlpatterns = [
    path('findings/', FindingView.as_view(), name='finding'),
    path('findings/<int:pk>/', FindingDetailsView.as_view(), name='finding-details'),

    path('finding-ignores/types/', IgnoreFindingTypeView.as_view(), name='ignore-type'),
    path('finding-ignores/types/<int:pk>', IgnoreFindingTypeDetailsView.as_view(), name='ignore-type-detail'),

    path('finding-ignores/domains/', IgnoreFindingDomainView.as_view(), name='ignore-domain'),
    path('finding-ignores/domains/<int:pk>', IgnoredFindingDomainDetailView.as_view(), name='ignore-domain-details')
]