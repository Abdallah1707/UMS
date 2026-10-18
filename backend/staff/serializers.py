from rest_framework import serializers
from .models import PerformanceReview, ProfessionalDevelopmentActivity, StaffActivityRegistration, Publication, LeaveRequest, PayrollRecord
from core.models import User

class StaffMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'user_type', 'user_id']

class PerformanceReviewSerializer(serializers.ModelSerializer):
    staff_member_details = StaffMemberSerializer(source='staff_member', read_only=True)
    reviewer_details = StaffMemberSerializer(source='reviewer', read_only=True)
    rating_display = serializers.CharField(source='get_rating_display', read_only=True)
    
    class Meta:
        model = PerformanceReview
        fields = ['id', 'staff_member', 'staff_member_details', 'reviewer', 'reviewer_details', 
                  'rating', 'rating_display', 'review_period_start', 'review_period_end', 
                  'comments', 'created_at', 'updated_at']
        read_only_fields = ['reviewer', 'created_at', 'updated_at']
    
    def validate(self, data):
        if data['review_period_start'] > data['review_period_end']:
            raise serializers.ValidationError("Review period start date must be before end date")
        
        staff_member = data.get('staff_member')
        if staff_member.user_type not in ['professor', 'ta']:
            raise serializers.ValidationError("Performance reviews can only be created for professors and teaching assistants")
        
        return data


class ProfessionalDevelopmentActivitySerializer(serializers.ModelSerializer):
    created_by_details = StaffMemberSerializer(source='created_by', read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    current_registrations = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfessionalDevelopmentActivity
        fields = ['id', 'title', 'activity_type', 'description', 'start_date', 'end_date', 'max_capacity', 'created_by', 'created_by_details', 'created_at', 'is_full', 'current_registrations']
        read_only_fields = ['created_by', 'created_at']
    
    def get_current_registrations(self, obj):
        return obj.registrations.filter(status__in=['planned', 'completed']).count()
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Start date must be before end date")
        if data.get('max_capacity', 0) < 0:
            raise serializers.ValidationError("Capacity cannot be negative")
        return data


class StaffActivityRegistrationSerializer(serializers.ModelSerializer):
    activity_details = ProfessionalDevelopmentActivitySerializer(source='activity', read_only=True)
    staff_details = StaffMemberSerializer(source='staff', read_only=True)
    
    class Meta:
        model = StaffActivityRegistration
        fields = ['id', 'staff', 'staff_details', 'activity', 'activity_details', 'status', 'feedback', 'certificate_issued', 'registered_at', 'updated_at']
        read_only_fields = ['staff', 'registered_at', 'updated_at', 'certificate_issued']
    
    def validate(self, data):
        if self.context.get('request'):
            staff = self.context['request'].user
            if staff.user_type not in ['professor', 'ta']:
                raise serializers.ValidationError("Only staff members can register for activities")
        return data


class PublicationSerializer(serializers.ModelSerializer):
    submitted_by_details = StaffMemberSerializer(source='submitted_by', read_only=True)
    reviewed_by_details = StaffMemberSerializer(source='reviewed_by', read_only=True)
    pdf_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Publication
        fields = ['id', 'title', 'authors', 'journal', 'publication_date', 'doi', 'url', 'pdf_file', 'pdf_file_url', 'status', 
                  'submitted_by', 'submitted_by_details', 'submitted_at', 'reviewed_by', 
                  'reviewed_by_details', 'reviewed_at']
        read_only_fields = ['submitted_by', 'submitted_at', 'reviewed_by', 'reviewed_at', 'status', 'doi']
    
    def get_pdf_file_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None
    
    def validate(self, data):
        url = data.get('url')
        pdf_file = data.get('pdf_file')
        
        if not url and not pdf_file:
            raise serializers.ValidationError("Either URL or PDF file must be provided")
        
        return data


class LeaveRequestSerializer(serializers.ModelSerializer):
    staff_details = StaffMemberSerializer(source='staff', read_only=True)
    reviewed_by_details = StaffMemberSerializer(source='reviewed_by', read_only=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = ['id', 'staff', 'staff_details', 'leave_type', 'leave_type_display', 'start_date', 'end_date', 
                  'reason', 'status', 'status_display', 'reviewed_by', 'reviewed_by_details', 'reviewed_at', 'created_at']
        read_only_fields = ['staff', 'status', 'reviewed_by', 'reviewed_at', 'created_at']
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("Start date must be before or equal to end date")
        return data


class PayrollRecordSerializer(serializers.ModelSerializer):
    staff_member_name = serializers.CharField(source='staff_member.get_full_name', read_only=True)
    staff_member_id = serializers.CharField(source='staff_member.user_id', read_only=True)
    net_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = PayrollRecord
        fields = ['id', 'staff_member', 'staff_member_name', 'staff_member_id', 'salary', 
                  'payment_period_start', 'payment_period_end', 'deductions', 'net_amount',
                  'status', 'payment_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'payment_date', 'created_at', 'updated_at']
    
    def validate_staff_member(self, value):
        if value.user_type not in ['professor', 'ta']:
            raise serializers.ValidationError('Payroll records can only be created for professors and teaching assistants.')
        return value
