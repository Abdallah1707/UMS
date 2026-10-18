from rest_framework import serializers
from .models import Classroom, Booking, MaintenanceTicket, Resource, ResourceAllocation
from django.db.models import Q
from django.utils import timezone

class ClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['staff', 'created_at']

    def validate(self, data):
        if data['date'] < timezone.now().date():
            raise serializers.ValidationError("Cannot book classrooms for past dates")
            
        if data['time_from'] >= data['time_to']:
            raise serializers.ValidationError("time_from must be before time_to")
        
        overlapping = Booking.objects.filter(
            classroom=data['classroom'],
            date=data['date']
        ).filter(
            Q(time_from__lt=data['time_to']) & Q(time_to__gt=data['time_from'])
        )
        
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        
        if overlapping.exists():
            raise serializers.ValidationError({"non_field_errors": ["Room is not available for the selected time slot"]})
        
        return data

class MaintenanceTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MaintenanceTicket
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ['available']
    
    def validate(self, data):
        if not self.instance:  # Only check on create
            existing = Resource.objects.filter(
                name=data.get('name'),
                resource_type=data.get('resource_type')
            ).exists()
            if existing:
                raise serializers.ValidationError(
                    "A resource with this name and type already exists. Please update the existing resource instead."
                )
        return data
    
    def create(self, validated_data):
        validated_data['available'] = validated_data.get('quantity', 1)
        return super().create(validated_data)

class ResourceAllocationSerializer(serializers.ModelSerializer):
    resource_name = serializers.CharField(source='resource.name', read_only=True)
    resource_type = serializers.CharField(source='resource.resource_type', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = ResourceAllocation
        fields = '__all__'
        read_only_fields = ['allocated_at', 'updated_at']
    
    def validate(self, data):
        resource = data.get('resource')
        quantity_allocated = data.get('quantity_allocated', 0)
        
        if resource:
            if self.instance:
                available = resource.available + self.instance.quantity_allocated
            else:
                available = resource.available
            
            if quantity_allocated > available:
                raise serializers.ValidationError(
                    f"Cannot allocate {quantity_allocated} units. Only {available} available."
                )
        
        if not self.instance:
            existing = ResourceAllocation.objects.filter(
                resource=data.get('resource'),
                department=data.get('department')
            ).exists()
            if existing:
                raise serializers.ValidationError(
                    "This resource is already allocated to this department. Please update the existing allocation."
                )
        
        return data
    
    def create(self, validated_data):
        resource = validated_data['resource']
        quantity = validated_data['quantity_allocated']
        resource.available -= quantity
        resource.save()
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        resource = validated_data.get('resource', instance.resource)
        old_quantity = instance.quantity_allocated
        new_quantity = validated_data.get('quantity_allocated', old_quantity)
        
        resource.available += old_quantity - new_quantity
        resource.save()
        return super().update(instance, validated_data)