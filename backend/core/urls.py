# backend/core/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    AdminCreateUserView,
    UserListView,
    UserDetailView,
    CurrentUserProfileView,
    ChangePasswordView,
    FirstLoginPasswordChangeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ResetPasswordFlagView,
    LogoutView,
    DepartmentListCreateView,
    DepartmentDetailView,
    StudentListView,
    ApplicationCreateView,
    ApplicationListView,
    ApplicationDetailView,
)

app_name = 'core'

urlpatterns = [
    # Authentication
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # Password Management
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/first-login-password-change/', FirstLoginPasswordChangeView.as_view(), name='first_login_password_change'),
    path('auth/password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('users/<int:user_id>/toggle-reset-password/', ResetPasswordFlagView.as_view(), name='toggle_reset_password'),
    
    # User Management (Admin)
    path('users/create/', AdminCreateUserView.as_view(), name='admin_create_user'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    
    # Departments
    path('departments/', DepartmentListCreateView.as_view(), name='department_list_create'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department_detail'),
    
    # Current User Profile
    path('profile/', CurrentUserProfileView.as_view(), name='current_user_profile'),
    
    # Students (for parent linking)
    path('students/', StudentListView.as_view(), name='student_list'),
    
    # Applications
    path('applications/', ApplicationListView.as_view(), name='application_list'),
    path('applications/submit/', ApplicationCreateView.as_view(), name='application_submit'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application_detail'),
]