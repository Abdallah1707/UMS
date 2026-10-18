import axiosInstance from './axios';
import { CORE_ENDPOINTS } from './endpoints';

export const coreService = {
  // Auth
  login: async (username, password) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.LOGIN, { username, password });
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.LOGOUT, { refresh_token: refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get(CORE_ENDPOINTS.PROFILE);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.patch(CORE_ENDPOINTS.PROFILE, userData);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword, newPasswordConfirm) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return response.data;
  },

  firstLoginPasswordChange: async (newPassword, newPasswordConfirm) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.FIRST_LOGIN_PASSWORD_CHANGE, {
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return response.data;
  },

  passwordReset: async (username, newPassword, newPasswordConfirm) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.PASSWORD_RESET, {
      username,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return response.data;
  },

  // Users
  createUser: async (userData) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.USERS_CREATE, userData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get(CORE_ENDPOINTS.USERS_LIST);
    const users = response.data || [];
    return { data: users.filter(user => user.user_type !== 'admin') };
  },

  getUsers: async (userType = null) => {
    const params = userType ? { user_type: userType } : {};
    const response = await axiosInstance.get(CORE_ENDPOINTS.USERS_LIST, { params });
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await axiosInstance.get(CORE_ENDPOINTS.USER_DETAIL(userId));
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axiosInstance.patch(CORE_ENDPOINTS.USER_DETAIL(userId), userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(CORE_ENDPOINTS.USER_DETAIL(userId));
    return response.data;
  },

  toggleResetPassword: async (userId) => {
    const response = await axiosInstance.patch(CORE_ENDPOINTS.USER_TOGGLE_RESET(userId));
    return response.data;
  },

  getStudents: async () => {
    const response = await axiosInstance.get(CORE_ENDPOINTS.STUDENTS_LIST);
    return response.data;
  },

  // Departments
  getAllDepartments: async () => {
    const response = await axiosInstance.get(CORE_ENDPOINTS.DEPARTMENTS_LIST);
    return response.data;
  },

  getDepartmentDetail: async (departmentId) => {
    const response = await axiosInstance.get(CORE_ENDPOINTS.DEPARTMENT_DETAIL(departmentId));
    return response.data;
  },

  createDepartment: async (departmentData) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.DEPARTMENTS_LIST, departmentData);
    return response.data;
  },

  updateDepartment: async (departmentId, departmentData) => {
    const response = await axiosInstance.patch(CORE_ENDPOINTS.DEPARTMENT_DETAIL(departmentId), departmentData);
    return response.data;
  },

  deleteDepartment: async (departmentId) => {
    const response = await axiosInstance.delete(CORE_ENDPOINTS.DEPARTMENT_DETAIL(departmentId));
    return response.data;
  },

  // Applications
  getDepartments: async () => {
    const response = await axiosInstance.get(CORE_ENDPOINTS.DEPARTMENTS_LIST);
    return response;
  },

  submitApplication: async (formData) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.APPLICATIONS_SUBMIT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  },

  confirmPasswordReset: async (data) => {
    const response = await axiosInstance.post(CORE_ENDPOINTS.PASSWORD_RESET_CONFIRM, data);
    return response;
  },
};
