from django.contrib import admin
from .models import Course, CourseRegistration, Assignment, Grade, Submission

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'course_type', 'department', 'credits', 'has_lab', 'is_active', 'registration_open']
    list_filter = ['course_type', 'department', 'is_active', 'has_lab', 'registration_open']
    search_fields = ['code', 'name', 'description']
    filter_horizontal = ['instructors']

@admin.register(CourseRegistration)
class CourseRegistrationAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'registered_at']
    list_filter = ['course', 'registered_at']
    search_fields = ['student__username', 'course__code']

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'assignment_type', 'due_date', 'created_by', 'created_at']
    list_filter = ['assignment_type', 'course', 'due_date', 'created_at']
    search_fields = ['title', 'description', 'course__code']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'assignment', 'grade', 'submitted_at', 'updated_at']
    list_filter = ['assignment__course', 'submitted_at']
    search_fields = ['student__username', 'assignment__title']
    readonly_fields = ['submitted_at', 'updated_at']

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'midterm', 'project', 'coursework', 'final_grade', 'updated_at']
    list_filter = ['course', 'final_grade']
    search_fields = ['student__username', 'student__student_id', 'course__code']
    readonly_fields = ['created_at', 'updated_at']