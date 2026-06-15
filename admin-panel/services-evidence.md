
--- analytics.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { DashboardResponse, OrdersResponse, InventoryResponse, VisitResponse, FulfillmentResponse, ApprovalsResponse } from '@/types/api/analytics.types';

export const analyticsService = {
  getDashboard: () => api.get<ApiResponse<DashboardResponse>>('/analytics/dashboard').then(res => res.data),
  getSales: () => api.get<ApiResponse<DashboardResponse>>('/analytics/sales').then(res => res.data), // Assumed mapping based on DashboardResponse
  getVisits: () => api.get<ApiResponse<VisitResponse>>('/analytics/visits').then(res => res.data),
  getOrders: () => api.get<ApiResponse<OrdersResponse>>('/analytics/orders').then(res => res.data),
  getInventory: () => api.get<ApiResponse<InventoryResponse>>('/analytics/inventory').then(res => res.data),
  getBackorders: () => api.get<ApiResponse<OrdersResponse>>('/analytics/backorders').then(res => res.data),
  getFulfillment: () => api.get<ApiResponse<FulfillmentResponse>>('/analytics/fulfillment').then(res => res.data),
  getApprovals: () => api.get<ApiResponse<ApprovalsResponse>>('/analytics/approvals').then(res => res.data),
};

--- approval.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse } from '@/types/api/common.types';
import { ApprovalDto, ReviewApprovalDto } from '@/types/api/approval.types';

export const approvalService = {
  getPendingRequests: () => api.get<PaginatedResponse<ApprovalDto>>('/approvals/pending').then(res => res.data),
  reviewRequest: (id: string, dto: ReviewApprovalDto) => api.post<ApiResponse<void>>(`/approvals/${id}/review`, dto).then(res => res.data),
};

--- audit-log.service.ts ---
import { api } from '@/lib/api/axios';
import { PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { AuditLogDto } from '@/types/api/audit-log.types';

export const auditLogService = {
  getAuditLogs: (params?: QueryParams) => api.get<PaginatedResponse<AuditLogDto>>('/audit-logs', { params }).then(res => res.data),
};

--- auth.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { AuthDto, UserDto } from '@/types/api/auth.types';

export interface LoginResponse {
  accessToken: string;
  user: UserDto;
}

export const authService = {
  login: (data: AuthDto) => api.post<ApiResponse<LoginResponse>>('/auth/login', data).then(res => res.data),
  refreshToken: () => api.post<ApiResponse<LoginResponse>>('/auth/refresh').then(res => res.data)
};

--- backorder.service.ts ---
import { api } from '@/lib/api/axios';
import { PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { BackorderDto } from '@/types/api/backorder.types';

export const backorderService = {
  getBackorders: (params?: QueryParams) => api.get<PaginatedResponse<BackorderDto>>('/backorders', { params }).then(res => res.data),
};

--- distributor.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { DistributorDto, RegisterDistributorDto, UpdateDistributorDto } from '@/types/api/distributor.types';

export const distributorService = {
  register: (data: RegisterDistributorDto) => api.post<ApiResponse<DistributorDto>>('/distributors/register', data).then(res => res.data),
  getDistributors: (params?: QueryParams) => api.get<PaginatedResponse<DistributorDto>>('/distributors', { params }).then(res => res.data),
  getDistributorById: (id: string) => api.get<ApiResponse<DistributorDto>>(`/distributors/${id}`).then(res => res.data),
  updateDistributor: (id: string, data: UpdateDistributorDto) => api.put<ApiResponse<DistributorDto>>(`/distributors/${id}`, data).then(res => res.data),
};

--- fulfillment.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { FulfillOrderDto, PartialDispatchDto, PartialDeliverDto } from '@/types/api/fulfillment.types';

export const fulfillmentService = {
  confirmOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/confirm`, dto).then(res => res.data),
  processingOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/processing`, dto).then(res => res.data),
  packedOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/packed`, dto).then(res => res.data),
  dispatchOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/dispatch`, dto).then(res => res.data),
  deliverOrder: (id: string, dto: FulfillOrderDto) => api.patch<ApiResponse<void>>(`/orders/${id}/deliver`, dto).then(res => res.data),
  partialDispatchOrder: (id: string, dto: PartialDispatchDto) => api.patch<ApiResponse<void>>(`/orders/${id}/partial-dispatch`, dto).then(res => res.data),
  partialDeliverOrder: (id: string, dto: PartialDeliverDto) => api.patch<ApiResponse<void>>(`/orders/${id}/partial-deliver`, dto).then(res => res.data),
};

--- inventory.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { InventoryDto, AdjustInventoryDto } from '@/types/api/inventory.types';

export const inventoryService = {
  adjustInventory: (data: AdjustInventoryDto) => api.post<ApiResponse<InventoryDto>>('/inventory/adjust', data).then(res => res.data),
  getInventory: (params?: QueryParams) => api.get<PaginatedResponse<InventoryDto>>('/inventory', { params }).then(res => res.data),
};

--- manufacturer.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api/common.types';
import { ManufacturerDto, CreateManufacturerDto, UpdateManufacturerDto } from '@/types/api/manufacturer.types';

export const manufacturerService = {
  createProfile: (data: CreateManufacturerDto) => api.post<ApiResponse<ManufacturerDto>>('/manufacturers/profile', data).then(res => res.data),
  getProfile: () => api.get<ApiResponse<ManufacturerDto>>('/manufacturers/profile').then(res => res.data),
  updateProfile: (data: UpdateManufacturerDto) => api.put<ApiResponse<ManufacturerDto>>('/manufacturers/profile', data).then(res => res.data),
};

--- notification.service.ts ---
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

--- order.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { OrderDto, CreateOrderDto, UpdateOrderDto, CancelOrderDto } from '@/types/api/order.types';

export const orderService = {
  createOrder: (data: CreateOrderDto) => api.post<ApiResponse<OrderDto>>('/orders', data).then(res => res.data),
  getOrders: (params?: QueryParams) => api.get<PaginatedResponse<OrderDto>>('/orders', { params }).then(res => res.data),
  getOrderById: (id: string) => api.get<ApiResponse<OrderDto>>(`/orders/${id}`).then(res => res.data),
  updateOrder: (id: string, data: UpdateOrderDto) => api.put<ApiResponse<OrderDto>>(`/orders/${id}`, data).then(res => res.data),
  cancelOrder: (id: string, data: CancelOrderDto) => api.put<ApiResponse<OrderDto>>(`/orders/${id}/cancel`, data).then(res => res.data),
};

--- product.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@/types/api/product.types';

export const productService = {
  createProduct: (data: CreateProductDto) => api.post<ApiResponse<ProductDto>>('/products', data).then(res => res.data),
  getProducts: (params?: QueryParams) => api.get<PaginatedResponse<ProductDto>>('/products', { params }).then(res => res.data),
  updateProduct: (id: string, data: UpdateProductDto) => api.put<ApiResponse<ProductDto>>(`/products/${id}`, data).then(res => res.data),
};

--- salesman.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { SalesmanDto, RegisterSalesmanDto, UpdateSalesmanDto } from '@/types/api/salesman.types';

export const salesmanService = {
  register: (data: RegisterSalesmanDto) => api.post<ApiResponse<SalesmanDto>>('/salesmen/register', data).then(res => res.data),
  getSalesmen: (params?: QueryParams) => api.get<PaginatedResponse<SalesmanDto>>('/salesmen', { params }).then(res => res.data),
  getSalesmanById: (id: string) => api.get<ApiResponse<SalesmanDto>>(`/salesmen/${id}`).then(res => res.data),
  updateSalesman: (id: string, data: UpdateSalesmanDto) => api.put<ApiResponse<SalesmanDto>>(`/salesmen/${id}`, data).then(res => res.data),
};

--- shop.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { ShopDto, CreateShopDto, UpdateShopDto, CheckDuplicateDto } from '@/types/api/shop.types';

export const shopService = {
  checkDuplicate: (data: CheckDuplicateDto) => api.post<ApiResponse<boolean>>('/shops/check-duplicate', data).then(res => res.data),
  createShop: (data: CreateShopDto) => api.post<ApiResponse<ShopDto>>('/shops', data).then(res => res.data),
  getShops: (params?: QueryParams) => api.get<PaginatedResponse<ShopDto>>('/shops', { params }).then(res => res.data),
  getShopById: (id: string) => api.get<ApiResponse<ShopDto>>(`/shops/${id}`).then(res => res.data),
  updateShop: (id: string, data: UpdateShopDto) => api.patch<ApiResponse<ShopDto>>(`/shops/${id}`, data).then(res => res.data),
};

--- visit.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { VisitDto, StartVisitDto, EndVisitDto, NoOrderVisitDto } from '@/types/api/visit.types';

export const visitService = {
  startVisit: (data: StartVisitDto) => api.post<ApiResponse<VisitDto>>('/visits/start', data).then(res => res.data),
  endVisit: (data: EndVisitDto) => api.post<ApiResponse<VisitDto>>('/visits/end', data).then(res => res.data),
  noOrderVisit: (data: NoOrderVisitDto) => api.post<ApiResponse<VisitDto>>('/visits/no-order', data).then(res => res.data),
  getVisits: (params?: QueryParams) => api.get<PaginatedResponse<VisitDto>>('/visits', { params }).then(res => res.data),
  getVisitById: (id: string) => api.get<ApiResponse<VisitDto>>(`/visits/${id}`).then(res => res.data),
};

--- working-day.service.ts ---
import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { WorkingDayDto, CheckInDto, CheckOutDto } from '@/types/api/working-day.types';

export const workingDayService = {
  checkIn: (data: CheckInDto) => api.post<ApiResponse<WorkingDayDto>>('/working-day/check-in', data).then(res => res.data),
  checkOut: (data: CheckOutDto) => api.post<ApiResponse<WorkingDayDto>>('/working-day/check-out', data).then(res => res.data),
  getHistory: (params?: QueryParams) => api.get<PaginatedResponse<WorkingDayDto>>('/working-day/history', { params }).then(res => res.data),
};
