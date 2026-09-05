import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { ProductDto, CreateProductDto, UpdateProductDto, CategoryDto, CreateCategoryDto, PricingHistoryDto } from '@/types/api/product.types';

export const productService = {
  createProduct: (data: CreateProductDto) => api.post<ProductDto>('/products', data).then(res => res.data),
  getProducts: (params?: QueryParams) => api.get<PaginatedResponse<ProductDto>>('/products', { params }).then(res => res.data),
  getProduct: (id: string) => api.get<ProductDto>(`/products/${id}`).then(res => res.data),
  updateProduct: (id: string, data: UpdateProductDto) => api.put<ProductDto>(`/products/${id}`, data).then(res => res.data),
  
  getCategories: () => api.get<CategoryDto[]>('/product-categories').then(res => res.data),
  createCategory: (data: CreateCategoryDto) => api.post<CategoryDto>('/product-categories', data).then(res => res.data),
  
  getPricingHistory: (id: string) => api.get<PricingHistoryDto[]>(`/product-pricing/products/${id}/history`).then(res => res.data),

  uploadProductImage: (formData: FormData) => 
    api.post<{ url: string }>('/uploads/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

  deleteProduct: (id: string) => api.delete<{ message: string }>(`/products/${id}`).then(res => res.data),
};
