from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.user_type == 'admin'
    
class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile or admins.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access any profile
        if request.user.user_type == 'admin':
            return True
        # Users can only access their own profile
        return obj == request.user