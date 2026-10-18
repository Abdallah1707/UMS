from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
import secrets
from datetime import timedelta
from django.utils import timezone

# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class Application(models.Model):
    STATUS_CHOICES = [
        ('in_review', 'In Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    program = models.ForeignKey(Department, on_delete=models.CASCADE)
    school_name = models.CharField(max_length=200)
    transcript = models.FileField(upload_to='applications/transcripts/')
    id_copy = models.FileField(upload_to='applications/ids/')
    photo = models.ImageField(upload_to='applications/photos/')
    parent_first_name = models.CharField(max_length=100)
    parent_last_name = models.CharField(max_length=100)
    parent_email = models.EmailField()
    parent_phone = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_review')
    reference_number = models.CharField(max_length=50, unique=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.reference_number}"
    
    class Meta:
        ordering = ['-submitted_at']

class Attribute(models.Model):
    DATA_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('boolean', 'Boolean'),
    ]

    attribute_name = models.CharField(max_length=100, unique=True)
    data_type = models.CharField(max_length=50, choices=DATA_TYPES)
    
    def __str__(self):
        return self.attribute_name


class User_Attribute(models.Model):    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='attributes')
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)
    value_string = models.CharField(max_length=255, blank=True, null=True)
    value_int = models.IntegerField(blank=True, null=True)
    value_date = models.DateField(blank=True, null=True)
    value_boolean = models.BooleanField(blank=True, null=True)
    
    class Meta:
        unique_together = ('user', 'attribute')
    
    def __str__(self):
        return f"{self.user.username} - {self.attribute.attribute_name}"


    
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('student', 'Student'),
        ('professor', 'Professor'),
        ('ta', 'Teaching Assistant'),
        ('parent', 'Parent'),
    ]

    phone_validator = RegexValidator(
        regex=r'^(010|012|011|015)\d{8}$',
        message="Phone number must be 11 digits starting with 010, 012, 011, or 015."
    )
    
    user_type = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True, validators=[phone_validator])
    user_id = models.CharField(max_length=50, unique=True, blank=True)
    
    # Password management
    is_first_login = models.BooleanField(default=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    Resetpassword = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.user_id:
            self.user_id = self.generate_user_id()
        super().save(*args, **kwargs)
    
    def generate_user_id(self):
        role_prefixes = {
            'admin': 'AD',
            'student': 'ST',
            'professor': 'PR',
            'ta': 'TA',
            'parent': 'PA'
        }
        prefix = role_prefixes.get(self.user_type, 'US')
        
        # Get the highest number for this role
        last_user = User.objects.filter(
            user_id__startswith=prefix
        ).order_by('user_id').last()
        
        if last_user and last_user.user_id:
            try:
                last_number = int(last_user.user_id[2:])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
            
        return f"{prefix}{new_number:04d}"
    
    def get_attribute(self, attr_name):
        """Get dynamic attribute value"""
        try:
            attr = Attribute.objects.get(attribute_name=attr_name)
            user_attr = User_Attribute.objects.get(user=self, attribute=attr)
            
            if attr.data_type == 'text':
                return user_attr.value_string
            elif attr.data_type == 'number':
                return user_attr.value_int
            elif attr.data_type == 'date':
                return user_attr.value_date
            elif attr.data_type == 'boolean':
                return user_attr.value_boolean
        except (Attribute.DoesNotExist, User_Attribute.DoesNotExist):
            return None
    
    def set_attribute(self, attr_name, attr_value, data_type='text'):
        """Set dynamic attribute value"""
        attr, _ = Attribute.objects.get_or_create(
            attribute_name=attr_name,
            defaults={'data_type': data_type}
        )
        
        user_attr, _ = User_Attribute.objects.get_or_create(
            user=self,
            attribute=attr
        )
        
        if attr.data_type == 'text':
            user_attr.value_string = str(attr_value)
        elif attr.data_type == 'number':
            user_attr.value_int = int(attr_value)
        elif attr.data_type == 'date':
            user_attr.value_date = attr_value
        elif attr.data_type == 'boolean':
            user_attr.value_boolean = bool(attr_value)
        
        user_attr.save()
        return user_attr
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"
    
    def get_user_id(self):
        return self.user_id

    def get_user_department_code(self):
        return self.department.code if self.department else None
    class Meta:
        ordering = ['-date_joined']


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)
    
    def is_valid(self):
        return not self.used and timezone.now() < self.expires_at
    
    def __str__(self):
        return f"Reset token for {self.user.username}"
    
    class Meta:
        ordering = ['-created_at']