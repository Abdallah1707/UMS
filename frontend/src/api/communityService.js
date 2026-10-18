import axiosInstance from './axios';
import { COMMUNITY_ENDPOINTS } from './endpoints';

export const communityService = {
  // Announcements
  getAnnouncements: async () => {
    const response = await axiosInstance.get(COMMUNITY_ENDPOINTS.ANNOUNCEMENTS);
    return response.data;
  },

  createAnnouncement: async (data) => {
    const response = await axiosInstance.post(COMMUNITY_ENDPOINTS.ANNOUNCEMENTS, data);
    return response.data;
  },

  updateAnnouncement: async (id, data) => {
    const response = await axiosInstance.put(COMMUNITY_ENDPOINTS.ANNOUNCEMENT_DETAIL(id), data);
    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await axiosInstance.delete(COMMUNITY_ENDPOINTS.ANNOUNCEMENT_DETAIL(id));
    return response.data;
  },

  // Events
  getEvents: async () => {
    const response = await axiosInstance.get(COMMUNITY_ENDPOINTS.EVENTS);
    return response.data;
  },

  createEvent: async (data) => {
    const response = await axiosInstance.post(COMMUNITY_ENDPOINTS.EVENTS, data);
    return response.data;
  },

  updateEvent: async (id, data) => {
    const response = await axiosInstance.put(COMMUNITY_ENDPOINTS.EVENT_DETAIL(id), data);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(COMMUNITY_ENDPOINTS.EVENT_DETAIL(id));
    return response.data;
  },

  // Messaging
  getInbox: () => axiosInstance.get(COMMUNITY_ENDPOINTS.INBOX),
  getSent: () => axiosInstance.get(COMMUNITY_ENDPOINTS.SENT),
  sendMessage: (data) => axiosInstance.post(COMMUNITY_ENDPOINTS.MESSAGES, data),
  markAsRead: (id) => axiosInstance.post(COMMUNITY_ENDPOINTS.MARK_READ(id)),
  deleteMessage: (id) => axiosInstance.delete(COMMUNITY_ENDPOINTS.MESSAGE_DETAIL(id)),
  getAvailableProfessors: () => axiosInstance.get(COMMUNITY_ENDPOINTS.AVAILABLE_PROFESSORS),
  getAvailableStudents: () => axiosInstance.get(COMMUNITY_ENDPOINTS.AVAILABLE_STUDENTS),
  getConversation: (userId) => axiosInstance.get(`${COMMUNITY_ENDPOINTS.CONVERSATION}?user_id=${userId}`),
  sendAnnouncement: (data) => axiosInstance.post(COMMUNITY_ENDPOINTS.SEND_ANNOUNCEMENT, data),
};
