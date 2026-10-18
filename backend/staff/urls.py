from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'performance-reviews', views.PerformanceReviewViewSet, basename='performance-review')
router.register(r'development-activities', views.ProfessionalDevelopmentActivityViewSet, basename='development-activity')
router.register(r'activity-registrations', views.StaffActivityRegistrationViewSet, basename='activity-registration')
router.register(r'publications', views.PublicationViewSet, basename='publication')
router.register(r'leave-requests', views.LeaveRequestViewSet, basename='leave-request')
router.register(r'payroll', views.PayrollRecordViewSet, basename='payroll')

urlpatterns = [
    path('', include(router.urls)),
]
