from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Message, Announcement, Event
from .serializers import MessageSerializer, AnnouncementSerializer, EventSerializer
from .email_service import EmailService
from core.permissions import IsAdmin
from curriculum.models import CourseRegistration, Course
from core.serializers import UserSerializer
from core.models import User

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(recipient=user))
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    def create(self, request, *args, **kwargs):
        recipient_id = request.data.get('recipient')
        
        if request.user.user_type == 'parent':
            # Get linked student for context
            student_email = request.user.get_attribute('linked_student_email')
            if not student_email:
                return Response({'error': 'No linked student found'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                student = User.objects.get(email=student_email, user_type='student')
            except User.DoesNotExist:
                return Response({'error': 'Linked student not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify parent can message this teacher
            enrolled_courses = CourseRegistration.objects.filter(student=student).values_list('course', flat=True)
            professor_ids = set()
            for course_id in enrolled_courses:
                course = Course.objects.get(id=course_id)
                professor_ids.update(course.instructors.values_list('id', flat=True))
            
            if int(recipient_id) not in professor_ids:
                return Response({'error': 'You can only message teachers of your child\'s enrolled courses'}, status=status.HTTP_403_FORBIDDEN)
            
            # Add student context to message subject
            subject = request.data.get('subject', '')
            if not subject.startswith(f'Re: {student.get_full_name()}'):
                request.data['subject'] = f'Re: {student.get_full_name()} - {subject}'
        
        elif request.user.user_type == 'student':
            enrolled_courses = CourseRegistration.objects.filter(student=request.user).values_list('course', flat=True)
            professor_ids = set()
            for course_id in enrolled_courses:
                course = Course.objects.get(id=course_id)
                professor_ids.update(course.instructors.values_list('id', flat=True))
            
            if int(recipient_id) not in professor_ids:
                return Response({'error': 'You can only message professors from your enrolled courses'}, status=status.HTTP_403_FORBIDDEN)
        
        elif request.user.user_type in ['professor', 'ta']:
            # Professors can message students in their courses and their parents
            recipient = User.objects.get(id=recipient_id)
            
            if recipient.user_type == 'student':
                # Check if student is enrolled in professor's courses
                professor_courses = Course.objects.filter(instructors=request.user).values_list('id', flat=True)
                student_courses = CourseRegistration.objects.filter(student=recipient).values_list('course', flat=True)
                
                if not set(professor_courses).intersection(set(student_courses)):
                    return Response({'error': 'You can only message students enrolled in your courses'}, status=status.HTTP_403_FORBIDDEN)
            
            elif recipient.user_type == 'parent':
                # Check if parent's child is enrolled in professor's courses
                student_email = recipient.get_attribute('linked_student_email')
                if student_email:
                    try:
                        student = User.objects.get(email=student_email, user_type='student')
                        professor_courses = Course.objects.filter(instructors=request.user).values_list('id', flat=True)
                        student_courses = CourseRegistration.objects.filter(student=student).values_list('course', flat=True)
                        
                        if not set(professor_courses).intersection(set(student_courses)):
                            return Response({'error': 'You can only message parents of students in your courses'}, status=status.HTTP_403_FORBIDDEN)
                    except User.DoesNotExist:
                        return Response({'error': 'Parent\'s linked student not found'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'error': 'Parent has no linked student'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'You can only message students and parents'}, status=status.HTTP_403_FORBIDDEN)
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def inbox(self, request):
        messages = Message.objects.filter(recipient=request.user).order_by('-created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        messages = Message.objects.filter(sender=request.user).order_by('-created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.recipient == request.user:
            message.is_read = True
            message.save()
            return Response({'status': 'message marked as read'})
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=False, methods=['get'])
    def available_professors(self, request):
        if request.user.user_type not in ['student', 'parent']:
            return Response({'error': 'Only students and parents can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.user.user_type == 'parent':
            # Get linked student
            student_email = request.user.get_attribute('linked_student_email')
            if not student_email:
                return Response({'error': 'No linked student found'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                student = User.objects.get(email=student_email, user_type='student')
            except User.DoesNotExist:
                return Response({'error': 'Linked student not found'}, status=status.HTTP_400_BAD_REQUEST)
            
            enrolled_courses = CourseRegistration.objects.filter(student=student).values_list('course', flat=True)
        else:
            enrolled_courses = CourseRegistration.objects.filter(student=request.user).values_list('course', flat=True)
        
        professor_ids = set()
        for course_id in enrolled_courses:
            course = Course.objects.get(id=course_id)
            professor_ids.update(course.instructors.values_list('id', flat=True))
        
        professors = User.objects.filter(id__in=professor_ids)
        data = [{
            'id': prof.id,
            'name': prof.get_full_name(),
            'email': prof.email,
            'user_type': prof.user_type
        } for prof in professors]
        
        response_data = {'teachers': data}
        if request.user.user_type == 'parent':
            response_data['student'] = {
                'id': student.id,
                'name': student.get_full_name(),
                'email': student.email
            }
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def conversation(self, request):
        other_user_id = request.query_params.get('user_id')
        if not other_user_id:
            return Response({'error': 'user_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        messages = Message.objects.filter(
            Q(sender=request.user, recipient_id=other_user_id) |
            Q(sender_id=other_user_id, recipient=request.user)
        ).order_by('created_at')
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_students(self, request):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'error': 'Only professors and TAs can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get students enrolled in professor's courses
        professor_courses = Course.objects.filter(instructors=request.user)
        student_registrations = CourseRegistration.objects.filter(course__in=professor_courses)
        students = User.objects.filter(id__in=student_registrations.values_list('student', flat=True))
        
        # Get parents of these students
        student_emails = list(students.values_list('email', flat=True))
        parents = []
        for parent in User.objects.filter(user_type='parent'):
            linked_email = parent.get_attribute('linked_student_email')
            if linked_email in student_emails:
                parents.append(parent)
        
        students_data = [{
            'id': student.id,
            'name': student.get_full_name(),
            'email': student.email,
            'user_type': 'student'
        } for student in students]
        
        parents_data = [{
            'id': parent.id,
            'name': parent.get_full_name(),
            'email': parent.email,
            'user_type': 'parent',
            'linked_student': parent.get_attribute('linked_student_email')
        } for parent in parents]
        
        return Response({
            'students': students_data,
            'parents': parents_data
        })
    
    @action(detail=False, methods=['post'])
    def send_announcement(self, request):
        if request.user.user_type not in ['professor', 'ta', 'admin']:
            return Response({'error': 'Only professors, TAs, and admins can send announcements'}, status=status.HTTP_403_FORBIDDEN)
        
        subject = request.data.get('subject')
        content = request.data.get('content')
        target_type = request.data.get('target_type', 'students')  # 'students', 'parents', 'all'
        course_id = request.data.get('course_id')
        
        if not subject or not content:
            return Response({'error': 'Subject and content are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get recipients based on target type and specific course
        recipients = []
        
        if request.user.user_type in ['professor', 'ta']:
            if course_id:
                # Filter by specific course
                try:
                    course = Course.objects.get(id=course_id, instructors=request.user)
                    student_registrations = CourseRegistration.objects.filter(course=course)
                    students = User.objects.filter(id__in=student_registrations.values_list('student', flat=True))
                except Course.DoesNotExist:
                    return Response({'error': 'Course not found or you are not an instructor'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # All professor's courses (fallback)
                professor_courses = Course.objects.filter(instructors=request.user)
                student_registrations = CourseRegistration.objects.filter(course__in=professor_courses)
                students = User.objects.filter(id__in=student_registrations.values_list('student', flat=True))
            
            if target_type in ['students', 'all']:
                recipients.extend(students)
            
            if target_type in ['parents', 'all']:
                student_emails = list(students.values_list('email', flat=True))
                parents = []
                for parent in User.objects.filter(user_type='parent'):
                    linked_email = parent.get_attribute('linked_student_email')
                    if linked_email in student_emails:
                        parents.append(parent)
                recipients.extend(parents)
        
        # Create messages for all recipients
        messages_created = 0
        for recipient in recipients:
            Message.objects.create(
                sender=request.user,
                recipient=recipient,
                subject=f"[Announcement] {subject}",
                content=content
            )
            messages_created += 1
        
        return Response({
            'message': f'Announcement sent to {messages_created} recipients',
            'recipients_count': messages_created
        })

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'admin':
            return Announcement.objects.all()
        elif self.request.user.user_type in ['professor', 'ta']:
            # Professors can see all announcements and their own
            return Announcement.objects.filter(
                Q(is_published=True, target_audience__in=['all', 'staff']) |
                Q(created_by=self.request.user)
            )
        
        # Filter announcements based on user type
        user_type = self.request.user.user_type
        staff_types = ['professor', 'ta']
        
        queryset = Announcement.objects.filter(is_published=True)
        
        if user_type in staff_types:
            return queryset.filter(target_audience__in=['all', 'staff'])
        else:
            return queryset.filter(target_audience__in=['all', user_type])
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if self.request.user.user_type in ['admin', 'professor']:
                permission_classes = [IsAuthenticated]
            else:
                permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        announcement = serializer.save(created_by=self.request.user)
        
        # Send email notifications to target audience
        if announcement.is_published:
            try:
                recipients = self._get_announcement_recipients(announcement)
                EmailService.send_announcement_email(recipients, announcement)
            except Exception as e:
                print(f"Failed to send announcement emails: {str(e)}")
    
    def _get_announcement_recipients(self, announcement):
        """Get list of users who should receive the announcement"""
        if announcement.target_audience == 'all':
            return User.objects.filter(email__isnull=False).exclude(email='')
        elif announcement.target_audience == 'staff':
            return User.objects.filter(user_type__in=['professor', 'ta'], email__isnull=False).exclude(email='')
        else:
            return User.objects.filter(user_type=announcement.target_audience, email__isnull=False).exclude(email='')

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'admin':
            return Event.objects.all()
        
        user_type = self.request.user.user_type
        staff_types = ['professor', 'ta']
        
        queryset = Event.objects.all()
        
        if user_type in staff_types:
            return queryset.filter(target_audience__in=['all', 'staff'])
        else:
            return queryset.filter(target_audience__in=['all', user_type])
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        event = serializer.save(created_by=self.request.user)
        
        # Send email notifications to target audience
        try:
            recipients = self._get_event_recipients(event)
            EmailService.send_event_notification(recipients, event)
        except Exception as e:
            print(f"Failed to send event emails: {str(e)}")
    
    def _get_event_recipients(self, event):
        """Get list of users who should receive the event notification"""
        if event.target_audience == 'all':
            return User.objects.filter(email__isnull=False).exclude(email='')
        elif event.target_audience == 'staff':
            return User.objects.filter(user_type__in=['professor', 'ta'], email__isnull=False).exclude(email='')
        else:
            return User.objects.filter(user_type=event.target_audience, email__isnull=False).exclude(email='')