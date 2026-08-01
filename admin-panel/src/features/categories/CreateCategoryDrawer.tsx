import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  name: z.string().min(1, 'Name is required'),
  parent_id: z.string().uuid().optional().or(z.literal('')),
});

type FormData = z.infer<typeof categorySchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCategoryDrawer({ open, onOpenChange }: Props) {
  const mutation = useCreateCategoryMutation();
  const { data: categories } = useGetCategories();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useRHForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parent_id: '',
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        ...data,
        parent_id: data.parent_id === '' ? undefined : data.parent_id,
      },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Create Category</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent Category</Label>
            <Select onValueChange={(v: string | null) => setValue('parent_id', v === 'none' || v === null ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories?.data?.map((c) => (
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


          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
