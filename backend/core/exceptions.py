from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data = format_error_response(response.data, response.status_code)
    else:
        # Handle Django exceptions not caught by DRF
        if isinstance(exc, DjangoValidationError):
            response = Response(
                format_error_response({'error': exc.messages}, status.HTTP_400_BAD_REQUEST),
                status=status.HTTP_400_BAD_REQUEST
            )
        elif isinstance(exc, IntegrityError):
            response = Response(
                format_error_response({'error': 'This record already exists or violates database constraints.'}, 
                                    status.HTTP_400_BAD_REQUEST),
                status=status.HTTP_400_BAD_REQUEST
            )
    
    return response

def format_error_response(errors, status_code):
    """Convert technical errors to user-friendly messages"""
    if isinstance(errors, dict):
        formatted = {}
        for field, messages in errors.items():
            formatted[field] = format_field_errors(field, messages)
        return {'errors': formatted}
    elif isinstance(errors, list):
        return {'errors': {'detail': [str(e) for e in errors]}}
    else:
        return {'errors': {'detail': [str(errors)]}}

def format_field_errors(field, messages):
    """Format field-specific errors with user-friendly messages"""
    if isinstance(messages, list):
        return [get_user_friendly_message(field, str(msg)) for msg in messages]
    return [get_user_friendly_message(field, str(messages))]

def get_user_friendly_message(field, message):
    """Map technical field names and messages to user-friendly ones"""
    
    # Field name mappings
    field_map = {
        'user_type': 'User Role',
        'phone_number': 'Phone Number',
        'enrollment_year': 'Enrollment Year',
        'hire_date': 'Hire Date',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'old_password': 'Current Password',
        'new_password': 'New Password',
        'new_password_confirm': 'Password Confirmation',
        'refresh_token': 'Refresh Token',
    }
    
    # Common error message patterns
    error_patterns = {
        'This field is required': f'{field_map.get(field, field.replace("_", " ").title())} is required.',
        'required': f'{field_map.get(field, field.replace("_", " ").title())} is required.',
        'This field may not be blank': f'{field_map.get(field, field.replace("_", " ").title())} cannot be empty.',
        'blank': f'{field_map.get(field, field.replace("_", " ").title())} cannot be empty.',
        'This field may not be null': f'{field_map.get(field, field.replace("_", " ").title())} is required.',
        'null': f'{field_map.get(field, field.replace("_", " ").title())} is required.',
        'user with this username already exists': 'This username is already taken. Please choose another.',
        'Enter a valid email': 'Please enter a valid email address.',
        'invalid': f'Please enter a valid {field_map.get(field, field.replace("_", " ")).lower()}.',
    }
    
    # Check for pattern matches
    message_lower = message.lower()
    for pattern, friendly_msg in error_patterns.items():
        if pattern.lower() in message_lower:
            return friendly_msg
    
    # Return original message if no pattern matches
    return message
