"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const settingsSchema = z.object({
  low_stock_threshold: z.union([
    z.number(),
    z.null(),
    z.string().transform(val => (val === '' ? null : Number(val)))
  ]).optional(),
});

type SettingsValues = {
  low_stock_threshold: number | null;
};

export function InventorySettings() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      low_stock_threshold: null,
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('/inventory/settings');
        form.reset({
          low_stock_threshold: response.data?.low_stock_threshold ?? null,
        });
      } catch (error) {
        console.error("Failed to load settings", error);
        toast({
          title: "Error",
          description: "Failed to load inventory settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === 'MANUFACTURER_ADMIN' || user?.role === 'DISTRIBUTOR_ADMIN') {
      fetchSettings();
    } else {
      setIsLoading(false);
    }
  }, [user, form, toast]);

  const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
    setIsSaving(true);
    try {
      await api.patch('/inventory/settings', {
        low_stock_threshold: data.low_stock_threshold,
      });
      toast({
        title: "Success",
        description: "Inventory settings updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update settings", error);
      toast({
        title: "Error",
        description: "Failed to update inventory settings.",
        variant: "destructive",
      });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="low_stock_threshold"
              render={({ field }) => (
                <FormItem className="max-w-md">
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 10" 
                      min={0}
                      {...field} 
                      value={field.value ?? ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the minimum quantity at which inventory should be considered low stock. Leave empty to disable low stock warnings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
