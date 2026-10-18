from django.db import models
from django.utils import timezone
from core.models import Department, User

class Course(models.Model):
    COURSE_TYPES = [
        ('core', 'Core Subject'),
        ('elective', 'Elective Subject'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    course_type = models.CharField(max_length=20, choices=COURSE_TYPES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    credits = models.IntegerField(default=3)
    prerequisites = models.TextField(blank=True, null=True)
    duration_weeks = models.IntegerField(blank=True, null=True)
    has_lab = models.BooleanField(default=False)
    max_students = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    registration_open = models.BooleanField(default=False)
    instructors = models.ManyToManyField(User, related_name='teaching_courses', limit_choices_to={'user_type__in': ['professor', 'ta']}, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    class Meta:
        ordering = ['code']

class CourseRegistration(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.code}"

class Assignment(models.Model):
    ASSIGNMENT_TYPES = [
        ('assignment', 'Assignment'),
        ('exam', 'Exam'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default='assignment')
    due_date = models.DateTimeField(default=timezone.now() + timezone.timedelta(days=7))
    instructions = models.TextField(blank=True)
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type__in': ['professor', 'ta']})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.course.code} - {self.title}"
    
    @property
    def is_overdue(self):
        return timezone.now() > self.due_date
    
    @property
    def time_remaining(self):
        if self.is_overdue:
            return "Overdue"
        delta = self.due_date - timezone.now()
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        if days > 0:
            return f"{days} days, {hours} hours"
        elif hours > 0:
            return f"{hours} hours"
        else:
            minutes = remainder // 60
            return f"{minutes} minutes"
    
    class Meta:
        ordering = ['-created_at']

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    text_content = models.TextField(blank=True)
    file = models.FileField(upload_to='submissions/', blank=True, null=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['assignment', 'student']
    
    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"

class Grade(models.Model):
    GRADE_CHOICES = [
        ('A+', 'A+'), ('A', 'A'), ('A-', 'A-'),
        ('B+', 'B+'), ('B', 'B'), ('B-', 'B-'),
        ('C+', 'C+'), ('C', 'C'), ('C-', 'C-'),
        ('D+', 'D+'), ('D', 'D'), ('F', 'F'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    midterm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    project = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    coursework = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    final_grade = models.CharField(max_length=2, choices=GRADE_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.username} - {self.course.code} - {self.final_grade or 'No Grade'}"

class Quiz(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type__in': ['professor', 'ta']})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.code} - {self.title}"

    @property
    def is_overdue(self):
        return timezone.now() > self.due_date

    @property
    def time_remaining(self):
        if self.is_overdue:
            return "Overdue"
        delta = self.due_date - timezone.now()
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        if days > 0:
            return f"{days} days, {hours} hours"
        elif hours > 0:
            return f"{hours} hours"
        else:
            minutes = remainder // 60
            return f"{minutes} minutes"

    class Meta:
        ordering = ['-created_at']

class Question(models.Model):
    QUESTION_TYPES = [
        ('mcq', 'Multiple Choice'),
        ('text', 'Text Answer'),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES)
    options = models.JSONField(blank=True, null=True)  # For MCQ, list of options
    correct_answer = models.TextField(blank=True)  # For MCQ, the correct option; for text, maybe not used
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"

    class Meta:
        ordering = ['order']

class QuizSubmission(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    answers = models.JSONField()  # Dict of question_id: answer
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['quiz', 'student']

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title}"

class CourseMaterial(models.Model):
    MATERIAL_TYPES = [
        ('lecture', 'Lecture'),
        ('tutorial', 'Tutorial'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPES)
    file = models.FileField(upload_to='course_materials/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type__in': ['professor', 'ta']})
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.course.code} - {self.title}"
    
    class Meta:
        ordering = ['-uploaded_at']

class CourseSchedule(models.Model):
    DAYS = [
        ('Sunday', 'Sunday'),
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules')
    day = models.CharField(max_length=10, choices=DAYS)
    start_hour = models.IntegerField()  # 8-19 (8 AM to 7 PM)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type__in': ['professor', 'ta']})
    
    class Meta:
        unique_together = ['instructor', 'day', 'start_hour']
    
    def __str__(self):
        return f"{self.course.code} - {self.day} {self.start_hour}:00"

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'student'})
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recorded_attendances', limit_choices_to={'user_type__in': ['professor', 'ta']})
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['course', 'student', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.code} - {self.date} - {self.status}"
