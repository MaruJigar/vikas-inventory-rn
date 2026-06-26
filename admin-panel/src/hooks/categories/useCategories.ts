import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/axios';
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/api/product.types';
import toast from 'react-hot-toast';

import { PaginatedResponse, QueryParams } from '@/types/api/common.types';

export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  list: (filters: QueryParams) => [...CATEGORY_KEYS.all, filters] as const,
};

export const useGetCategories = (filters: QueryParams = {}) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(filters),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<CategoryDto>>('/product-categories', {
        params: filters,
      });
      return response.data;
    },
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryDto) => {
      const response = await api.post<CategoryDto>('/product-categories', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category created successfully.');
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    },
  });
};

export const useUpdateCategoryMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCategoryDto) => {
      const response = await api.patch<CategoryDto>(`/product-categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category updated successfully.');
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/product-categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Category deleted successfully.');
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (error.response?.status === 409) {
        toast.error('Cannot delete category because products are assigned to it.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    },
  });
};
