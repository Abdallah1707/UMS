from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassroomViewSet, BookingViewSet, available_classrooms, MaintenanceTicketViewSet, ResourceViewSet, ResourceAllocationViewSet

router = DefaultRouter()
router.register(r'classrooms', ClassroomViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'maintenance-tickets', MaintenanceTicketViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'resource-allocations', ResourceAllocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('available-classrooms/', available_classrooms, name='available-classrooms'),
]