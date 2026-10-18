from django.contrib import admin
from .models import PerformanceReview, ProfessionalDevelopmentActivity, StaffActivityRegistration, Publication, LeaveRequest, PayrollRecord

@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ['staff_member', 'rating', 'review_period_start', 'review_period_end', 'reviewer', 'created_at']
    list_filter = ['rating', 'created_at', 'staff_member__user_type']
    search_fields = ['staff_member__username', 'staff_member__first_name', 'staff_member__last_name', 'comments']
    date_hierarchy = 'created_at'

@admin.register(ProfessionalDevelopmentActivity)
class ProfessionalDevelopmentActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'activity_type', 'start_date', 'end_date', 'created_by', 'created_at']
    list_filter = ['activity_type', 'start_date']
    search_fields = ['title', 'description']

@admin.register(StaffActivityRegistration)
class StaffActivityRegistrationAdmin(admin.ModelAdmin):
    list_display = ['staff', 'activity', 'status', 'registered_at', 'updated_at']
    list_filter = ['status', 'registered_at']
    search_fields = ['staff__username', 'activity__title']

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ['title', 'journal', 'publication_date', 'status', 'submitted_by', 'submitted_at']
    list_filter = ['status', 'publication_date', 'submitted_at']
    search_fields = ['title', 'authors', 'journal', 'doi']

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['staff', 'leave_type', 'start_date', 'end_date', 'status', 'created_at']
    list_filter = ['status', 'leave_type', 'created_at']
    search_fields = ['staff__username', 'reason']

@admin.register(PayrollRecord)
class PayrollRecordAdmin(admin.ModelAdmin):
    list_display = ['staff_member', 'salary', 'payment_period_start', 'payment_period_end', 'deductions', 'net_amount', 'status', 'payment_date']
    list_filter = ['status', 'payment_period_start']
    search_fields = ['staff_member__username', 'staff_member__first_name', 'staff_member__last_name']
    readonly_fields = ['payment_date', 'created_at', 'updated_at']
