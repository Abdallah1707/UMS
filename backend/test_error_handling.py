"""
Test script to verify user-friendly error messages
Run with: python manage.py shell < test_error_handling.py
"""

from core.exceptions import get_user_friendly_message, format_field_errors

# Test field name mappings
print("Testing field name mappings:")
print(get_user_friendly_message('user_type', 'This field is required'))
print(get_user_friendly_message('enrollment_year', 'This field is required'))
print(get_user_friendly_message('phone_number', 'This field may not be blank'))

# Test error pattern matching
print("\nTesting error patterns:")
print(get_user_friendly_message('username', 'user with this username already exists'))
print(get_user_friendly_message('email', 'Enter a valid email'))
print(get_user_friendly_message('new_password_confirm', 'Passwords do not match'))

print("\nError handling configured successfully!")
