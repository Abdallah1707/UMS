// Core Module Endpoints
export const CORE_ENDPOINTS = {
  // Auth
  LOGIN: '/core/auth/login/',
  LOGOUT: '/core/auth/logout/',
  REFRESH: '/core/auth/token/refresh/',
  PROFILE: '/core/profile/',
  CHANGE_PASSWORD: '/core/auth/change-password/',
  FIRST_LOGIN_PASSWORD_CHANGE: '/core/auth/first-login-password-change/',
  PASSWORD_RESET: '/core/auth/password-reset/',
  PASSWORD_RESET_CONFIRM: '/core/auth/password-reset/confirm/',
  APPLICATIONS_SUBMIT: '/core/applications/submit/',
  
  // Users
  USERS_CREATE: '/core/users/create/',
  USERS_LIST: '/core/users/',
  USER_DETAIL: (id) => `/core/users/${id}/`,
  USER_TOGGLE_RESET: (id) => `/core/users/${id}/toggle-reset-password/`,
  STUDENTS_LIST: '/core/students/',
  
  // Departments
  DEPARTMENTS_LIST: '/core/departments/',
  DEPARTMENT_DETAIL: (id) => `/core/departments/${id}/`,
};

// Facilities Module Endpoints
export const FACILITIES_ENDPOINTS = {
  CLASSROOMS: '/facilities/classrooms/',
  CLASSROOM_DETAIL: (id) => `/facilities/classrooms/${id}/`,
  AVAILABLE_CLASSROOMS: '/facilities/available-classrooms/',
  BOOKINGS: '/facilities/bookings/',
  BOOKING_DETAIL: (id) => `/facilities/bookings/${id}/`,
  MAINTENANCE_TICKETS: '/facilities/maintenance-tickets/',
  MAINTENANCE_TICKET_DETAIL: (id) => `/facilities/maintenance-tickets/${id}/`,
  RESOURCES: '/facilities/resources/',
  RESOURCE_DETAIL: (id) => `/facilities/resources/${id}/`,
  RESOURCE_ALLOCATIONS: '/facilities/resource-allocations/',
  RESOURCE_ALLOCATION_DETAIL: (id) => `/facilities/resource-allocations/${id}/`,
};

// Curriculum Module Endpoints
export const CURRICULUM_ENDPOINTS = {
  COURSES: '/curriculum/courses/',
  COURSE_DETAIL: (id) => `/curriculum/courses/${id}/`,
  COURSE_STUDENTS: (id) => `/curriculum/courses/${id}/students/`,
  COURSE_GRADES: (id) => `/curriculum/courses/${id}/grades/`,
  COURSE_ASSIGNMENTS: (id) => `/curriculum/courses/${id}/assignments/`,
  COURSE_QUIZZES: (id) => `/curriculum/courses/${id}/quizzes/`,
  
  REGISTRATIONS: '/curriculum/registrations/',
  REGISTRATION_DETAIL: (id) => `/curriculum/registrations/${id}/`,
  
  ASSIGNMENTS: '/curriculum/assignments/',
  ASSIGNMENT_DETAIL: (id) => `/curriculum/assignments/${id}/`,
  ASSIGNMENT_SUBMIT: (id) => `/curriculum/assignments/${id}/submit/`,
  ASSIGNMENT_SUBMISSIONS: (id) => `/curriculum/assignments/${id}/submissions/`,
  
  QUIZZES: '/curriculum/quizzes/',
  QUIZ_DETAIL: (id) => `/curriculum/quizzes/${id}/`,
  QUIZ_QUESTIONS: (id) => `/curriculum/quizzes/${id}/questions/`,
  QUIZ_SUBMISSIONS: (id) => `/curriculum/quizzes/${id}/submissions/`,
  
  QUESTIONS: '/curriculum/questions/',
  QUESTION_DETAIL: (id) => `/curriculum/questions/${id}/`,
  
  QUIZ_SUBMISSIONS_LIST: '/curriculum/quiz-submissions/',
  QUIZ_SUBMISSION_DETAIL: (id) => `/curriculum/quiz-submissions/${id}/`,
  
  SUBMISSIONS: '/curriculum/submissions/',
  SUBMISSION_DETAIL: (id) => `/curriculum/submissions/${id}/`,
  
  COURSE_MATERIALS: '/curriculum/course-materials/',
  COURSE_MATERIAL_DETAIL: (id) => `/curriculum/course-materials/${id}/`,
  
  COURSE_SCHEDULES: '/curriculum/course-schedules/',
  COURSE_SCHEDULE_DETAIL: (id) => `/curriculum/course-schedules/${id}/`,
  
  STUDENT_GRADES: '/curriculum/student/grades/',
  GENERATE_TRANSCRIPT: '/curriculum/student/generate-transcript/',
  
  ATTENDANCE: '/curriculum/attendance/',
  ATTENDANCE_DETAIL: (id) => `/curriculum/attendance/${id}/`,
  PARENT_CHILD_ATTENDANCE: '/curriculum/parent/child-attendance/',
};

// Staff Module Endpoints
export const STAFF_ENDPOINTS = {
  PERFORMANCE_REVIEWS: '/staff/performance-reviews/',
  PERFORMANCE_REVIEW_DETAIL: (id) => `/staff/performance-reviews/${id}/`,
  MY_REVIEWS: '/staff/performance-reviews/my_reviews/',
  
  DEVELOPMENT_ACTIVITIES: '/staff/development-activities/',
  DEVELOPMENT_ACTIVITY_DETAIL: (id) => `/staff/development-activities/${id}/`,
  
  ACTIVITY_REGISTRATIONS: '/staff/activity-registrations/',
  ACTIVITY_REGISTRATION_DETAIL: (id) => `/staff/activity-registrations/${id}/`,
  MY_DEVELOPMENT: '/staff/activity-registrations/my_development/',
  ISSUE_CERTIFICATE: (id) => `/staff/activity-registrations/${id}/issue_certificate/`,
  
  PUBLICATIONS: '/staff/publications/',
  PUBLICATION_DETAIL: (id) => `/staff/publications/${id}/`,
  APPROVE_PUBLICATION: (id) => `/staff/publications/${id}/approve/`,
  REJECT_PUBLICATION: (id) => `/staff/publications/${id}/reject/`,
  
  LEAVE_REQUESTS: '/staff/leave-requests/',
  LEAVE_REQUEST_DETAIL: (id) => `/staff/leave-requests/${id}/`,
  APPROVE_LEAVE: (id) => `/staff/leave-requests/${id}/approve/`,
  REJECT_LEAVE: (id) => `/staff/leave-requests/${id}/reject/`,
  
  PAYROLL: '/staff/payroll/',
  PAYROLL_DETAIL: (id) => `/staff/payroll/${id}/`,
  PROCESS_PAYROLL: (id) => `/staff/payroll/${id}/process_payroll/`,
  MY_PAYROLL_HISTORY: '/staff/payroll/my_history/',
  PAYROLL_REPORT: '/staff/payroll/report/',
};

// Community Module Endpoints
export const COMMUNITY_ENDPOINTS = {
  ANNOUNCEMENTS: '/community/announcements/',
  ANNOUNCEMENT_DETAIL: (id) => `/community/announcements/${id}/`,
  
  EVENTS: '/community/events/',
  EVENT_DETAIL: (id) => `/community/events/${id}/`,
  
  MESSAGES: '/community/messages/',
  MESSAGE_DETAIL: (id) => `/community/messages/${id}/`,
  INBOX: '/community/messages/inbox/',
  SENT: '/community/messages/sent/',
  MARK_READ: (id) => `/community/messages/${id}/mark_read/`,
  AVAILABLE_PROFESSORS: '/community/messages/available_professors/',
  AVAILABLE_STUDENTS: '/community/messages/available_students/',
  CONVERSATION: '/community/messages/conversation/',
  SEND_ANNOUNCEMENT: '/community/messages/send_announcement/',
};
