from django.db import models
from core.models import User, Department

class MaintenanceTicket(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_tickets')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.status}"
    
    class Meta:
        ordering = ['-created_at']

class Classroom(models.Model):
    name = models.CharField(max_length=100, unique=True)
    building = models.CharField(max_length=100)
    floor = models.IntegerField()
    capacity = models.IntegerField()
    has_projector = models.BooleanField(default=False)
    has_whiteboard = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    time_from = models.TimeField(null=True, blank=True)
    time_to = models.TimeField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text="Duration in minutes")

    def __str__(self):
        return f"{self.name} - {self.building}"

    class Meta:
        ordering = ['building', 'floor', 'name']

class Booking(models.Model):
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='bookings')
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    time_from = models.TimeField()
    time_to = models.TimeField()
    purpose = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.classroom.name} - {self.staff.username} - {self.date}"

    class Meta:
        ordering = ['-date', '-time_from']
        unique_together = ['classroom', 'date', 'time_from', 'time_to']

class Resource(models.Model):
    RESOURCE_TYPE_CHOICES = [
        ('equipment', 'Equipment'),
        ('software', 'Software'),
    ]
    
    name = models.CharField(max_length=200)
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPE_CHOICES)
    description = models.TextField(blank=True)
    quantity = models.IntegerField(default=1)
    available = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.resource_type})"
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'resource_type']

class ResourceAllocation(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='allocations')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='resource_allocations')
    quantity_allocated = models.IntegerField(default=1)
    allocated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.resource.name} -> {self.department.name}"
    
    class Meta:
        ordering = ['-allocated_at']
        unique_together = ['resource', 'department']