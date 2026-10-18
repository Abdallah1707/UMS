from rest_framework import serializers
from .models import Message, Announcement, Event
from core.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    recipient_details = UserSerializer(source='recipient', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_details', 'recipient', 'recipient_details', 'subject', 'content', 'parent_message', 'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']

class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'target_audience', 'deadline', 'is_published', 
                 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'event_date', 'event_time', 'location', 
                 'target_audience', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']