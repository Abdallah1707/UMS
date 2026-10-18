from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from community.email_service import EmailService
from .serializers import (
    UserSerializer, 
    AdminCreateUserSerializer,
    ChangePasswordSerializer,
    FirstLoginPasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    DepartmentSerializer,
    ApplicationSerializer
)
from .models import Department, PasswordResetToken, Application
from .permissions import IsAdmin, IsOwnerOrAdmin
import uuid

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom user data to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'user_type': self.user.user_type,
            'is_first_login': self.user.is_first_login,
        }
        
        return data
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class AdminCreateUserView(generics.CreateAPIView):
    """Admin-only endpoint to create new users"""
    queryset = User.objects.all()
    serializer_class = AdminCreateUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Get the default password for response
        default_password = f"{user.username}123"
        
        # Send welcome email with temporary password
        try:
            EmailService.send_welcome_email(user, default_password)
        except Exception as e:
            # Log error but don't fail user creation
            print(f"Failed to send welcome email: {str(e)}")
        
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'default_password': default_password,
            'note': 'User must change password on first login'
        }, status=status.HTTP_201_CREATED)
        
class UserListView(generics.ListAPIView):
    """Admin can view all users"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        queryset = User.objects.all()
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        return queryset

class DepartmentListView(generics.ListAPIView):
    """Get all departments"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View/Update/Delete specific user (admin or owner)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    """Get/Update current logged-in user's profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
class ChangePasswordView(views.APIView):
    """Change password for logged-in user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'errors': {'old_password': ['The current password you entered is incorrect.']}},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.is_first_login = False
            user.password_changed_at = timezone.now()
            user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FirstLoginPasswordChangeView(views.APIView):
    """Force password change on first login"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if not user.is_first_login:
            return Response(
                {'errors': {'detail': ['Your password has already been changed.']}},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = FirstLoginPasswordChangeSerializer(data=request.data)
        
        if serializer.is_valid():
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.is_first_login = False
            user.password_changed_at = timezone.now()
            user.save()
            
            return Response({
                'message': 'Password changed successfully. Please login again with your new password.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetRequestView(views.APIView):
    """Request password reset - sends email with reset link"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                # Create reset token
                reset_token = PasswordResetToken.objects.create(user=user)
                
                # Send email with reset link
                try:
                    EmailService.send_password_reset_email(user, reset_token.token)
                except Exception as e:
                    print(f"Failed to send password reset email: {str(e)}")
                    return Response({
                        'errors': {'detail': ['Failed to send email. Please try again later.']}
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            except User.DoesNotExist:
                pass  # Don't reveal if email exists
            
            # Always return success for security
            return Response({
                'message': 'If an account with that email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(views.APIView):
    """Confirm password reset with token"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                reset_token = PasswordResetToken.objects.get(token=token)
                
                if not reset_token.is_valid():
                    return Response({
                        'errors': {'token': ['This reset link has expired or been used. Please request a new one.']}
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Reset password
                user = reset_token.user
                user.set_password(new_password)
                user.is_first_login = False
                user.password_changed_at = timezone.now()
                user.save()
                
                # Mark token as used
                reset_token.used = True
                reset_token.save()
                
                return Response({
                    'message': 'Password reset successfully. You can now login with your new password.'
                }, status=status.HTTP_200_OK)
                
            except PasswordResetToken.DoesNotExist:
                return Response({
                    'errors': {'token': ['Invalid reset link.']}
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordFlagView(views.APIView):
    """Admin can toggle reset password flag for a user"""
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            user.Resetpassword = not user.Resetpassword
            user.save()
            
            return Response({
                'message': 'Reset password flag updated successfully',
                'Resetpassword': user.Resetpassword
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'errors': {'detail': ['User not found.']}},
                status=status.HTTP_404_NOT_FOUND
            )

class LogoutView(views.APIView):
    """Logout by blacklisting refresh token"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {'errors': {'refresh_token': ['Refresh token is required to logout.']}},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'errors': {'detail': ['Unable to logout. Please try again.']}},
                status=status.HTTP_400_BAD_REQUEST
            )

class DepartmentListCreateView(generics.ListCreateAPIView):
    """Get all departments (public for GET, admin for POST)"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdmin()]
        return [AllowAny()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'message': 'Department created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific department (admin only)"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Department updated successfully',
            'data': serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'message': 'Department deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

class StudentListView(generics.ListAPIView):
    """Get all students for parent linking"""
    queryset = User.objects.filter(user_type='student')
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def list(self, request, *args, **kwargs):
        students = User.objects.filter(user_type='student')
        data = [{
            'id': student.id,
            'user_id': student.user_id,
            'email': student.email,
            'full_name': f"{student.first_name} {student.last_name}"
        } for student in students]
        return Response(data)

class ApplicationCreateView(generics.CreateAPIView):
    """Submit application (public)"""
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Generate reference number
        reference_number = f"APP-{uuid.uuid4().hex[:8].upper()}"
        application = serializer.save(reference_number=reference_number)
        
        # Send confirmation email
        try:
            send_mail(
                subject='Application Submitted - University Management System',
                message=f'''Dear {application.first_name} {application.last_name},

Your application has been successfully submitted!

Application Details:
- Reference Number: {application.reference_number}
- Program: {application.program.name}
- Status: In Review
- Submitted: {application.submitted_at.strftime("%Y-%m-%d %H:%M")}

We will review your application and contact you soon.

Best regards,
University Admissions Team''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
        
        return Response({
            'message': 'Application submitted successfully',
            'reference_number': reference_number,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

class ApplicationListView(generics.ListAPIView):
    """Admin view all applications"""
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class ApplicationDetailView(generics.RetrieveUpdateAPIView):
    """Admin view/update application details"""
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        old_status = instance.status
        
        # Prevent status change if already accepted or rejected
        if old_status in ['accepted', 'rejected']:
            return Response(
                {'error': 'Cannot change status of an application that has already been accepted or rejected.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        new_status = serializer.validated_data.get('status', old_status)
        
        # Auto-create student user when accepted
        if new_status == 'accepted':
            try:
                # Generate username and password
                username = f"{instance.first_name.lower()}_{instance.last_name.lower()}"
                password = f"{instance.first_name.lower()}_{instance.reference_number}"
                
                # Create student user
                user = User.objects.create_user(
                    username=username,
                    email=instance.email,
                    first_name=instance.first_name,
                    last_name=instance.last_name,
                    user_type='student',
                    phone_number=instance.phone,
                    department=instance.program,
                    password=password,
                    is_first_login=True
                )
                
                # Set enrollment year to current year
                from datetime import datetime
                user.set_attribute('enrollment_year', datetime.now().year, 'number')
                
                # Create parent account
                parent_username = f"{instance.parent_first_name.lower()}_{instance.parent_last_name.lower()}"
                parent_password = f"{instance.parent_first_name.lower()}_{instance.reference_number}"
                
                parent = User.objects.create_user(
                    username=parent_username,
                    email=instance.parent_email,
                    first_name=instance.parent_first_name,
                    last_name=instance.parent_last_name,
                    user_type='parent',
                    phone_number=instance.parent_phone,
                    password=parent_password,
                    is_first_login=True
                )
                
                # Link parent to student
                parent.set_attribute('linked_student_id', user.user_id, 'text')
                parent.set_attribute('linked_student_email', user.email, 'text')
                
                # Send combined acceptance email with credentials
                EmailService.send_application_accepted_email(instance, username, password, parent_username, parent_password)
                
            except Exception as e:
                print(f"Failed to create user or send emails: {str(e)}")
                return Response(
                    {'error': f'Application accepted but failed to create user account: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Send rejection email
        elif new_status == 'rejected':
            try:
                EmailService.send_application_rejected_email(instance)
            except Exception as e:
                print(f"Failed to send rejection email: {str(e)}")
        
        return Response(serializer.data)
