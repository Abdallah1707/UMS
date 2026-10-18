from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.permissions import IsAdmin
from .models import Classroom, Booking, MaintenanceTicket, Resource, ResourceAllocation
from .serializers import ClassroomSerializer, BookingSerializer, MaintenanceTicketSerializer, ResourceSerializer, ResourceAllocationSerializer
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q

class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'admin':
            return Booking.objects.all()
        return Booking.objects.filter(staff=self.request.user)

    def perform_create(self, serializer):
        serializer.save(staff=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta', 'admin']:
            return Response({"errors": {"detail": ["Only staff members can book classrooms."]}}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        if request.user.user_type != 'admin' and booking.staff != request.user:
            return Response({"errors": {"detail": ["You can only update your own bookings."]}}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()
        if request.user.user_type != 'admin' and booking.staff != request.user:
            return Response({"errors": {"detail": ["You can only cancel your own bookings."]}}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def available_classrooms(request):
    date = request.data.get('date')
    time_from = request.data.get('time_from')
    time_to = request.data.get('time_to')
    num_students = request.data.get('num_students')
    
    if not all([date, time_from, time_to, num_students]):
        return Response({"errors": {"detail": ["Please provide date, time range, and number of students."]}}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get classrooms with sufficient capacity
    classrooms = Classroom.objects.filter(capacity__gte=num_students, is_available=True)
    
    # Filter out booked classrooms
    booked_ids = Booking.objects.filter(
        date=date
    ).filter(
        Q(time_from__lt=time_to, time_to__gt=time_from)
    ).values_list('classroom_id', flat=True)
    
    available = classrooms.exclude(id__in=booked_ids)
    serializer = ClassroomSerializer(available, many=True)
    return Response(serializer.data)

class MaintenanceTicketViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceTicket.objects.all()
    serializer_class = MaintenanceTicketSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'admin':
            return MaintenanceTicket.objects.all()
        return MaintenanceTicket.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        ticket = self.get_object()
        if request.user.user_type != 'admin':
            return Response({"errors": {"detail": ["Only administrators can update maintenance tickets."]}}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [IsAdmin]

class ResourceAllocationViewSet(viewsets.ModelViewSet):
    queryset = ResourceAllocation.objects.all()
    serializer_class = ResourceAllocationSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = ResourceAllocation.objects.all()
        department_id = self.request.query_params.get('department', None)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        return queryset
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        resource = instance.resource
        resource.available += instance.quantity_allocated
        resource.save()
        return super().destroy(request, *args, **kwargs)