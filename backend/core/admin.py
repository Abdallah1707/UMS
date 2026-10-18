from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department, Attribute, User_Attribute, Application

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'user_id', 'is_first_login', 'date_joined', 'Resetpassword']
    list_filter = ['user_type', 'is_first_login', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'user_id']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('User Type', {'fields': ('user_type', 'user_id')}),
        ('Staff Info', {'fields': ('department',)}),
        ('Additional Info', {'fields': ('phone_number', 'is_first_login', 'password_changed_at', 'Resetpassword')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('User Type', {'fields': ('user_type',)}),
        ('Staff Info', {'fields': ('department',)}),
    )
    
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'description']
    search_fields = ['name', 'code', 'description']

@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = ['attribute_name', 'data_type']
    search_fields = ['attribute_name']
    list_filter = ['data_type']

@admin.register(User_Attribute)
class UserAttributeAdmin(admin.ModelAdmin):
    list_display = ['user', 'attribute', 'get_value']
    list_filter = ['attribute']
    search_fields = ['user__username', 'attribute__attribute_name']
    
    def get_value(self, obj):
        if obj.attribute.data_type == 'text':
            return obj.value_string
        elif obj.attribute.data_type == 'number':
            return obj.value_int
        elif obj.attribute.data_type == 'date':
            return obj.value_date
        elif obj.attribute.data_type == 'boolean':
            return obj.value_boolean
    get_value.short_description = 'Value'

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['reference_number', 'first_name', 'last_name', 'email', 'program', 'status', 'submitted_at']
    list_filter = ['status', 'program', 'submitted_at']
    search_fields = ['reference_number', 'first_name', 'last_name', 'email']
    readonly_fields = ['reference_number', 'submitted_at']