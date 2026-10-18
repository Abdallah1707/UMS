from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum
from django.utils import timezone
from .models import PerformanceReview, ProfessionalDevelopmentActivity, StaffActivityRegistration, Publication, LeaveRequest, PayrollRecord
from .serializers import PerformanceReviewSerializer, ProfessionalDevelopmentActivitySerializer, StaffActivityRegistrationSerializer, PublicationSerializer, LeaveRequestSerializer, PayrollRecordSerializer
from core.permissions import IsAdmin

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        queryset = PerformanceReview.objects.all()
        user = self.request.user
        
        # Staff members can only see their own reviews
        if user.user_type in ['professor', 'ta']:
            queryset = queryset.filter(staff_member=user)
        
        # Filter by staff member
        staff_id = self.request.query_params.get('staff_member', None)
        if staff_id:
            queryset = queryset.filter(staff_member_id=staff_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(review_period_start__gte=start_date)
        if end_date:
            queryset = queryset.filter(review_period_end__lte=end_date)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_reviews(self, request):
        reviews = PerformanceReview.objects.filter(staff_member=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


class ProfessionalDevelopmentActivityViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalDevelopmentActivity.objects.all()
    serializer_class = ProfessionalDevelopmentActivitySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        queryset = ProfessionalDevelopmentActivity.objects.all()
        activity_type = self.request.query_params.get('activity_type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class StaffActivityRegistrationViewSet(viewsets.ModelViewSet):
    queryset = StaffActivityRegistration.objects.all()
    serializer_class = StaffActivityRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['professor', 'ta']:
            return StaffActivityRegistration.objects.filter(staff=user)
        return StaffActivityRegistration.objects.all()
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.data.get('status') == 'cancelled':
            instance.delete()
            return Response({'message': 'Registration cancelled and removed'}, status=status.HTTP_200_OK)
        return super().update(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'error': 'Only staff members can register'}, status=status.HTTP_403_FORBIDDEN)
        
        activity_id = request.data.get('activity')
        try:
            activity = ProfessionalDevelopmentActivity.objects.get(id=activity_id)
            if activity.is_full():
                return Response({'error': 'Activity is full'}, status=status.HTTP_400_BAD_REQUEST)
        except ProfessionalDevelopmentActivity.DoesNotExist:
            return Response({'error': 'Activity not found'}, status=status.HTTP_404_NOT_FOUND)
        
        existing = StaffActivityRegistration.objects.filter(staff=request.user, activity_id=activity_id).first()
        if existing:
            return Response({'error': 'Already registered for this activity'}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(staff=self.request.user)
    
    @action(detail=True, methods=['post'])
    def issue_certificate(self, request, pk=None):
        registration = self.get_object()
        if registration.status != 'completed':
            return Response({'error': 'Can only issue certificate for completed activities'}, status=status.HTTP_400_BAD_REQUEST)
        registration.certificate_issued = True
        registration.save()
        return Response({'message': 'Certificate issued successfully'})
    
    @action(detail=False, methods=['get'])
    def my_development(self, request):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'error': 'Only staff members can access this'}, status=status.HTTP_403_FORBIDDEN)
        registrations = StaffActivityRegistration.objects.filter(staff=request.user)
        completed = registrations.filter(status='completed')
        planned = registrations.filter(status='planned')
        
        return Response({
            'completed': StaffActivityRegistrationSerializer(completed, many=True).data,
            'planned': StaffActivityRegistrationSerializer(planned, many=True).data
        })


class PublicationViewSet(viewsets.ModelViewSet):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Publication.objects.all()
        
        # Non-admin users only see approved publications (except their own)
        if user.user_type != 'admin':
            queryset = queryset.filter(Q(status='approved') | Q(submitted_by=user))
        
        # Filter by author
        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(authors__icontains=author)
        
        # Filter by year
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(publication_date__year=year)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'error': 'Only faculty members can submit publications'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user, status='pending')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        publication = self.get_object()
        publication.status = 'approved'
        publication.reviewed_by = request.user
        publication.reviewed_at = timezone.now()
        publication.save()
        return Response({'message': 'Publication approved', 'publication': PublicationSerializer(publication).data})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        publication = self.get_object()
        publication.status = 'rejected'
        publication.reviewed_by = request.user
        publication.reviewed_at = timezone.now()
        publication.save()
        return Response({'message': 'Publication rejected', 'publication': PublicationSerializer(publication).data})


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            queryset = LeaveRequest.objects.all()
            staff_id = self.request.query_params.get('staff')
            status_filter = self.request.query_params.get('status')
            if staff_id:
                queryset = queryset.filter(staff_id=staff_id)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset
        return LeaveRequest.objects.filter(staff=user)
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'error': 'Only staff members can submit leave requests'}, status=status.HTTP_403_FORBIDDEN)
        
        pending = LeaveRequest.objects.filter(staff=request.user, status='pending').exists()
        if pending:
            return Response({'error': 'You already have a pending leave request'}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(staff=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.reviewed_by = request.user
        leave_request.reviewed_at = timezone.now()
        leave_request.save()
        return Response({'message': 'Leave request approved'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.reviewed_by = request.user
        leave_request.reviewed_at = timezone.now()
        leave_request.save()
        return Response({'message': 'Leave request rejected'})


class PayrollRecordViewSet(viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.all()
    serializer_class = PayrollRecordSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'create', 'update', 'partial_update', 'process_payroll', 'report']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            queryset = PayrollRecord.objects.all()
            staff_id = self.request.query_params.get('staff_id')
            status_filter = self.request.query_params.get('status')
            if staff_id:
                queryset = queryset.filter(staff_member_id=staff_id)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset
        return PayrollRecord.objects.filter(staff_member=user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def process_payroll(self, request, pk=None):
        payroll = self.get_object()
        if payroll.status == 'paid':
            return Response({'error': 'This payroll record has already been processed.'}, status=status.HTTP_400_BAD_REQUEST)
        payroll.status = 'paid'
        payroll.payment_date = timezone.now()
        payroll.save()
        return Response({'message': 'Payroll processed successfully', 'data': PayrollRecordSerializer(payroll).data})
    
    @action(detail=False, methods=['get'])
    def my_history(self, request):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'error': 'Only staff members can access this'}, status=status.HTTP_403_FORBIDDEN)
        payrolls = PayrollRecord.objects.filter(staff_member=request.user)
        serializer = self.get_serializer(payrolls, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def report(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all payroll records for debugging
        all_payrolls = PayrollRecord.objects.all()
        print(f"Query range: {start_date} to {end_date}")
        print(f"Total payroll records: {all_payrolls.count()}")
        for p in all_payrolls:
            print(f"Record {p.id}: {p.payment_period_start} to {p.payment_period_end}")
        
        payrolls = PayrollRecord.objects.filter(
            Q(payment_period_start__lte=end_date) & Q(payment_period_end__gte=start_date)
        )
        print(f"Filtered records: {payrolls.count()}")
        
        total_salary = payrolls.aggregate(Sum('salary'))['salary__sum'] or 0
        total_deductions = payrolls.aggregate(Sum('deductions'))['deductions__sum'] or 0
        total_net = sum(p.net_amount for p in payrolls)
        
        return Response({
            'period': {'start': start_date, 'end': end_date},
            'total_records': payrolls.count(),
            'total_salary': total_salary,
            'total_deductions': total_deductions,
            'total_net_amount': total_net,
            'records': PayrollRecordSerializer(payrolls, many=True).data
        })
