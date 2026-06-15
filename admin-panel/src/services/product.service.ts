import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { ProductDto, CreateProductDto, UpdateProductDto, CategoryDto, CreateCategoryDto, PricingHistoryDto } from '@/types/api/product.types';

export const productService = {
  createProduct: (data: CreateProductDto) => api.post<ApiResponse<ProductDto>>('/products', data).then(res => res.data),
  getProducts: (params?: QueryParams) => api.get<PaginatedResponse<ProductDto>>('/products', { params }).then(res => res.data),
  getProduct: (id: string) => api.get<ApiResponse<ProductDto>>(`/products/${id}`).then(res => res.data),
  updateProduct: (id: string, data: UpdateProductDto) => api.put<ApiResponse<ProductDto>>(`/products/${id}`, data).then(res => res.data),
  
  getCategories: () => api.get<ApiResponse<CategoryDto[]>>('/product-categories').then(res => res.data),
  createCategory: (data: CreateCategoryDto) => api.post<ApiResponse<CategoryDto>>('/product-categories', data).then(res => res.data),
  
  getPricingHistory: (id: string) => api.get<ApiResponse<PricingHistoryDto[]>>(`/product-pricing/products/${id}/history`).then(res => res.data),
};
