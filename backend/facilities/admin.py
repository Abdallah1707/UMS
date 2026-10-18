from django.contrib import admin
from .models import Classroom, Booking, MaintenanceTicket, Resource, ResourceAllocation

@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['name', 'building', 'floor', 'capacity', 'time_from', 'time_to', 'duration', 'is_available']
    list_filter = ['building', 'floor', 'is_available']
    search_fields = ['name', 'building']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['classroom', 'staff', 'date', 'time_from', 'time_to', 'created_at']
    list_filter = ['date', 'classroom', 'staff']
    search_fields = ['classroom__name', 'staff__username', 'purpose']

@admin.register(MaintenanceTicket)
class MaintenanceTicketAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'location', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'description', 'location', 'user__username']

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'resource_type', 'quantity', 'created_at']
    list_filter = ['resource_type', 'created_at']
    search_fields = ['name', 'description']

@admin.register(ResourceAllocation)
class ResourceAllocationAdmin(admin.ModelAdmin):
    list_display = ['resource', 'department', 'quantity_allocated', 'allocated_at']
    list_filter = ['department', 'allocated_at']
    search_fields = ['resource__name', 'department__name', 'notes']