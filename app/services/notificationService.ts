import apiClient from "./apiClient";

// Notification interfaces
export interface Notification {
  _id: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export interface GetAllNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    unread: number;
    notifications: Notification[];
  };
}

export interface GetUnreadNotificationsResponse {
  success: boolean;
  message: string;
  unread: number;
  data: Notification[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  // GET /api/v1/dashboard/admin/notifications - Get all notifications
  getAllNotifications: async (): Promise<GetAllNotificationsResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/admin/notifications");
    return response.data;
  },

  // GET /api/v1/dashboard/admin/notifications/unread - Get unread notifications
  getUnreadNotifications: async (): Promise<GetUnreadNotificationsResponse> => {
    const response = await apiClient.get("/api/v1/dashboard/admin/notifications/unread");
    return response.data;
  },

  // PATCH /api/v1/dashboard/admin/notifications/{id}/read - Mark notification as read
  markAsRead: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.patch(`/api/v1/dashboard/admin/notifications/${id}/read`);
    return response.data;
  },

  // PATCH /api/v1/dashboard/admin/notifications/read-all - Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse> => {
    const response = await apiClient.patch("/api/v1/dashboard/admin/notifications/read-all");
    return response.data;
  },

  // DELETE /api/v1/dashboard/admin/notifications/{id} - Delete notification
  deleteNotification: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/api/v1/dashboard/admin/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
