"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { handleSuccessToast, handleUnexpectedToast } from "@/lib/utils/toast-helpers";
import { api } from "@/lib/api/axios";

const settingsSchema = z.object({
  low_stock_threshold: z.union([
    z.number(),
    z.null(),
    z.string().transform(val => (val === '' ? null : Number(val)))
  ]).optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

export function InventorySettings() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      low_stock_threshold: null,
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('/inventory/settings');
        reset({
          low_stock_threshold: response.data?.low_stock_threshold ?? null,
        });
      } catch (error) {
        console.error("Failed to load settings", error);
        handleUnexpectedToast(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === 'MANUFACTURER_ADMIN' || user?.role === 'DISTRIBUTOR_ADMIN') {
      fetchSettings();
    } else {
      setIsLoading(false);
    }
  }, [user, reset]);

  const onSubmit = async (data: SettingsValues) => {
    setIsSaving(true);
    try {
      await api.patch('/inventory/settings', {
        low_stock_threshold: data.low_stock_threshold,
      });
      handleSuccessToast("Inventory settings updated successfully.");
    } catch (error) {
      console.error("Failed to update settings", error);
      handleUnexpectedToast(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Settings</CardTitle>
          <CardDescription>Super Admins cannot configure low stock thresholds globally. This is an organization-level setting.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Settings</CardTitle>
        <CardDescription>
          Configure how your organization's inventory is managed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
            <Input 
              id="low_stock_threshold"
              type="number" 
              placeholder="e.g. 10" 
              min={0}
              {...register('low_stock_threshold')} 
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Enter the minimum quantity at which inventory should be considered low stock. Leave empty to disable low stock warnings.
            </p>
            {errors.low_stock_threshold && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.low_stock_threshold.message as string}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
