import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from community.email_service import EmailService
from .models import Course, CourseRegistration, Assignment, Grade, Submission, Quiz, Question, QuizSubmission, CourseMaterial, CourseSchedule, Attendance
from .serializers import CourseSerializer, CourseRegistrationSerializer, AssignmentSerializer, GradeSerializer, SubmissionSerializer, QuizSerializer, QuestionSerializer, QuizSubmissionSerializer, CourseMaterialSerializer, CourseScheduleSerializer, AttendanceSerializer
from core.permissions import IsAdmin
from core.serializers import UserSerializer

logger = logging.getLogger(__name__)

class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'student':
            return Submission.objects.filter(student=self.request.user)
        elif self.request.user.user_type in ['professor', 'ta']:
            return Submission.objects.filter(assignment__course__instructors=self.request.user)
        return Submission.objects.all()
    
    @action(detail=False, methods=['get'])
    def graded(self, request):
        if request.user.user_type != 'student':
            return Response({'errors': {'detail': ['Only students can view their graded submissions.']}}, status=status.HTTP_403_FORBIDDEN)
        submissions = Submission.objects.filter(student=request.user, grade__isnull=False)
        serializer = self.get_serializer(submissions, many=True, context={'request': request})
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can grade submissions.']}}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can grade submissions.']}}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [IsAdmin]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated]
        elif self.action == 'destroy':
            permission_classes = [IsAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Course.objects.all()
        course_type = self.request.query_params.get('course_type', None)
        department = self.request.query_params.get('department', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if course_type:
            queryset = queryset.filter(course_type=course_type)
        if department:
            queryset = queryset.filter(department=department)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset
    
    def update(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user
        
        # Allow admin or course instructors to update
        if user.user_type != 'admin' and user not in course.instructors.all():
            return Response({'errors': {'detail': ['Only course instructors or admins can update this course.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        course = self.get_object()
        user = request.user
        
        # Allow admin or course instructors to update
        if user.user_type != 'admin' and user not in course.instructors.all():
            return Response({'errors': {'detail': ['Only course instructors or admins can update this course.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        course = self.get_object()
        if request.user.user_type not in ['professor', 'ta'] or request.user not in course.instructors.all():
            return Response({'errors': {'detail': ['Only course instructors can view enrolled students.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        registrations = CourseRegistration.objects.filter(course=course)
        students = [reg.student for reg in registrations]
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        course = self.get_object()
        if request.user.user_type in ['professor', 'ta'] and request.user in course.instructors.all():
            assignments = Assignment.objects.filter(course=course)
            serializer = AssignmentSerializer(assignments, many=True)
            return Response(serializer.data)
        elif request.user.user_type == 'student':
            if CourseRegistration.objects.filter(student=request.user, course=course).exists():
                assignments = Assignment.objects.filter(course=course)
                serializer = AssignmentSerializer(assignments, many=True)
                return Response(serializer.data)
            else:
                return Response({'errors': {'detail': ['You are not registered for this course.']}}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'errors': {'detail': ['You do not have permission to view assignments for this course.']}}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['get'])
    def quizzes(self, request, pk=None):
        course = self.get_object()
        if request.user.user_type in ['professor', 'ta'] and request.user in course.instructors.all():
            quizzes = Quiz.objects.filter(course=course)
            serializer = QuizSerializer(quizzes, many=True)
            return Response(serializer.data)
        elif request.user.user_type == 'student':
            if CourseRegistration.objects.filter(student=request.user, course=course).exists():
                quizzes = Quiz.objects.filter(course=course)
                serializer = QuizSerializer(quizzes, many=True)
                return Response(serializer.data)
            else:
                return Response({'errors': {'detail': ['You are not registered for this course.']}}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'errors': {'detail': ['You do not have permission to view quizzes for this course.']}}, status=status.HTTP_403_FORBIDDEN)
    
    @action(detail=True, methods=['get', 'post'])
    def grades(self, request, pk=None):
        course = self.get_object()
        
        if request.method == 'GET':
            if request.user.user_type == 'student':
                grade = Grade.objects.filter(course=course, student=request.user).first()
                if grade:
                    serializer = GradeSerializer(grade)
                    return Response(serializer.data)
                return Response({'errors': {'detail': ['No grade found for this course.']}}, status=status.HTTP_404_NOT_FOUND)
            elif request.user.user_type in ['professor', 'ta'] and request.user in course.instructors.all():
                grades = Grade.objects.filter(course=course)
                serializer = GradeSerializer(grades, many=True)
                return Response(serializer.data)
            else:
                return Response({'errors': {'detail': ['You do not have permission to view these grades.']}}, status=status.HTTP_403_FORBIDDEN)
        
        elif request.method == 'POST':
            if request.user.user_type not in ['professor', 'ta'] or request.user not in course.instructors.all():
                return Response({'errors': {'detail': ['Only course instructors can manage grades.']}}, status=status.HTTP_403_FORBIDDEN)
            
            data = request.data.copy()
            data['course'] = course.id
            
            existing_grade = Grade.objects.filter(course=course, student=data['student']).first()
            if existing_grade:
                serializer = GradeSerializer(existing_grade, data=data, partial=True)
            else:
                serializer = GradeSerializer(data=data)
            
            if serializer.is_valid():
                # Check if final_grade was added/updated
                old_final_grade = existing_grade.final_grade if existing_grade else None
                grade = serializer.save()
                new_final_grade = grade.final_grade
                
                # Send grade notification email only if final_grade was just added or updated
                if new_final_grade and new_final_grade != old_final_grade:
                    try:
                        student = grade.student
                        course = grade.course
                        EmailService.send_grade_notification(student, course, new_final_grade)
                    except Exception as e:
                        print(f"Failed to send grade notification email: {str(e)}")
                
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CourseRegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = CourseRegistrationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.user_type == 'student':
            return CourseRegistration.objects.filter(student=self.request.user)
        return CourseRegistration.objects.all()
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'student':
            return Response({'errors': {'detail': ['Only students can register for courses.']}}, status=status.HTTP_403_FORBIDDEN)
        
        course_id = request.data.get('course')
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'errors': {'course': ['Course not found.']}}, status=status.HTTP_404_NOT_FOUND)
        
        if not course.registration_open:
            return Response({'errors': {'detail': ['Registration is closed for this course.']}}, status=status.HTTP_400_BAD_REQUEST)
        
        if course.max_students:
            enrolled = CourseRegistration.objects.filter(course=course).count()
            if enrolled >= course.max_students:
                return Response({'errors': {'detail': ['This course is full. No more seats available.']}}, status=status.HTTP_400_BAD_REQUEST)
        
        if CourseRegistration.objects.filter(student=request.user, course=course).exists():
            return Response({'errors': {'detail': ['You are already registered for this course.']}}, status=status.HTTP_400_BAD_REQUEST)
        
        registration = CourseRegistration.objects.create(student=request.user, course=course)
        serializer = self.get_serializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['professor', 'ta']:
            return Assignment.objects.filter(course__instructors=user)
        elif user.user_type == 'student':
            registered_courses = CourseRegistration.objects.filter(student=user).values_list('course', flat=True)
            return Assignment.objects.filter(course__in=registered_courses)
        else:
            return Assignment.objects.all()
    
    def perform_create(self, serializer):
        assignment = serializer.save(created_by=self.request.user)
        
        # Send email notification to enrolled students
        try:
            registrations = CourseRegistration.objects.filter(course=assignment.course)
            students = [reg.student for reg in registrations]
            EmailService.send_assignment_notification(students, assignment)
        except Exception as e:
            print(f"Failed to send assignment emails: {str(e)}")
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can create assignments.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        course_id = request.data.get('course')
        try:
            course = Course.objects.get(id=course_id)
            if request.user not in course.instructors.all():
                return Response({'errors': {'detail': ['You can only create assignments for courses you teach.']}}, 
                              status=status.HTTP_403_FORBIDDEN)
        except Course.DoesNotExist:
            return Response({'errors': {'course': ['Course not found.']}}, status=status.HTTP_404_NOT_FOUND)
        
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        assignment = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can edit assignments.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if request.user not in assignment.course.instructors.all():
            return Response({'errors': {'detail': ['You can only edit assignments for courses you teach.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        assignment = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can edit assignments.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if request.user not in assignment.course.instructors.all():
            return Response({'errors': {'detail': ['You can only edit assignments for courses you teach.']}}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def debug_all(self, request):
        """Debug endpoint to see all assignments"""
        assignments = Assignment.objects.all()
        serializer = self.get_serializer(assignments, many=True)
        return Response({
            'count': assignments.count(),
            'assignments': serializer.data
        })
    
    @action(detail=True, methods=['get', 'post'])
    def submit(self, request, pk=None):
        assignment = self.get_object()
        
        if request.method == 'GET':
            try:
                submission = Submission.objects.get(assignment=assignment, student=request.user)
                serializer = SubmissionSerializer(submission, context={'request': request})
                return Response(serializer.data)
            except Submission.DoesNotExist:
                return Response({'errors': {'detail': ['No submission found for this assignment.']}}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'POST':
            if assignment.is_overdue:
                return Response({'errors': {'detail': ['Submissions are no longer accepted. The due date has passed.']}}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            try:
                submission = Submission.objects.get(assignment=assignment, student=request.user)
                serializer = SubmissionSerializer(submission, data=request.data, partial=True)
            except Submission.DoesNotExist:
                serializer = SubmissionSerializer(data=request.data)
            
            if serializer.is_valid():
                serializer.save(assignment=assignment, student=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        assignment = self.get_object()
        if request.user.user_type not in ['professor', 'ta'] or request.user not in assignment.course.instructors.all():
            return Response({'errors': {'detail': ['Only course instructors can view submissions.']}}, status=status.HTTP_403_FORBIDDEN)
        
        submissions = Submission.objects.filter(assignment=assignment).select_related('student')
        serializer = SubmissionSerializer(submissions, many=True, context={'request': request})
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        assignment = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can delete assignments.']}},
                          status=status.HTTP_403_FORBIDDEN)

        if request.user not in assignment.course.instructors.all():
            return Response({'errors': {'detail': ['You can only delete assignments for courses you teach.']}},
                          status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['professor', 'ta']:
            return Quiz.objects.filter(course__instructors=user)
        elif user.user_type == 'student':
            registered_courses = CourseRegistration.objects.filter(student=user).values_list('course', flat=True)
            return Quiz.objects.filter(course__in=registered_courses)
        else:
            return Quiz.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can create quizzes.']}},
                          status=status.HTTP_403_FORBIDDEN)

        course_id = request.data.get('course')
        try:
            course = Course.objects.get(id=course_id)
            if request.user not in course.instructors.all():
                return Response({'errors': {'detail': ['You can only create quizzes for courses you teach.']}},
                              status=status.HTTP_403_FORBIDDEN)
        except Course.DoesNotExist:
            return Response({'errors': {'course': ['Course not found.']}}, status=status.HTTP_404_NOT_FOUND)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        quiz = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can edit quizzes.']}},
                          status=status.HTTP_403_FORBIDDEN)

        if request.user not in quiz.course.instructors.all():
            return Response({'errors': {'detail': ['You can only edit quizzes for courses you teach.']}},
                          status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        quiz = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can edit quizzes.']}},
                          status=status.HTTP_403_FORBIDDEN)

        if request.user not in quiz.course.instructors.all():
            return Response({'errors': {'detail': ['You can only edit quizzes for courses you teach.']}},
                          status=status.HTTP_403_FORBIDDEN)

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        quiz = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can delete quizzes.']}},
                          status=status.HTTP_403_FORBIDDEN)

        if request.user not in quiz.course.instructors.all():
            return Response({'errors': {'detail': ['You can only delete quizzes for courses you teach.']}},
                          status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        quiz = self.get_object()
        questions = Question.objects.filter(quiz=quiz)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        quiz = self.get_object()
        if request.user.user_type not in ['professor', 'ta'] or request.user not in quiz.course.instructors.all():
            return Response({'errors': {'detail': ['Only course instructors can view quiz submissions.']}}, status=status.HTTP_403_FORBIDDEN)

        submissions = QuizSubmission.objects.filter(quiz=quiz).select_related('student')
        serializer = QuizSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['professor', 'ta']:
            return Question.objects.filter(quiz__course__instructors=user)
        elif user.user_type == 'student':
            registered_courses = CourseRegistration.objects.filter(student=user).values_list('course', flat=True)
            return Question.objects.filter(quiz__course__in=registered_courses)
        else:
            return Question.objects.all()

    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can create questions.']}},
                          status=status.HTTP_403_FORBIDDEN)

        quiz_id = request.data.get('quiz')
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            if request.user not in quiz.course.instructors.all():
                return Response({'errors': {'detail': ['You can only create questions for quizzes in courses you teach.']}},
                              status=status.HTTP_403_FORBIDDEN)
        except Quiz.DoesNotExist:
            return Response({'errors': {'quiz': ['Quiz not found.']}}, status=status.HTTP_404_NOT_FOUND)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        question = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can edit questions.']}},
                          status=status.HTTP_403_FORBIDDEN)

        if request.user not in question.quiz.course.instructors.all():
            return Response({'errors': {'detail': ['You can only edit questions for quizzes in courses you teach.']}},
                          status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        question = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only professors and teaching assistants can edit questions.']}},
                          status=status.HTTP_403_FORBIDDEN)

        if request.user not in question.quiz.course.instructors.all():
            return Response({'errors': {'detail': ['You can only edit questions for quizzes in courses you teach.']}},
                          status=status.HTTP_403_FORBIDDEN)

        # Prevent changing the quiz
        if 'quiz' in request.data:
            return Response({'errors': {'quiz': ['Cannot change the quiz for a question.']}},
                          status=status.HTTP_400_BAD_REQUEST)

        return super().partial_update(request, *args, **kwargs)

class QuizSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            return QuizSubmission.objects.filter(student=user)
        elif user.user_type in ['professor', 'ta']:
            return QuizSubmission.objects.filter(quiz__course__instructors=user)
        return QuizSubmission.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info(f"Quiz submission attempt by user {request.user.id} ({request.user.user_type}) for quiz {request.data.get('quiz')}")
        if request.user.user_type != 'student':
            logger.warning(f"Non-student user {request.user.id} attempted quiz submission")
            return Response({'errors': {'detail': ['Only students can submit quiz answers.']}}, status=status.HTTP_403_FORBIDDEN)

        quiz_id = request.data.get('quiz')
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            logger.info(f"Quiz {quiz_id} found: {quiz.title}")
            if quiz.is_overdue:
                logger.info(f"Quiz {quiz_id} is overdue")
                return Response({'errors': {'detail': ['Quiz submission deadline has passed.']}}, status=status.HTTP_400_BAD_REQUEST)
        except Quiz.DoesNotExist:
            logger.error(f"Quiz {quiz_id} not found")
            return Response({'errors': {'quiz': ['Quiz not found.']}}, status=status.HTTP_404_NOT_FOUND)

        # Check course registration
        if not CourseRegistration.objects.filter(student=request.user, course=quiz.course).exists():
            logger.warning(f"User {request.user.id} not registered for course {quiz.course.id}")
            return Response({'errors': {'detail': ['You are not registered for this course.']}}, status=status.HTTP_403_FORBIDDEN)

        # Check if already submitted
        if QuizSubmission.objects.filter(quiz=quiz, student=request.user).exists():
            return Response({'errors': {'detail': ['You have already submitted this quiz.']}}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Checks passed for user {request.user.id}, proceeding with submission")
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        logger.info(f"Creating quiz submission for user {self.request.user.id}")
        try:
            quiz_id = self.request.data.get('quiz')
            quiz = Quiz.objects.get(id=quiz_id)
            serializer.save(student=self.request.user, quiz=quiz)
            logger.info(f"Quiz submission created successfully for user {self.request.user.id}")
        except Exception as e:
            logger.error(f"Error creating quiz submission for user {self.request.user.id}: {str(e)}")
            raise

    def update(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can grade quiz submissions.']}}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can grade quiz submissions.']}}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

class CourseMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = CourseMaterialSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['professor', 'ta']:
            return CourseMaterial.objects.filter(course__instructors=user)
        elif user.user_type == 'student':
            registered_courses = CourseRegistration.objects.filter(student=user).values_list('course', flat=True)
            return CourseMaterial.objects.filter(course__in=registered_courses)
        return CourseMaterial.objects.all()
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can upload course materials.']}}, status=status.HTTP_403_FORBIDDEN)
        
        course_id = request.data.get('course')
        try:
            course = Course.objects.get(id=course_id)
            if request.user not in course.instructors.all():
                return Response({'errors': {'detail': ['You can only upload materials for courses you teach.']}}, status=status.HTTP_403_FORBIDDEN)
        except Course.DoesNotExist:
            return Response({'errors': {'course': ['Course not found.']}}, status=status.HTTP_404_NOT_FOUND)
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        material = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can delete course materials.']}}, status=status.HTTP_403_FORBIDDEN)
        
        if request.user not in material.course.instructors.all():
            return Response({'errors': {'detail': ['You can only delete materials for courses you teach.']}}, status=status.HTTP_403_FORBIDDEN)
        
        return super().destroy(request, *args, **kwargs)

class CourseScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = CourseScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'student':
            # Students see schedules for courses they're registered in
            registered_courses = CourseRegistration.objects.filter(student=user).values_list('course', flat=True)
            return CourseSchedule.objects.filter(course__in=registered_courses)
        elif user.user_type in ['professor', 'ta']:
            # Instructors see schedules for courses they teach
            return CourseSchedule.objects.filter(course__instructors=user)
        else:
            return CourseSchedule.objects.none()
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can create schedules.']}}, status=status.HTTP_403_FORBIDDEN)
        
        course_id = request.data.get('course')
        try:
            course = Course.objects.get(id=course_id)
            if request.user not in course.instructors.all():
                return Response({'errors': {'detail': ['You can only schedule courses you teach.']}}, status=status.HTTP_403_FORBIDDEN)
        except Course.DoesNotExist:
            return Response({'errors': {'course': ['Course not found.']}}, status=status.HTTP_404_NOT_FOUND)
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        schedule = self.get_object()
        if request.user not in schedule.course.instructors.all():
            return Response({'errors': {'detail': ['You can only delete schedules for courses you teach.']}}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_transcript(request):
    if request.user.user_type != 'student':
        return Response({'errors': {'detail': ['Only students can generate transcripts.']}}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
        from io import BytesIO
        from django.core.mail import EmailMessage
        from datetime import datetime
        
        # Get student data
        student = request.user
        registrations = CourseRegistration.objects.filter(student=student).select_related('course')
        
        # Grade points mapping
        GRADE_POINTS = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0
        }
        
        # Calculate GPA and collect grades
        total_credits = 0
        gpa_numerator = 0
        gpa_denominator = 0
        grades_list = []
        
        for registration in registrations:
            course = registration.course
            total_credits += course.credits
            try:
                grade = Grade.objects.get(student=student, course=course)
                grades_list.append({
                    'code': course.code,
                    'name': course.name,
                    'credits': course.credits,
                    'grade': grade.final_grade or 'N/A'
                })
                if grade.final_grade and grade.final_grade in GRADE_POINTS:
                    points = GRADE_POINTS[grade.final_grade]
                    gpa_numerator += points * course.credits
                    gpa_denominator += course.credits
            except Grade.DoesNotExist:
                grades_list.append({
                    'code': course.code,
                    'name': course.name,
                    'credits': course.credits,
                    'grade': 'N/A'
                })
        
        gpa = round(gpa_numerator / gpa_denominator, 2) if gpa_denominator > 0 else 0
        
        # Generate PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Header
        p.setFont("Helvetica-Bold", 20)
        p.drawCentredString(width/2, height - inch, "ACADEMIC TRANSCRIPT")
        
        # Student Info
        y = height - 2*inch
        p.setFont("Helvetica-Bold", 12)
        p.drawString(inch, y, "Student Information")
        y -= 0.3*inch
        p.setFont("Helvetica", 10)
        p.drawString(inch, y, f"Name: {student.first_name} {student.last_name}")
        y -= 0.2*inch
        p.drawString(inch, y, f"Student ID: {student.user_id}")
        y -= 0.2*inch
        p.drawString(inch, y, f"Email: {student.email}")
        y -= 0.2*inch
        enrollment_year = student.get_attribute('enrollment_year')
        if enrollment_year:
            p.drawString(inch, y, f"Enrollment Year: {enrollment_year}")
            y -= 0.2*inch
        
        # Academic Summary
        y -= 0.3*inch
        p.setFont("Helvetica-Bold", 12)
        p.drawString(inch, y, "Academic Summary")
        y -= 0.3*inch
        p.setFont("Helvetica", 10)
        p.drawString(inch, y, f"GPA: {gpa}")
        y -= 0.2*inch
        p.drawString(inch, y, f"Total Credit Hours: {total_credits}")
        
        # Courses Table
        y -= 0.5*inch
        p.setFont("Helvetica-Bold", 12)
        p.drawString(inch, y, "Course History")
        y -= 0.3*inch
        
        # Table headers
        p.setFont("Helvetica-Bold", 10)
        p.drawString(inch, y, "Code")
        p.drawString(2*inch, y, "Course Name")
        p.drawString(5*inch, y, "Credits")
        p.drawString(6*inch, y, "Grade")
        y -= 0.05*inch
        p.line(inch, y, width - inch, y)
        y -= 0.2*inch
        
        # Table rows
        p.setFont("Helvetica", 9)
        for grade_item in grades_list:
            if y < 2*inch:
                p.showPage()
                y = height - inch
                p.setFont("Helvetica", 9)
            p.drawString(inch, y, grade_item['code'])
            p.drawString(2*inch, y, grade_item['name'][:30])
            p.drawString(5*inch, y, str(grade_item['credits']))
            p.drawString(6*inch, y, grade_item['grade'])
            y -= 0.2*inch
        
        # Footer
        p.setFont("Helvetica-Oblique", 8)
        p.drawCentredString(width/2, inch/2, f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        
        p.save()
        buffer.seek(0)
        
        # Send email
        email = EmailMessage(
            subject=f'Your Academic Transcript - {student.first_name} {student.last_name}',
            body=f'''Dear {student.first_name} {student.last_name},

Please find attached your academic transcript.

Academic Summary:
- GPA: {gpa}
- Total Credit Hours: {total_credits}

This transcript was generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}.

Best regards,
University Administration''',
            from_email='noreply@university.edu',
            to=[student.email]
        )
        email.attach(f'transcript_{student.user_id}.pdf', buffer.getvalue(), 'application/pdf')
        email.send()
        
        return Response({'message': 'Transcript generated and sent to your email successfully.'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'errors': {'detail': [f'Failed to generate transcript: {str(e)}']}}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_grades(request):
    if request.user.user_type != 'student':
        return Response({'errors': {'detail': ['Only students can view their grades.']}}, status=status.HTTP_403_FORBIDDEN)
    
    # Grade points mapping
    GRADE_POINTS = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    }
    
    # Get student's registered courses with grades
    registrations = CourseRegistration.objects.filter(student=request.user).select_related('course')
    grades_data = []
    total_credits = 0
    gpa_numerator = 0
    gpa_denominator = 0
    
    for registration in registrations:
        course = registration.course
        total_credits += course.credits
        try:
            grade = Grade.objects.get(student=request.user, course=course)
            grade_data = {
                'course_name': course.name,
                'course_code': course.code,
                'credits': course.credits,
                'midterm': grade.midterm,
                'project': grade.project,
                'coursework': grade.coursework,
                'final_grade': grade.final_grade
            }
            if grade.final_grade and grade.final_grade in GRADE_POINTS:
                points = GRADE_POINTS[grade.final_grade]
                gpa_numerator += points * course.credits
                gpa_denominator += course.credits
        except Grade.DoesNotExist:
            grade_data = {
                'course_name': course.name,
                'course_code': course.code,
                'credits': course.credits,
                'midterm': None,
                'project': None,
                'coursework': None,
                'final_grade': None
            }
        grades_data.append(grade_data)
    
    gpa = round(gpa_numerator / gpa_denominator, 2) if gpa_denominator > 0 else 0
    
    return Response({
        'grades': grades_data,
        'gpa': gpa,
        'total_credits': total_credits
    })

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type in ['professor', 'ta']:
            return Attendance.objects.filter(course__instructors=user)
        elif user.user_type == 'student':
            return Attendance.objects.filter(student=user)
        return Attendance.objects.all()
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can record attendance.']}}, status=status.HTTP_403_FORBIDDEN)
        
        course_id = request.data.get('course')
        attendance_date = request.data.get('date')
        
        # Validate date is not in the future
        from datetime import date
        if attendance_date and date.fromisoformat(attendance_date) > date.today():
            return Response({'errors': {'date': ['Cannot record attendance for future dates.']}}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            course = Course.objects.get(id=course_id)
            if request.user not in course.instructors.all():
                return Response({'errors': {'detail': ['You can only record attendance for courses you teach.']}}, status=status.HTTP_403_FORBIDDEN)
        except Course.DoesNotExist:
            return Response({'errors': {'course': ['Course not found.']}}, status=status.HTTP_404_NOT_FOUND)
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
    
    def update(self, request, *args, **kwargs):
        attendance = self.get_object()
        if request.user.user_type not in ['professor', 'ta']:
            return Response({'errors': {'detail': ['Only instructors can update attendance.']}}, status=status.HTTP_403_FORBIDDEN)
        
        if request.user not in attendance.course.instructors.all():
            return Response({'errors': {'detail': ['You can only update attendance for courses you teach.']}}, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def parent_child_attendance(request):
    if request.user.user_type != 'parent':
        return Response({'errors': {'detail': ['Only parents can view child attendance.']}}, status=status.HTTP_403_FORBIDDEN)
    
    # Get parent's child - assuming parent email matches student's parent email from application
    try:
        from core.models import Application
        application = Application.objects.get(parent_email=request.user.email, status='accepted')
        from core.models import User
        child = User.objects.get(email=application.email, user_type='student')
    except (Application.DoesNotExist, User.DoesNotExist):
        return Response({'errors': {'detail': ['No child found for this parent account.']}}, status=status.HTTP_404_NOT_FOUND)
    
    # Get child's attendance records
    attendances = Attendance.objects.filter(student=child).select_related('course')
    
    # Group by course
    attendance_by_course = {}
    for attendance in attendances:
        course_code = attendance.course.code
        if course_code not in attendance_by_course:
            attendance_by_course[course_code] = {
                'course_name': attendance.course.name,
                'course_code': course_code,
                'records': [],
                'summary': {'present': 0, 'absent': 0, 'late': 0, 'total': 0}
            }
        
        attendance_by_course[course_code]['records'].append({
            'date': attendance.date,
            'status': attendance.status,
            'notes': attendance.notes
        })
        
        attendance_by_course[course_code]['summary'][attendance.status] += 1
        attendance_by_course[course_code]['summary']['total'] += 1
    
    # Calculate attendance percentage for each course
    for course_data in attendance_by_course.values():
        total = course_data['summary']['total']
        present = course_data['summary']['present']
        course_data['summary']['attendance_percentage'] = round((present / total * 100), 2) if total > 0 else 0
    
    return Response({
        'child_name': f"{child.first_name} {child.last_name}",
        'child_id': child.user_id,
        'attendance_by_course': attendance_by_course
    })