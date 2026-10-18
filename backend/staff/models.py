from django.db import models
from core.models import User
import uuid

class PerformanceReview(models.Model):
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Below Average'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]
    
    staff_member = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reviews_given')
    rating = models.IntegerField(choices=RATING_CHOICES)
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    comments = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.staff_member.username} - {self.get_rating_display()} ({self.review_period_start} to {self.review_period_end})"


class ProfessionalDevelopmentActivity(models.Model):
    ACTIVITY_TYPES = [
        ('workshop', 'Workshop'),
        ('conference', 'Conference'),
        ('certification', 'Certification'),
    ]
    
    title = models.CharField(max_length=200)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    max_capacity = models.IntegerField(default=0, help_text="0 means unlimited")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_activities')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} ({self.activity_type})"
    
    def is_full(self):
        if self.max_capacity == 0:
            return False
        return self.registrations.filter(status__in=['planned', 'completed']).count() >= self.max_capacity
    
    class Meta:
        ordering = ['-start_date']
        verbose_name_plural = 'Professional Development Activities'


class StaffActivityRegistration(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_registrations')
    activity = models.ForeignKey(ProfessionalDevelopmentActivity, on_delete=models.CASCADE, related_name='registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    feedback = models.TextField(blank=True, help_text="Staff feedback after completion")
    certificate_issued = models.BooleanField(default=False)
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('staff', 'activity')
        ordering = ['-registered_at']
    
    def __str__(self):
        return f"{self.staff.username} - {self.activity.title} ({self.status})"


class Publication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    title = models.CharField(max_length=500)
    authors = models.TextField(help_text="Comma-separated list of authors")
    journal = models.CharField(max_length=300)
    publication_date = models.DateField()
    doi = models.CharField(max_length=200, unique=True, blank=True)
    url = models.URLField(max_length=500, blank=True, help_text="Link to the publication")
    pdf_file = models.FileField(upload_to='publications/', blank=True, null=True, help_text="Upload publication PDF")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='publications')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_publications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.doi:
            self.doi = f"10.{uuid.uuid4().hex[:8]}/{uuid.uuid4().hex[:12]}"
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-publication_date']
    
    def __str__(self):
        return f"{self.title} - {self.status}"


class LeaveRequest(models.Model):
    LEAVE_TYPES = [
        ('sick', 'Sick Leave'),
        ('vacation', 'Vacation'),
        ('personal', 'Personal Leave'),
        ('emergency', 'Emergency Leave'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_leaves')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.staff.username} - {self.get_leave_type_display()} ({self.status})"


class PayrollRecord(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]
    
    staff_member = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type__in': ['professor', 'ta']})
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    payment_period_start = models.DateField()
    payment_period_end = models.DateField()
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def net_amount(self):
        return self.salary - self.deductions
    
    def __str__(self):
        return f"{self.staff_member.username} - {self.payment_period_start} to {self.payment_period_end}"
    
    class Meta:
        ordering = ['-payment_period_start']
