from rest_framework import serializers
from .models import Course, CourseRegistration, Assignment, Grade, Submission, Quiz, Question, QuizSubmission, CourseMaterial, CourseSchedule, Attendance

class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    instructor_names = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'description', 'course_type', 'department', 
                 'department_name', 'credits', 'prerequisites', 'duration_weeks', 
                 'has_lab', 'max_students', 'is_active', 'registration_open', 'instructors', 
                 'instructor_names', 'enrolled_count', 'is_full', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_instructor_names(self, obj):
        return [f"{i.first_name} {i.last_name} ({i.user_type})" for i in obj.instructors.all()]
    
    def get_enrolled_count(self, obj):
        return CourseRegistration.objects.filter(course=obj).count()
    
    def get_is_full(self, obj):
        if obj.max_students is None:
            return False
        return CourseRegistration.objects.filter(course=obj).count() >= obj.max_students

class CourseRegistrationSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = CourseRegistration
        fields = ['id', 'student', 'course', 'course_name', 'course_code', 'registered_at']
        read_only_fields = ['registered_at']

class AssignmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    time_remaining = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    attachment = serializers.FileField(required=False, allow_null=True)
    
    class Meta:
        model = Assignment
        fields = ['id', 'course', 'course_name', 'course_code', 'title', 'description', 
                 'assignment_type', 'due_date', 'instructions', 'attachment', 'created_by', 
                 'created_by_name', 'time_remaining', 'is_overdue', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.get_user_id', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    file = serializers.FileField(required=False, allow_null=True, allow_empty_file=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'student', 'student_name', 'student_id', 'assignment_title', 
                 'text_content', 'file', 'file_url', 'grade', 'feedback', 'submitted_at', 'updated_at']
        read_only_fields = ['assignment', 'student', 'submitted_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'student', 'student_name', 'student_id', 'course',
                 'midterm', 'project', 'coursework', 'final_grade', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class QuizSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    time_remaining = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'course_name', 'course_code', 'title', 'description', 'due_date', 'created_by', 'created_by_name', 'time_remaining', 'is_overdue', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'quiz', 'question_text', 'question_type', 'options', 'correct_answer', 'order']
        read_only_fields = []

class QuizSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = QuizSubmission
        fields = ['id', 'quiz', 'student', 'student_name', 'student_id', 'quiz_title', 'answers', 'grade', 'feedback', 'submitted_at', 'updated_at']
        read_only_fields = ['submitted_at', 'updated_at']

    def validate_answers(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Answers must be a dictionary.")
        quiz_id = self.initial_data.get('quiz')
        if quiz_id:
            try:
                quiz = Quiz.objects.get(id=quiz_id)
                questions = Question.objects.filter(quiz=quiz)
                question_ids = set(str(q.id) for q in questions)  # keys are strings from JS
                provided_ids = set(value.keys())
                if provided_ids != question_ids:
                    raise serializers.ValidationError("Answers must be provided for all questions.")
                for q_id, answer in value.items():
                    if not answer or (isinstance(answer, str) and answer.strip() == ''):
                        raise serializers.ValidationError(f"Answer for question {q_id} cannot be empty.")
            except Quiz.DoesNotExist:
                pass  # let the quiz field handle it
        return value

class CourseMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseMaterial
        fields = ['id', 'course', 'title', 'material_type', 'file', 'file_url', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']
    
    def get_file_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

class CourseScheduleSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = CourseSchedule
        fields = ['id', 'course', 'course_code', 'day', 'start_hour', 'instructor']
        read_only_fields = ['instructor']

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_id = serializers.CharField(source='student.user_id', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'course', 'course_name', 'course_code', 'student', 'student_name', 
                 'student_id', 'date', 'status', 'notes', 'recorded_by', 'recorded_by_name', 'recorded_at']
        read_only_fields = ['recorded_by', 'recorded_at']