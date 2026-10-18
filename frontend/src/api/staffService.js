import axiosInstance from './axios';
import { STAFF_ENDPOINTS } from './endpoints';

export const staffService = {
  // Performance Reviews
  createReview: async (reviewData) => {
    const response = await axiosInstance.post(STAFF_ENDPOINTS.PERFORMANCE_REVIEWS, reviewData);
    return response.data;
  },

  getAllReviews: async (filters = {}) => {
    const response = await axiosInstance.get(STAFF_ENDPOINTS.PERFORMANCE_REVIEWS, { params: filters });
    return response.data;
  },

  getMyReviews: async () => {
    const response = await axiosInstance.get(STAFF_ENDPOINTS.MY_REVIEWS);
    return response.data;
  },

  getReviewDetail: async (id) => {
    const response = await axiosInstance.get(STAFF_ENDPOINTS.PERFORMANCE_REVIEW_DETAIL(id));
    return response.data;
  },

  updateReview: async (id, reviewData) => {
    const response = await axiosInstance.patch(STAFF_ENDPOINTS.PERFORMANCE_REVIEW_DETAIL(id), reviewData);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await axiosInstance.delete(STAFF_ENDPOINTS.PERFORMANCE_REVIEW_DETAIL(id));
    return response.data;
  },

  // Professional Development Activities
  getActivities: (params) => axiosInstance.get(STAFF_ENDPOINTS.DEVELOPMENT_ACTIVITIES, { params }),
  createActivity: (data) => axiosInstance.post(STAFF_ENDPOINTS.DEVELOPMENT_ACTIVITIES, data),
  updateActivity: (id, data) => axiosInstance.patch(STAFF_ENDPOINTS.DEVELOPMENT_ACTIVITY_DETAIL(id), data),
  deleteActivity: (id) => axiosInstance.delete(STAFF_ENDPOINTS.DEVELOPMENT_ACTIVITY_DETAIL(id)),

  // Activity Registrations
  getMyRegistrations: () => axiosInstance.get(STAFF_ENDPOINTS.ACTIVITY_REGISTRATIONS),
  registerForActivity: (activityId) => axiosInstance.post(STAFF_ENDPOINTS.ACTIVITY_REGISTRATIONS, { activity: activityId }),
  updateRegistrationStatus: (id, status, feedback = '') => axiosInstance.patch(STAFF_ENDPOINTS.ACTIVITY_REGISTRATION_DETAIL(id), { status, feedback }),
  getMyDevelopment: () => axiosInstance.get(STAFF_ENDPOINTS.MY_DEVELOPMENT),
  issueCertificate: (id) => axiosInstance.post(STAFF_ENDPOINTS.ISSUE_CERTIFICATE(id)),

  // Publications
  getPublications: (params) => axiosInstance.get(STAFF_ENDPOINTS.PUBLICATIONS, { params }),
  createPublication: (data) => axiosInstance.post(STAFF_ENDPOINTS.PUBLICATIONS, data),
  approvePublication: (id) => axiosInstance.post(STAFF_ENDPOINTS.APPROVE_PUBLICATION(id)),
  rejectPublication: (id) => axiosInstance.post(STAFF_ENDPOINTS.REJECT_PUBLICATION(id)),
  
  // Leave Requests
  getLeaveRequests: (params) => axiosInstance.get(STAFF_ENDPOINTS.LEAVE_REQUESTS, { params }),
  createLeaveRequest: (data) => axiosInstance.post(STAFF_ENDPOINTS.LEAVE_REQUESTS, data),
  approveLeave: (id) => axiosInstance.post(STAFF_ENDPOINTS.APPROVE_LEAVE(id)),
  rejectLeave: (id) => axiosInstance.post(STAFF_ENDPOINTS.REJECT_LEAVE(id)),
  
  // Payroll
  getPayrollRecords: (params) => axiosInstance.get(STAFF_ENDPOINTS.PAYROLL, { params }),
  createPayrollRecord: (data) => axiosInstance.post(STAFF_ENDPOINTS.PAYROLL, data),
  getPayrollDetail: (id) => axiosInstance.get(STAFF_ENDPOINTS.PAYROLL_DETAIL(id)),
  updatePayrollRecord: (id, data) => axiosInstance.patch(STAFF_ENDPOINTS.PAYROLL_DETAIL(id), data),
  deletePayrollRecord: (id) => axiosInstance.delete(STAFF_ENDPOINTS.PAYROLL_DETAIL(id)),
  processPayroll: (id) => axiosInstance.post(STAFF_ENDPOINTS.PROCESS_PAYROLL(id)),
  getMyPayrollHistory: () => axiosInstance.get(STAFF_ENDPOINTS.MY_PAYROLL_HISTORY),
  getPayrollReport: (params) => axiosInstance.get(STAFF_ENDPOINTS.PAYROLL_REPORT, { params }),
};
