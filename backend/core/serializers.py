from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Department, Application

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    enrollment_year = serializers.SerializerMethodField()
    hire_date = serializers.SerializerMethodField()
    linked_student_id = serializers.SerializerMethodField()
    linked_student_email = serializers.SerializerMethodField()
    phone_number = serializers.CharField(
        max_length=15, 
        required=False, 
        allow_blank=True,
        help_text="Phone number must be 11 digits starting with 010, 012, 011, or 015."
    )
    department = serializers.CharField(source='get_user_department_code', read_only=True)
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'user_type', 'phone_number', 'user_id',
            'department', 'enrollment_year', 'hire_date', 'is_first_login',
            'linked_student_id', 'linked_student_email'
        )
        read_only_fields = ('id', 'user_id', 'is_first_login')
    
    def validate_phone_number(self, value):
        if value:
            import re
            if not re.match(r'^(010|012|011|015)\d{8}$', value):
                raise serializers.ValidationError(
                    "Phone number must be 11 digits starting with 010, 012, 011, or 015."
                )
        return value
    
    def get_enrollment_year(self, obj):
        return obj.get_attribute('enrollment_year')
    
    def get_hire_date(self, obj):
        return obj.get_attribute('hire_date')
    
    def get_linked_student_id(self, obj):
        return obj.get_attribute('linked_student_id')
    
    def get_linked_student_email(self, obj):
        return obj.get_attribute('linked_student_email')
    
    def update(self, instance, validated_data):
        enrollment_year = self.initial_data.get('enrollment_year')
        hire_date = self.initial_data.get('hire_date')
        
        if enrollment_year:
            instance.set_attribute('enrollment_year', enrollment_year, 'number')
        if hire_date:
            instance.set_attribute('hire_date', hire_date, 'date')
        
        return super().update(instance, validated_data)
        
class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    enrollment_year = serializers.IntegerField(required=False, write_only=True)
    hire_date = serializers.DateField(required=False, write_only=True)
    phone_number = serializers.CharField(
        max_length=15, 
        required=False, 
        allow_blank=True,
        help_text="Phone number must be 11 digits starting with 010, 012, 011, or 015."
    )
    
    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'first_name', 'last_name',
            'user_type', 'phone_number', 'department', 'enrollment_year', 'hire_date'
        )
    
    def validate_phone_number(self, value):
        if value:
            import re
            if not re.match(r'^(010|012|011|015)\d{8}$', value):
                raise serializers.ValidationError(
                    "Phone number must be 11 digits starting with 010, 012, 011, or 015."
                )
        return value
        
    def validate(self, attrs):
        user_type = attrs.get('user_type')
        
        if not user_type:
            raise serializers.ValidationError({
                'user_type': 'Please select a user role.'
            })
        
        # Validate student-specific fields
        if user_type == 'student':
            if not attrs.get('enrollment_year'):
                raise serializers.ValidationError({
                    'enrollment_year': 'Please provide the enrollment year for this student.'
                })
        
        # Validate staff-specific fields
        if user_type in ['professor', 'ta']:
            if not attrs.get('hire_date'):
                raise serializers.ValidationError({
                    'hire_date': 'Please provide the hire date for this staff member.'
                })
            if not attrs.get('department'):
                raise serializers.ValidationError({
                    'department': 'Please select a department for this staff member.'
                })
        
        return attrs
    
    def create(self, validated_data):
        enrollment_year = validated_data.pop('enrollment_year', None)
        hire_date = validated_data.pop('hire_date', None)
        password = validated_data.pop('password', None)
        
        if not password:
            password = f"{validated_data['username']}123"
        
        user = User.objects.create_user(
            password=password,
            is_first_login=True,
            **validated_data
        )
        
        if enrollment_year:
            user.set_attribute('enrollment_year', enrollment_year, 'number')
        if hire_date:
            user.set_attribute('hire_date', hire_date, 'date')
        
        return user
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'The passwords you entered do not match. Please try again.'
            })
        return attrs
    
class FirstLoginPasswordChangeSerializer(serializers.Serializer):
    """Used when user logs in for the first time"""
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'The passwords you entered do not match. Please try again.'
            })
        return attrs

class PasswordResetRequestSerializer(serializers.Serializer):
    """Request password reset via email"""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Confirm password reset with token"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        return attrs


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department CRUD operations"""
    class Meta:
        model = Department
        fields = ('id', 'name', 'code', 'description')
        read_only_fields = ('id',)

class ApplicationSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    transcript_url = serializers.SerializerMethodField()
    id_copy_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ('id', 'first_name', 'last_name', 'email', 'phone', 'program', 'program_name', 
                  'school_name', 'parent_first_name', 'parent_last_name', 'parent_email', 'parent_phone',
                  'transcript', 'id_copy', 'photo', 'transcript_url', 'id_copy_url', 
                  'photo_url', 'status', 'reference_number', 'submitted_at')
        read_only_fields = ('id', 'reference_number', 'submitted_at')
    
    def get_transcript_url(self, obj):
        if obj.transcript:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.transcript.url)
            return obj.transcript.url
        return None
    
    def get_id_copy_url(self, obj):
        if obj.id_copy:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.id_copy.url)
            return obj.id_copy.url
        return None
    
    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None