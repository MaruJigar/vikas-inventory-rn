import React, { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useUpdateCategoryMutation, useGetCategories } from '@/hooks/categories/useCategories';
import { CategoryDto } from '@/types/api/product.types';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().or(z.literal('')),
});

type FormData = z.infer<typeof categorySchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryDto | null;
}

export function EditCategoryDrawer({ open, onOpenChange, category }: Props) {
  const mutation = useUpdateCategoryMutation(category?.id ?? '');
  const { data: categories } = useGetCategories();
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useRHForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parent_id: '',
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description ?? '',
        parent_id: category.parent_id ?? '',
      });
    }
  }, [category, reset]);

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        ...data,
        parent_id: data.parent_id === '' ? undefined : data.parent_id,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const currentParentId = watch('parent_id');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name <span className="text-red-500">*</span></Label>
            <Input id="edit-name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-parent_id">Parent Category</Label>
            <Select 
              value={currentParentId || 'none'} 
              onValueChange={(v: string | null) => setValue('parent_id', v === 'none' || v === null ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories?.data?.filter(c => c.id !== category?.id).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parent_id && (
              <p className="text-sm text-red-500">{errors.parent_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
