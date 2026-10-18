from django.core.mail import send_mail
from django.conf import settings


class EmailService:
    """Centralized email service for the university management system"""
    
    @staticmethod
    def send_welcome_email(user, temp_password):
        """Send welcome email with temporary password to new users"""
        subject = 'Welcome to University Management System'
        message = f"""
Hello {user.first_name} {user.last_name},

Welcome to the University Management System!

Your account has been created with the following credentials:
Username: {user.username}
Temporary Password: {temp_password}

Please log in and change your password immediately for security purposes.

Login URL: {settings.FRONTEND_URL}/login

Best regards,
University Administration
        """
        
        return send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    
    @staticmethod
    def send_password_reset_email(user, reset_token):
        """Send password reset email with token link"""
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{reset_token}"
        subject = 'Password Reset Request'
        message = f"""
Hello {user.first_name} {user.last_name},

You requested to reset your password for your University Management System account.

Username: {user.username}

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you did not request this reset, please ignore this email and your password will remain unchanged.

Best regards,
University Administration
        """
        
        return send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    
    @staticmethod
    def send_announcement_email(recipients, announcement):
        """Send announcement notification to users"""
        subject = f'Announcement: {announcement.title}'
        message = f"""
New Announcement from {announcement.author.first_name} {announcement.author.last_name}

Title: {announcement.title}

{announcement.content}

{'Deadline: ' + announcement.deadline.strftime('%Y-%m-%d %H:%M') if announcement.deadline else ''}

View more details in the University Management System.

Best regards,
University Administration
        """
        
        recipient_emails = [user.email for user in recipients if user.email]
        
        if recipient_emails:
            return send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_emails,
                fail_silently=False,
            )
        return 0
    
    @staticmethod
    def send_event_notification(recipients, event):
        """Send event notification to users"""
        subject = f'Event: {event.title}'
        message = f"""
New Event Notification

Title: {event.title}
Date: {event.date.strftime('%Y-%m-%d')}
Time: {event.time.strftime('%H:%M')}
Location: {event.location}

Description:
{event.description}

Organized by: {event.organizer.first_name} {event.organizer.last_name}

Please mark your calendar!

Best regards,
University Administration
        """
        
        recipient_emails = [user.email for user in recipients if user.email]
        
        if recipient_emails:
            return send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_emails,
                fail_silently=False,
            )
        return 0
    
    @staticmethod
    def send_assignment_notification(students, assignment):
        """Send assignment notification to students"""
        subject = f'New Assignment: {assignment.title}'
        message = f"""
New Assignment Posted

Course: {assignment.course.name}
Title: {assignment.title}
Due Date: {assignment.due_date.strftime('%Y-%m-%d %H:%M')}

Description:
{assignment.description}

Please submit your work before the deadline.

Best regards,
{assignment.course.instructor.first_name} {assignment.course.instructor.last_name}
        """
        
        recipient_emails = [student.email for student in students if student.email]
        
        if recipient_emails:
            return send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_emails,
                fail_silently=False,
            )
        return 0
    
    @staticmethod
    def send_grade_notification(student, course, grade):
        """Send grade notification to student"""
        subject = f'Grade Posted: {course.name}'
        message = f"""
Hello {student.first_name} {student.last_name},

A new grade has been posted for your course.

Course: {course.name}
Grade: {grade}

You can view more details in the University Management System.

Best regards,
University Administration
        """
        
        if student.email:
            return send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [student.email],
                fail_silently=False,
            )
        return 0
    
    @staticmethod
    def send_custom_email(recipients, subject, message):
        """Send custom email to specified recipients"""
        recipient_emails = [user.email for user in recipients if user.email]
        
        if recipient_emails:
            return send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_emails,
                fail_silently=False,
            )
        return 0

    @staticmethod
    def send_application_accepted_email(application, username, password, parent_username, parent_password):
        """Send acceptance email to applicant with login credentials"""
        subject = 'Congratulations! Your Application Has Been Accepted'
        message = f"""
Dear {application.first_name} {application.last_name},

We are delighted to inform you that your application to our university has been accepted!

Application Details:
- Reference Number: {application.reference_number}
- Program: {application.program.name}
- Status: Accepted

Congratulations on this achievement! We are excited to welcome you to our academic community.

Your Student Account:
Username: {username}
Temporary Password: {password}

Parent Account:
Username: {parent_username}
Temporary Password: {parent_password}

Please log in to the University Management System and change your password immediately for security purposes.
Login URL: {settings.FRONTEND_URL}/login

Next Steps:
1. Log in and change your password
2. Complete your student profile
3. Watch for enrollment instructions and orientation information

If you have any questions, please don't hesitate to contact our admissions office.

We look forward to seeing you on campus!

Best regards,
University Admissions Team
Email: admissions@university.edu
Phone: +1 (555) 123-4567
        """
        
        return send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [application.email],
            fail_silently=False,
        )
    
    @staticmethod
    def send_application_rejected_email(application):
        """Send rejection email to applicant"""
        subject = 'Application Status Update'
        message = f"""
Dear {application.first_name} {application.last_name},

Thank you for your interest in our university and for taking the time to submit your application.

Application Details:
- Reference Number: {application.reference_number}
- Program: {application.program.name}
- Status: Not Accepted

After careful review of your application, we regret to inform you that we are unable to offer you admission at this time. This decision was difficult, as we received many qualified applications for limited spaces.

We encourage you to:
- Consider reapplying in the future
- Explore other programs that may align with your goals
- Contact our admissions office if you would like feedback on your application

We appreciate your interest in our institution and wish you the very best in your educational pursuits.

Best regards,
University Admissions Team
Email: admissions@university.edu
Phone: +1 (555) 123-4567
        """
        
        return send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [application.email],
            fail_silently=False,
        )
