# University Management System

A comprehensive web-based university management system designed to streamline administrative tasks, facilitate communication, and manage academic operations efficiently. Built with a modern tech stack using Django REST Framework for the backend and React for the frontend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Backend Documentation](#backend-documentation)
- [Frontend Documentation](#frontend-documentation)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)

## Overview

The University Management System is a full-stack application that enables universities to manage:

- User accounts and authentication with dynamic attributes
- Role-based access control
- Department and application management
- Comprehensive curriculum management (courses, assignments, quizzes, grades)
- Facilities management (classrooms, bookings, maintenance)
- Community features (messaging, announcements, events)
- Staff management (performance reviews, leave requests, payroll)
- Student attendance and course registration

The system provides a secure JWT-based authentication mechanism with role-based permissions for different user types (Admin, Student, Professor, Teaching Assistant, Parent).

## Features

### Authentication & Security

- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Token Blacklisting** - Logout functionality with token revocation
- **First Login Password Change** - Force password change on initial login
- **Password Reset** - User password recovery functionality
- **CORS Enabled** - Cross-origin resource sharing for frontend integration
- **Role-Based Access Control** - Fine-grained permission management

### User Management

- **Multiple User Roles** - Admin, Student, Professor, Teaching Assistant, Parent
- **Dynamic User Attributes** - Flexible attribute system with support for text, number, date, and boolean types
- **Auto-generated User IDs** - Role-based ID generation (AD, ST, PR, TA, PA prefixes)
- **User Profiles** - Comprehensive user information with role-specific fields
- **Application System** - Student application submission with document uploads and status tracking

### Curriculum Features

- **Course Management** - Core and elective courses with prerequisites, credits, and registration
- **Assignments & Quizzes** - Create, submit, and grade assignments with file uploads
- **Quiz System** - MCQ and text-based questions with automated grading
- **Grade Management** - Midterm, project, coursework, and final grades
- **Course Materials** - Upload and manage lecture notes and tutorials
- **Course Scheduling** - Weekly schedule management with instructor assignments
- **Attendance Tracking** - Record and monitor student attendance

### Facilities Management

- **Classroom Management** - Track classrooms with capacity, equipment, and availability
- **Booking System** - Reserve classrooms with conflict prevention
- **Maintenance Tickets** - Submit and track facility maintenance requests

### Community Features

- **Messaging System** - Direct messaging between users with reply threading
- **Announcements** - Targeted announcements for specific user groups
- **Events** - Create and manage university events with date, time, and location

### Staff Management

- **Performance Reviews** - Rating system with review periods and comments
- **Professional Development** - Workshops, conferences, and certifications tracking
- **Leave Management** - Submit and approve leave requests (sick, vacation, personal, emergency)
- **Payroll System** - Salary management with deductions and payment tracking
- **Publications** - Track research publications with DOI and approval workflow

## Tech Stack

### Backend

- **Framework**: Django 5.0.6
- **REST API**: Django REST Framework
- **Authentication**: Simple JWT (django-rest-framework-simplejwt)
- **Database**: SQLite3 (Development), PostgreSQL (Production)
- **CORS**: django-cors-headers
- **File Handling**: Media files for uploads (transcripts, IDs, photos, course materials)
- **Language**: Python 3.x

### Frontend

- **Library**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Router**: React Router DOM 7.9.6
- **HTTP Client**: Axios 1.13.2
- **JWT Decoding**: jwt-decode 4.0.0
- **Icons**: React Icons 5.5.0
- **Dev Tools**: React DevTools 1.0.5
- **Linting**: ESLint 9.36.0

## Project Structure

```
University-Management-System/
├── backend/
│   ├── manage.py
│   ├── db.sqlite3
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── core/
│   │   ├── models.py (User, Department, Application, Attribute, User_Attribute, PasswordResetToken)
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── permissions.py
│   │   ├── urls.py
│   │   ├── exceptions.py
│   │   └── migrations/
│   ├── curriculum/
│   │   ├── models.py (Course, CourseRegistration, Assignment, Submission, Grade, Quiz, Question, QuizSubmission, CourseMaterial, CourseSchedule, Attendance)
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── migrations/
│   ├── facilities/
│   │   ├── models.py (MaintenanceTicket, Classroom, Booking)
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── migrations/
│   ├── community/
│   │   ├── models.py (Message, Announcement, Event)
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── email_service.py
│   │   ├── urls.py
│   │   └── migrations/
│   ├── staff/
│   │   ├── models.py (PerformanceReview, ProfessionalDevelopmentActivity, StaffActivityRegistration, Publication, LeaveRequest, PayrollRecord)
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── migrations/
│   └── media/
│       ├── applications/ (transcripts, ids, photos)
│       └── course_materials/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   ├── endpoints.js
│   │   │   ├── coreService.js
│   │   │   ├── curriculumService.js
│   │   │   ├── facilitiesService.js
│   │   │   ├── communityService.js
│   │   │   └── staffService.js
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ErrorBox.jsx
│   │   │   ├── Announcements.jsx
│   │   │   └── AnnouncementsAndEvents.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   ├── Admin/
│   │   │   ├── Student/
│   │   │   ├── Staff/
│   │   │   └── Parent/
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   └── assets/
│   └── public/
├── postman/
│   ├── README.md
│   ├── University-Management-System-API-collection.json
│   └── University-Management-System-environment.postman_environment.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**

   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**

   ```bash
   pip install django djangorestframework django-rest-framework-simplejwt django-cors-headers
   ```

5. **Run migrations**

   ```bash
   python manage.py migrate
   ```

6. **Create superuser (Admin)**

   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Lint code**
   ```bash
   npm run lint
   ```

## Backend Documentation

### Database Models

#### Core App Models

**User Model** - Custom user extending AbstractUser:
- user_type (admin, student, professor, ta, parent)
- department (ForeignKey)
- phone_number (validated Egyptian format)
- user_id (auto-generated with role prefix)
- is_first_login, password_changed_at, Resetpassword
- Dynamic attributes support via User_Attribute

**Department Model** - name, code, description

**Application Model** - Student applications with:
- Personal info (name, email, phone)
- Program selection
- Document uploads (transcript, ID, photo)
- Parent information
- Status tracking (in_review, accepted, rejected)
- Unique reference number

**Attribute & User_Attribute** - Dynamic attribute system supporting text, number, date, and boolean types

**PasswordResetToken** - Secure password reset with expiration

#### Curriculum App Models

- **Course** - Code, name, type (core/elective), credits, prerequisites, instructors
- **CourseRegistration** - Student course enrollments
- **Assignment** - Assignments and exams with due dates and attachments
- **Submission** - Student submissions with grading and feedback
- **Grade** - Midterm, project, coursework, and final grades
- **Quiz** - Quiz creation with questions
- **Question** - MCQ and text questions with correct answers
- **QuizSubmission** - Student quiz responses and grading
- **CourseMaterial** - Lecture notes and tutorials
- **CourseSchedule** - Weekly course schedules
- **Attendance** - Student attendance tracking (present, absent, late)

#### Facilities App Models

- **MaintenanceTicket** - Facility maintenance requests with status tracking
- **Classroom** - Room details with capacity and equipment
- **Booking** - Classroom reservations with conflict prevention

#### Community App Models

- **Message** - User-to-user messaging with threading
- **Announcement** - Targeted announcements with deadlines
- **Event** - University events with date, time, and location

#### Staff App Models

- **PerformanceReview** - Staff performance ratings and comments
- **ProfessionalDevelopmentActivity** - Training and development programs
- **StaffActivityRegistration** - Staff enrollment in activities
- **Publication** - Research publications with DOI and approval workflow
- **LeaveRequest** - Leave applications with approval workflow
- **PayrollRecord** - Salary, deductions, and payment tracking

### API Endpoints

#### Core App (`/core/`)

**Authentication:**
- `POST /token/` - Login (obtain JWT tokens)
- `POST /token/refresh/` - Refresh access token
- `POST /logout/` - Logout user

**User Management:**
- `POST /users/create/` - Create user (Admin only)
- `GET /users/` - List users with filtering
- `GET /users/<id>/` - Get user details
- `PUT /users/<id>/` - Update user
- `DELETE /users/<id>/` - Delete user
- `GET /profile/` - Get current user profile
- `PUT /profile/` - Update profile

**Password Management:**
- `POST /change-password/` - Change password
- `POST /first-login-password-change/` - First login password change
- `POST /password-reset/request/` - Request password reset
- `POST /password-reset/verify/` - Verify reset token
- `POST /password-reset/confirm/` - Confirm new password

**Applications & Departments:**
- `POST /applications/` - Submit application
- `GET /applications/` - List applications
- `GET /applications/<id>/` - Get application details
- `PUT /applications/<id>/status/` - Update application status
- `GET /departments/` - List departments
- `POST /departments/` - Create department (Admin)

**Dynamic Attributes:**
- `GET /attributes/` - List available attributes
- `POST /user-attributes/` - Set user attribute
- `GET /user-attributes/<user_id>/` - Get user attributes

#### Curriculum App (`/curriculum/`)

**Courses:**
- `GET /courses/` - List courses
- `POST /courses/` - Create course
- `GET /courses/<id>/` - Course details
- `POST /courses/<id>/register/` - Register for course
- `GET /my-courses/` - Get enrolled courses

**Assignments & Submissions:**
- `GET /assignments/` - List assignments
- `POST /assignments/` - Create assignment
- `POST /assignments/<id>/submit/` - Submit assignment
- `GET /submissions/` - List submissions
- `PUT /submissions/<id>/grade/` - Grade submission

**Quizzes:**
- `GET /quizzes/` - List quizzes
- `POST /quizzes/` - Create quiz
- `POST /quizzes/<id>/submit/` - Submit quiz
- `GET /quiz-submissions/` - List quiz submissions

**Grades & Attendance:**
- `GET /grades/` - Get grades
- `POST /grades/` - Create/update grade
- `GET /attendance/` - Get attendance records
- `POST /attendance/` - Record attendance

**Course Materials & Schedule:**
- `GET /materials/` - List course materials
- `POST /materials/` - Upload material
- `GET /schedule/` - Get course schedule
- `POST /schedule/` - Create schedule entry

#### Facilities App (`/facilities/`)

- `GET /classrooms/` - List classrooms
- `POST /classrooms/` - Create classroom
- `GET /bookings/` - List bookings
- `POST /bookings/` - Create booking
- `GET /maintenance-tickets/` - List tickets
- `POST /maintenance-tickets/` - Create ticket
- `PUT /maintenance-tickets/<id>/` - Update ticket status

#### Community App (`/community/`)

- `GET /messages/` - List messages
- `POST /messages/` - Send message
- `GET /messages/<id>/` - Get message details
- `POST /messages/<id>/reply/` - Reply to message
- `GET /announcements/` - List announcements
- `POST /announcements/` - Create announcement (Admin)
- `GET /events/` - List events
- `POST /events/` - Create event (Admin)

#### Staff App (`/staff/`)

- `GET /performance-reviews/` - List reviews
- `POST /performance-reviews/` - Create review
- `GET /activities/` - List professional development activities
- `POST /activities/register/` - Register for activity
- `GET /publications/` - List publications
- `POST /publications/` - Submit publication
- `GET /leave-requests/` - List leave requests
- `POST /leave-requests/` - Submit leave request
- `PUT /leave-requests/<id>/approve/` - Approve/reject leave
- `GET /payroll/` - List payroll records
- `POST /payroll/` - Create payroll record

### Permissions

The system implements custom permission classes:

- **IsAdmin** - User must be an admin
- **IsOwnerOrAdmin** - User is the owner of the object or is an admin
- **IsAuthenticated** - User must be logged in

### Configuration

Key settings in `settings.py`:

- **JWT Settings**: 60-minute access token lifetime, 7-day refresh token lifetime
- **CORS Origins**: Configured for `http://localhost:5173` (React dev server)
- **Database**: SQLite3 for development
- **Authentication**: JWT-based with token blacklisting

## Frontend Documentation

### Directory Structure

- **`/api`** - API service layer

  - `axios.js` - Axios instance configuration with interceptors
  - `endpoints.js` - API endpoint definitions
  - `coreService.js` - User, auth, and application services
  - `curriculumService.js` - Course, assignment, and grade services
  - `facilitiesService.js` - Classroom and booking services
  - `communityService.js` - Messaging, announcements, and events
  - `staffService.js` - Staff management services

- **`/components`** - Reusable React components

  - `ProtectedRoute.jsx` - Route guard for authenticated pages
  - `ErrorBox.jsx` - Error display component
  - `Announcements.jsx` - Announcements display
  - `AnnouncementsAndEvents.jsx` - Combined announcements and events

- **`/context`** - React Context for state management

  - `AuthContext.jsx` - Authentication state and user info

- **`/pages`** - Page components by role

  - `Auth/` - Login, password reset, first login
  - `Admin/` - Admin dashboard, user management, applications
  - `Student/` - Student dashboard, courses, assignments, grades
  - `Staff/` - Staff dashboard, courses, performance, leave
  - `Parent/` - Parent dashboard

- **`/routes`** - Route configuration
  - `AppRoutes.jsx` - Main application routes with role-based navigation

### Key Features

- **Protected Routes** - Routes protected by authentication and role
- **JWT Token Management** - Automatic token refresh and storage
- **Responsive UI** - Mobile-friendly design
- **Error Handling** - Comprehensive error handling and user feedback
- **Icon Support** - React Icons for UI enhancements

### Environment Variables

Create a `.env` file in the frontend directory (if needed):

```
VITE_API_URL=http://localhost:8000
```

## User Roles & Permissions

### Admin

- Create and manage user accounts with dynamic attributes
- Review and process student applications
- Manage departments and courses
- Create announcements and events
- View all system data and reports
- Manage facilities and maintenance tickets
- Process staff leave requests and payroll

### Student

- Submit university applications
- Register for courses
- View course materials and schedules
- Submit assignments and quizzes
- View grades and attendance
- Send and receive messages
- View announcements and events

### Professor

- Manage assigned courses
- Create and grade assignments and quizzes
- Upload course materials
- Record student attendance
- Manage course schedules
- Submit publications
- Request professional development activities
- Submit leave requests
- View performance reviews and payroll

### Teaching Assistant (TA)

- Assist with course management
- Grade assignments and quizzes
- Upload course materials
- Record attendance
- Similar to professor with limited administrative privileges

### Parent

- View child's academic information
- View grades and attendance
- Receive announcements and event notifications
- Communicate with staff

## Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Production Mode

**Backend:**

1. Set `DEBUG = False` in settings.py
2. Configure allowed hosts
3. Use a production database (PostgreSQL recommended)
4. Deploy using gunicorn or similar WSGI server

**Frontend:**

1. Run `npm run build`
2. Deploy the `dist` folder to a static hosting service or serve from Django

## Testing

### Backend Tests

```bash
python manage.py test
```

### Frontend Tests (if configured)

```bash
npm run test
```

## API Documentation

Complete API documentation is available in Postman format:

- **Collection**: `postman/University-Management-System-API-collection.json`
- **Environment**: `postman/University-Management-System-environment.postman_environment.json`

Import these files into Postman to explore all available endpoints.

## Contributing

1. Create a feature branch from `main` or appropriate branch
2. Make your changes
3. Test thoroughly
4. Create a pull request with clear description
5. Ensure code follows project conventions

## License

This project is part of an academic initiative for university management.

## Support

For issues and questions, please contact the development team or refer to the Postman API documentation.