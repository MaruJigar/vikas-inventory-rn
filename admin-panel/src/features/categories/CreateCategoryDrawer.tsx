'use client';

import React, { useEffect } from 'react';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateCategoryMutation, useGetCategories } from '@/hooks/categories/useCategories';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  parent_id: z.string().uuid().optional().or(z.literal('')),
});

type FormData = z.infer<typeof categorySchema>;

interface Props {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function CreateCategoryDrawer({ open, isOpen, onOpenChange, onClose }: Props) {
  const isDrawerOpen = open ?? isOpen ?? false;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!newOpen && onClose) onClose();
  };

  const mutation = useCreateCategoryMutation();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } = useGetCategories({ limit: 1000 });
  const categories = categoriesResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useRHForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parent_id: '',
    },
  });

  const parentId = watch('parent_id');

  useEffect(() => {
    if (!isDrawerOpen) {
      reset();
    }
  }, [isDrawerOpen, reset]);

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        name: data.name.trim(),
        parent_id: data.parent_id === '' ? undefined : data.parent_id,
      },
      {
        onSuccess: () => {
          reset();
          handleOpenChange(false);
        },
      }
    );
  };

  const isPending = isSubmitting || mutation.isPending;

  return (
    <EntityFormDrawer
      open={isDrawerOpen}
      onOpenChange={handleOpenChange}
      title="Create Category"
      description="Add a new product category to organize your inventory."
      width="md"
      footer={
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            form="create-category-form"
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      }
    >
      <form id="create-category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">
            Category Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Edible Oils, Snacks, Personal Care"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_id">Parent Category</Label>
          <Select
            value={parentId || 'none'}
            onValueChange={(v: string | null) => setValue('parent_id', v === 'none' || v === null ? '' : v)}
          >
            <SelectTrigger id="parent_id" className="w-full">
              <SelectValue placeholder="— None (Top Level) —">
                {isCategoriesLoading
                  ? 'Loading categories...'
                  : parentId && parentId !== 'none'
                  ? categories.find((c) => c.id === parentId)?.name || parentId
                  : '— None (Top Level) —'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Top Level)</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parent_id && (
            <p className="text-xs text-destructive">{errors.parent_id.message}</p>
          )}
        </div>
      </form>
    </EntityFormDrawer>
  );
}
