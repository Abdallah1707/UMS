import axiosInstance from './axios';
import { FACILITIES_ENDPOINTS } from './endpoints';

export const facilitiesService = {
  // Classrooms
  getClassrooms: () => axiosInstance.get(FACILITIES_ENDPOINTS.CLASSROOMS),
  
  getAllClassrooms: async () => {
    const response = await axiosInstance.get(FACILITIES_ENDPOINTS.CLASSROOMS);
    return response.data;
  },

  getClassroom: (id) => axiosInstance.get(FACILITIES_ENDPOINTS.CLASSROOM_DETAIL(id)),
  
  getClassroomDetail: async (classroomId) => {
    const response = await axiosInstance.get(FACILITIES_ENDPOINTS.CLASSROOM_DETAIL(classroomId));
    return response.data;
  },

  createClassroom: async (classroomData) => {
    const response = await axiosInstance.post(FACILITIES_ENDPOINTS.CLASSROOMS, classroomData);
    return response.data;
  },

  updateClassroom: async (classroomId, classroomData) => {
    const response = await axiosInstance.patch(FACILITIES_ENDPOINTS.CLASSROOM_DETAIL(classroomId), classroomData);
    return response.data;
  },

  deleteClassroom: async (classroomId) => {
    const response = await axiosInstance.delete(FACILITIES_ENDPOINTS.CLASSROOM_DETAIL(classroomId));
    return response.data;
  },

  // Available Classrooms
  getAvailableClassrooms: async (date, time_from, time_to, num_students) => {
    const response = await axiosInstance.post(FACILITIES_ENDPOINTS.AVAILABLE_CLASSROOMS, {
      date,
      time_from,
      time_to,
      num_students: parseInt(num_students),
    });
    return response.data;
  },

  // Bookings
  getBookings: () => axiosInstance.get(FACILITIES_ENDPOINTS.BOOKINGS),
  getBooking: (id) => axiosInstance.get(FACILITIES_ENDPOINTS.BOOKING_DETAIL(id)),
  createBooking: (data) => axiosInstance.post(FACILITIES_ENDPOINTS.BOOKINGS, data),
  updateBooking: (id, data) => axiosInstance.put(FACILITIES_ENDPOINTS.BOOKING_DETAIL(id), data),
  deleteBooking: (id) => axiosInstance.delete(FACILITIES_ENDPOINTS.BOOKING_DETAIL(id)),

  // Maintenance Tickets
  getMaintenanceTickets: () => axiosInstance.get(FACILITIES_ENDPOINTS.MAINTENANCE_TICKETS),
  getMaintenanceTicket: (id) => axiosInstance.get(FACILITIES_ENDPOINTS.MAINTENANCE_TICKET_DETAIL(id)),
  createMaintenanceTicket: (data) => axiosInstance.post(FACILITIES_ENDPOINTS.MAINTENANCE_TICKETS, data),
  updateMaintenanceTicket: (id, data) => axiosInstance.patch(FACILITIES_ENDPOINTS.MAINTENANCE_TICKET_DETAIL(id), data),
  deleteMaintenanceTicket: (id) => axiosInstance.delete(FACILITIES_ENDPOINTS.MAINTENANCE_TICKET_DETAIL(id)),

  // Resources
  getResources: () => axiosInstance.get(FACILITIES_ENDPOINTS.RESOURCES),
  getResource: (id) => axiosInstance.get(FACILITIES_ENDPOINTS.RESOURCE_DETAIL(id)),
  createResource: (data) => axiosInstance.post(FACILITIES_ENDPOINTS.RESOURCES, data),
  updateResource: (id, data) => axiosInstance.patch(FACILITIES_ENDPOINTS.RESOURCE_DETAIL(id), data),
  deleteResource: (id) => axiosInstance.delete(FACILITIES_ENDPOINTS.RESOURCE_DETAIL(id)),

  // Resource Allocations
  getResourceAllocations: (params) => axiosInstance.get(FACILITIES_ENDPOINTS.RESOURCE_ALLOCATIONS, { params }),
  getResourceAllocation: (id) => axiosInstance.get(FACILITIES_ENDPOINTS.RESOURCE_ALLOCATION_DETAIL(id)),
  createResourceAllocation: (data) => axiosInstance.post(FACILITIES_ENDPOINTS.RESOURCE_ALLOCATIONS, data),
  updateResourceAllocation: (id, data) => axiosInstance.patch(FACILITIES_ENDPOINTS.RESOURCE_ALLOCATION_DETAIL(id), data),
  deleteResourceAllocation: (id) => axiosInstance.delete(FACILITIES_ENDPOINTS.RESOURCE_ALLOCATION_DETAIL(id)),
};
