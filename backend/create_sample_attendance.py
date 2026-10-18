#!/usr/bin/env python3

import os
import sys
import django
from datetime import date, timedelta

# Add the project directory to the Python path
sys.path.append('/Users/shazamaher/Desktop/Agile/agile project/University-Management-System/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Application
from curriculum.models import Course, Attendance, CourseRegistration

def create_sample_attendance():
    try:
        # Find a parent user
        parent = User.objects.filter(user_type='parent').first()
        if not parent:
            print("No parent user found. Creating one...")
            parent = User.objects.create_user(
                username='parent1',
                email='parent@example.com',
                password='password123',
                user_type='parent',
                first_name='John',
                last_name='Parent'
            )
        
        # Find or create a student (child)
        student = User.objects.filter(user_type='student').first()
        if not student:
            print("No student user found. Creating one...")
            student = User.objects.create_user(
                username='student1',
                email='student@example.com',
                password='password123',
                user_type='student',
                first_name='Jane',
                last_name='Student'
            )
        
        # Create an application to link parent and student
        application, created = Application.objects.get_or_create(
            email=student.email,
            defaults={
                'first_name': student.first_name,
                'last_name': student.last_name,
                'phone': '01234567890',
                'program_id': 1,  # Assuming department ID 1 exists
                'school_name': 'Test School',
                'transcript': 'test.pdf',
                'id_copy': 'test.pdf',
                'photo': 'test.jpg',
                'parent_first_name': parent.first_name,
                'parent_last_name': parent.last_name,
                'parent_email': parent.email,
                'parent_phone': '01234567890',
                'status': 'accepted',
                'reference_number': 'REF001'
            }
        )
        
        # Find a course
        course = Course.objects.first()
        if not course:
            print("No course found. Please create a course first.")
            return
        
        # Register student in course
        registration, created = CourseRegistration.objects.get_or_create(
            student=student,
            course=course
        )
        
        # Find a professor to record attendance
        professor = User.objects.filter(user_type='professor').first()
        if not professor:
            print("No professor found. Creating one...")
            professor = User.objects.create_user(
                username='prof1',
                email='prof@example.com',
                password='password123',
                user_type='professor',
                first_name='Dr.',
                last_name='Professor'
            )
            # Add professor to course
            course.instructors.add(professor)
        
        # Create sample attendance records
        statuses = ['present', 'absent', 'late', 'present', 'present']
        for i in range(5):
            attendance_date = date.today() - timedelta(days=i*2)
            Attendance.objects.get_or_create(
                course=course,
                student=student,
                date=attendance_date,
                defaults={
                    'status': statuses[i],
                    'notes': f'Sample attendance record {i+1}',
                    'recorded_by': professor
                }
            )
        
        print(f"Sample attendance data created successfully!")
        print(f"Parent: {parent.email}")
        print(f"Student: {student.email}")
        print(f"Course: {course.name}")
        print(f"Attendance records: {Attendance.objects.filter(student=student).count()}")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")

if __name__ == '__main__':
    create_sample_attendance()