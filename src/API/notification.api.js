// notification.api.js
import axios from "../services/axiosInterceptor";

// GET notifications
export const getNotificationsAPI = (page = 1, limit = 20) =>
  axios.get(`/notifications?page=${page}&limit=${limit}`);

// MARK single as read
export const markNotificationReadAPI = (id) =>
  axios.patch(`/notifications/${id}/read`);

// MARK all as read
export const markAllNotificationsReadAPI = () =>
  axios.patch(`/notifications/read-all`);

// ✅ DELETE single notification
export const deleteNotificationAPI = (id) =>
  axios.delete(`/notifications/${id}`);

// ✅ DELETE all notifications
export const deleteAllNotificationsAPI = () =>
  axios.delete(`/notifications`);
