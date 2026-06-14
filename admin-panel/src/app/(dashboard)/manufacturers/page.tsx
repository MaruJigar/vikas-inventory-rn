'use client';

import { AppLayout } from "@/components/layout/AppLayout";
import { useManufacturerProfile } from "@/hooks/useManufacturerProfile";
import { useCreateManufacturerProfile, useUpdateManufacturerProfile } from "@/hooks/useUpdateManufacturerProfile";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createManufacturerSchema, updateManufacturerSchema, UpdateManufacturerValues } from "@/lib/validation/manufacturer.schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Building, CheckCircle2 } from "lucide-react";

export default function ManufacturerProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'MANUFACTURER_ADMIN') {
      router.replace('/'); 
    }
  }, [isAuthenticated, user, router]);

  const { data: profileResponse, isLoading, isError, error } = useManufacturerProfile();
  const createMutation = useCreateManufacturerProfile();
  const updateMutation = useUpdateManufacturerProfile();

  const isNotFound = isError && (error as { response?: { status?: number } })?.response?.status === 404;
  const isCreationMode = isNotFound || (!isLoading && !profileResponse);
  const profile = profileResponse?.data;

  const form = useForm<UpdateManufacturerValues>({
    resolver: zodResolver(isCreationMode ? createManufacturerSchema : updateManufacturerSchema),
    defaultValues: {
      company_name: "",
      contact_person: "",
      phone: "",
      email: "",
      gst_number: "",
      address: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        company_name: profile.company_name || "",
        contact_person: profile.contact_person || "",
        phone: profile.phone || "",
        email: profile.email || "",
        gst_number: profile.gst_number || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (values: UpdateManufacturerValues) => {
    if (isCreationMode) {
      createMutation.mutate(values as { company_name: string; contact_person?: string; phone?: string; email?: string; gst_number?: string });
    } else {
      updateMutation.mutate(values);
    }
  };

  if (user?.role !== 'MANUFACTURER_ADMIN') {
    return null;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manufacturer Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your core business entity details.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-500" />
                {isCreationMode ? "Create Profile" : "Update Profile"}
              </CardTitle>
              <CardDescription>
                {isCreationMode 
                  ? "You must complete your profile before accessing ecosystem features." 
                  : "Keep your details updated for your distributors and salesmen."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isError && !isNotFound && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">Failed to load profile. Please try again.</p>
                </div>
              )}

              {isSuccess && (
                <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-700">Profile saved successfully!</p>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input id="company_name" {...form.register("company_name")} />
                    {form.formState.errors.company_name && (
                      <p className="text-sm text-red-500">{form.formState.errors.company_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input id="gst_number" {...form.register("gst_number")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_person">Contact Person</Label>
                    <Input id="contact_person" {...form.register("contact_person")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...form.register("phone")} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register("email")} />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  {!isCreationMode && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...form.register("address")} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" {...form.register("city")} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" {...form.register("state")} />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                    {isPending ? "Saving..." : (isCreationMode ? "Create Profile" : "Save Changes")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
