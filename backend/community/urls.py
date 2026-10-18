from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, AnnouncementViewSet, EventViewSet

app_name = 'community'

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('announcements/', AnnouncementViewSet.as_view({'get': 'list', 'post': 'create'}), name='announcement_list'),
    path('announcements/<int:pk>/', AnnouncementViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='announcement_detail'),
    path('events/', EventViewSet.as_view({'get': 'list', 'post': 'create'}), name='event_list'),
    path('events/<int:pk>/', EventViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='event_detail'),
]