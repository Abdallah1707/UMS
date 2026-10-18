from django.urls import path
from .views import (
    CourseViewSet,
    CourseRegistrationViewSet,
    AssignmentViewSet,
    SubmissionViewSet,
    QuizViewSet,
    QuestionViewSet,
    QuizSubmissionViewSet,
    CourseMaterialViewSet,
    CourseScheduleViewSet,
    AttendanceViewSet,
    student_grades,
    generate_transcript,
    parent_child_attendance,
)

app_name = 'curriculum'

urlpatterns = [
    # Courses
    path('courses/', CourseViewSet.as_view({'get': 'list', 'post': 'create'}), name='course_list'),
    path('courses/<int:pk>/', CourseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='course_detail'),
    path('courses/<int:pk>/students/', CourseViewSet.as_view({'get': 'students'}), name='course_students'),
    path('courses/<int:pk>/assignments/', CourseViewSet.as_view({'get': 'assignments'}), name='course_assignments'),
    path('courses/<int:pk>/quizzes/', CourseViewSet.as_view({'get': 'quizzes'}), name='course_quizzes'),
    path('courses/<int:pk>/grades/', CourseViewSet.as_view({'get': 'grades', 'post': 'grades'}), name='course_grades'),
    
    # Course Registrations
    path('registrations/', CourseRegistrationViewSet.as_view({'get': 'list', 'post': 'create'}), name='registration_list'),
    path('registrations/<int:pk>/', CourseRegistrationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='registration_detail'),
    
    # Assignments
    path('assignments/', AssignmentViewSet.as_view({'get': 'list', 'post': 'create'}), name='assignment_list'),
    path('assignments/<int:pk>/', AssignmentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='assignment_detail'),
    path('assignments/<int:pk>/submit/', AssignmentViewSet.as_view({'get': 'submit', 'post': 'submit'}), name='assignment_submit'),
    path('assignments/<int:pk>/submissions/', AssignmentViewSet.as_view({'get': 'submissions'}), name='assignment_submissions'),

    # Quizzes
    path('quizzes/', QuizViewSet.as_view({'get': 'list', 'post': 'create'}), name='quiz_list'),
    path('quizzes/<int:pk>/', QuizViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='quiz_detail'),
    path('quizzes/<int:pk>/questions/', QuizViewSet.as_view({'get': 'questions'}), name='quiz_questions'),
    path('quizzes/<int:pk>/submissions/', QuizViewSet.as_view({'get': 'submissions'}), name='quiz_submissions'),

    # Questions
    path('questions/', QuestionViewSet.as_view({'get': 'list', 'post': 'create'}), name='question_list'),
    path('questions/<int:pk>/', QuestionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='question_detail'),

    # Quiz Submissions
    path('quiz-submissions/', QuizSubmissionViewSet.as_view({'get': 'list', 'post': 'create'}), name='quiz_submission_list'),
    path('quiz-submissions/<int:pk>/', QuizSubmissionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}), name='quiz_submission_detail'),
    
    # Submissions
    path('submissions/', SubmissionViewSet.as_view({'get': 'list'}), name='submission_list'),
    path('submissions/<int:pk>/', SubmissionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}), name='submission_detail'),
    
    # Student Grades
    path('student/grades/', student_grades, name='student_grades'),
    
    # Generate Transcript
    path('student/generate-transcript/', generate_transcript, name='generate_transcript'),
    
    # Course Materials
    path('course-materials/', CourseMaterialViewSet.as_view({'get': 'list', 'post': 'create'}), name='course_material_list'),
    path('course-materials/<int:pk>/', CourseMaterialViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='course_material_detail'),
    
    # Course Schedules
    path('course-schedules/', CourseScheduleViewSet.as_view({'get': 'list', 'post': 'create'}), name='course_schedule_list'),
    path('course-schedules/<int:pk>/', CourseScheduleViewSet.as_view({'delete': 'destroy'}), name='course_schedule_detail'),
    
    # Attendance
    path('attendance/', AttendanceViewSet.as_view({'get': 'list', 'post': 'create'}), name='attendance_list'),
    path('attendance/<int:pk>/', AttendanceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='attendance_detail'),
    
    # Parent attendance view
    path('parent/child-attendance/', parent_child_attendance, name='parent_child_attendance'),
]