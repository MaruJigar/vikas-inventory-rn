import { api } from '@/lib/api/axios';
import { ApiResponse, PaginatedResponse, QueryParams } from '@/types/api/common.types';
import { ProductDto, CreateProductDto, UpdateProductDto } from '@/types/api/product.types';

export const productService = {
  createProduct: (data: CreateProductDto) => api.post<ApiResponse<ProductDto>>('/products', data).then(res => res.data),
  getProducts: (params?: QueryParams) => api.get<PaginatedResponse<ProductDto>>('/products', { params }).then(res => res.data),
  updateProduct: (id: string, data: UpdateProductDto) => api.put<ApiResponse<ProductDto>>(`/products/${id}`, data).then(res => res.data),
};
