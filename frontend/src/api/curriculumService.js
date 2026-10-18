import axiosInstance from './axios';
import { CURRICULUM_ENDPOINTS } from './endpoints';

export const curriculumService = {
  // Courses
  getCourses: (params = {}) => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSES, { params }),
  getCourse: (id) => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSE_DETAIL(id)),
  createCourse: (courseData) => axiosInstance.post(CURRICULUM_ENDPOINTS.COURSES, courseData),
  updateCourse: (id, courseData) => axiosInstance.put(CURRICULUM_ENDPOINTS.COURSE_DETAIL(id), courseData),
  deleteCourse: (id) => axiosInstance.delete(CURRICULUM_ENDPOINTS.COURSE_DETAIL(id)),
  getCourseStudents: (courseId) => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSE_STUDENTS(courseId)),
  getCourseGrades: (courseId) => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSE_GRADES(courseId)),
  updateGrade: (courseId, gradeData) => axiosInstance.post(CURRICULUM_ENDPOINTS.COURSE_GRADES(courseId), gradeData),
  getCourseAssignments: (courseId) => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSE_ASSIGNMENTS(courseId)),
  getCourseQuizzes: (courseId) => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSE_QUIZZES(courseId)),

  // Registrations
  getMyRegistrations: () => axiosInstance.get(CURRICULUM_ENDPOINTS.REGISTRATIONS),
  registerCourse: (courseId) => axiosInstance.post(CURRICULUM_ENDPOINTS.REGISTRATIONS, { course: courseId }),
  unregisterCourse: (registrationId) => axiosInstance.delete(CURRICULUM_ENDPOINTS.REGISTRATION_DETAIL(registrationId)),

  // Assignments
  getAssignments: () => axiosInstance.get(CURRICULUM_ENDPOINTS.ASSIGNMENTS),
  getAssignment: (id) => axiosInstance.get(CURRICULUM_ENDPOINTS.ASSIGNMENT_DETAIL(id)),
  createAssignment: (assignmentData) => axiosInstance.post(CURRICULUM_ENDPOINTS.ASSIGNMENTS, assignmentData),
  updateAssignment: (id, assignmentData) => axiosInstance.patch(CURRICULUM_ENDPOINTS.ASSIGNMENT_DETAIL(id), assignmentData),
  deleteAssignment: (id) => axiosInstance.delete(CURRICULUM_ENDPOINTS.ASSIGNMENT_DETAIL(id)),
  getSubmission: (assignmentId) => axiosInstance.get(CURRICULUM_ENDPOINTS.ASSIGNMENT_SUBMIT(assignmentId)),
  submitAssignment: (assignmentId, formData) => axiosInstance.post(CURRICULUM_ENDPOINTS.ASSIGNMENT_SUBMIT(assignmentId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAssignmentSubmissions: (assignmentId) => axiosInstance.get(CURRICULUM_ENDPOINTS.ASSIGNMENT_SUBMISSIONS(assignmentId)),
  gradeSubmission: (submissionId, gradeData) => axiosInstance.patch(CURRICULUM_ENDPOINTS.SUBMISSION_DETAIL(submissionId), gradeData),

  // Quizzes
  getQuizzes: () => axiosInstance.get(CURRICULUM_ENDPOINTS.QUIZZES),
  getQuiz: (id) => axiosInstance.get(CURRICULUM_ENDPOINTS.QUIZ_DETAIL(id)),
  createQuiz: (quizData) => axiosInstance.post(CURRICULUM_ENDPOINTS.QUIZZES, quizData),
  updateQuiz: (id, quizData) => axiosInstance.patch(CURRICULUM_ENDPOINTS.QUIZ_DETAIL(id), quizData),
  deleteQuiz: (id) => axiosInstance.delete(CURRICULUM_ENDPOINTS.QUIZ_DETAIL(id)),
  getQuizQuestions: (quizId) => axiosInstance.get(CURRICULUM_ENDPOINTS.QUIZ_QUESTIONS(quizId)),
  getQuizSubmissions: (quizId) => axiosInstance.get(CURRICULUM_ENDPOINTS.QUIZ_SUBMISSIONS(quizId)),
  getQuizSubmissionsList: () => axiosInstance.get(CURRICULUM_ENDPOINTS.QUIZ_SUBMISSIONS_LIST),
  submitQuiz: (submissionData) => axiosInstance.post(CURRICULUM_ENDPOINTS.QUIZ_SUBMISSIONS_LIST, submissionData),
  gradeQuizSubmission: (id, gradeData) => axiosInstance.patch(CURRICULUM_ENDPOINTS.QUIZ_SUBMISSION_DETAIL(id), gradeData),

  // Questions
  getQuestions: () => axiosInstance.get(CURRICULUM_ENDPOINTS.QUESTIONS),
  getQuestion: (id) => axiosInstance.get(CURRICULUM_ENDPOINTS.QUESTION_DETAIL(id)),
  createQuestion: (questionData) => axiosInstance.post(CURRICULUM_ENDPOINTS.QUESTIONS, questionData),
  updateQuestion: (id, questionData) => axiosInstance.patch(CURRICULUM_ENDPOINTS.QUESTION_DETAIL(id), questionData),
  deleteQuestion: (id) => axiosInstance.delete(CURRICULUM_ENDPOINTS.QUESTION_DETAIL(id)),

  // Course Materials
  getMaterials: () => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSE_MATERIALS),
  uploadMaterial: (formData) => axiosInstance.post(CURRICULUM_ENDPOINTS.COURSE_MATERIALS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMaterial: (id) => axiosInstance.delete(CURRICULUM_ENDPOINTS.COURSE_MATERIAL_DETAIL(id)),

  // Schedules
  getSchedules: () => axiosInstance.get(CURRICULUM_ENDPOINTS.COURSE_SCHEDULES),
  createSchedule: (data) => axiosInstance.post(CURRICULUM_ENDPOINTS.COURSE_SCHEDULES, data),
  deleteSchedule: (id) => axiosInstance.delete(CURRICULUM_ENDPOINTS.COURSE_SCHEDULE_DETAIL(id)),

  // Grades
  getStudentGrades: async () => {
    const response = await axiosInstance.get(CURRICULUM_ENDPOINTS.STUDENT_GRADES);
    return response.data;
  },

  generateTranscript: async () => {
    const response = await axiosInstance.post(CURRICULUM_ENDPOINTS.GENERATE_TRANSCRIPT);
    return response;
  },

  // Attendance
  getAttendance: () => axiosInstance.get(CURRICULUM_ENDPOINTS.ATTENDANCE),
  createAttendance: (attendanceData) => axiosInstance.post(CURRICULUM_ENDPOINTS.ATTENDANCE, attendanceData),
  updateAttendance: (id, attendanceData) => axiosInstance.patch(CURRICULUM_ENDPOINTS.ATTENDANCE_DETAIL(id), attendanceData),
  deleteAttendance: (id) => axiosInstance.delete(CURRICULUM_ENDPOINTS.ATTENDANCE_DETAIL(id)),
  
  // Parent attendance
  getChildAttendance: () => axiosInstance.get(CURRICULUM_ENDPOINTS.PARENT_CHILD_ATTENDANCE),
};
