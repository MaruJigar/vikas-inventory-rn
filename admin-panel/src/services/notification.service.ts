import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse } from '@/types/api/common.types';
import { NotificationDto } from '@/types/api/notification.types';

export const notificationService = {
  getNotifications: () => api.get<PaginatedResponse<NotificationDto>>('/notifications').then(res => res.data),
  getUnreadCount: () => api.get<ApiResponse<{ count: number }>>('/notifications/unread-count').then(res => res.data),
  markAllAsRead: () => api.patch<ApiResponse<void>>('/notifications/read-all').then(res => res.data),
  markAsRead: (id: string) => api.patch<ApiResponse<void>>(`/notifications/${id}/read`).then(res => res.data),
  deleteNotification: (id: string) => api.delete<ApiResponse<void>>(`/notifications/${id}`).then(res => res.data),
};
