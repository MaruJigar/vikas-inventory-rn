import { useEffect } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrderQuery } from '@/hooks/orders/useOrderQuery';
import { useUpdateOrderMutation } from '@/hooks/orders/useUpdateOrderMutation';
import { useManufacturersQuery } from '@/hooks/manufacturers/useManufacturersQuery';
import { useProductsQuery } from '@/hooks/products/useProductsQuery';
import { useDistributorProfileQuery } from '@/hooks/distributors/useDistributorProfileQuery';
import { UpdateOrderDto } from '@/types/api/order.types';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trash2, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';

interface EditOrderDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  products: {
    productId: string;
    product_name_snapshot: string;
    sku_snapshot: string;
    mrp_snapshot: number;
    quantity: number;
  }[];
  standardDiscountPercent: number;
  specialDiscountPercent: number;
  transportMode: string;
  reason: string;
  manufacturerId?: string;
};

export function EditOrderDrawer({ orderId, isOpen, onClose }: EditOrderDrawerProps) {
  const { data: response, isLoading } = useOrderQuery(isOpen ? orderId : null);
  const order = response && 'data' in response ? (response as any).data : response;

  const { mutate: updateOrder, isPending } = useUpdateOrderMutation(orderId);

  const user = useAuthStore((state) => state.user);
  const isManufacturerAdmin = user?.role === 'MANUFACTURER_ADMIN';
  const isDistributorAdmin = user?.role === 'DISTRIBUTOR_ADMIN';

  const { data: distProfileResp } = useDistributorProfileQuery(isDistributorAdmin);
  const distProfile = distProfileResp?.data || distProfileResp;
  const isInternalDistributor = isDistributorAdmin && distProfile?.is_internal_distributor;

  const { data: mfrResponse, isLoading: mfrLoading } = useManufacturersQuery({ limit: 100 });
  const { data: prodResponse, isLoading: prodLoading } = useProductsQuery({ limit: 100 });
  const manufacturers = mfrResponse?.data || [];
  const allProducts = prodResponse?.data || [];

  const { register, control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      products: [],
      standardDiscountPercent: 0,
      specialDiscountPercent: 0,
      transportMode: '',
      reason: '',
      manufacturerId: ''
    }
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "products"
  });

  // Pre-fill form
  useEffect(() => {
    if (order && isOpen) {
      reset({
        products: (order.items || []).map(item => ({
          productId: item.product_id,
          product_name_snapshot: item.product_name_snapshot,
          sku_snapshot: item.sku_snapshot,
          mrp_snapshot: Number(item.mrp || 0),
          quantity: Number(item.quantity),
        })),
        standardDiscountPercent: Number(order.standard_discount_percent || 0),
        specialDiscountPercent: Number(order.special_discount_percent || 0),
        transportMode: order.transport_mode || '',
        reason: '',
        manufacturerId: order.manufacturer_id || ''
      });
    }
  }, [order, isOpen, reset]);

  const watchedProducts = watch('products') || [];
  const watchedStdDisc = watch('standardDiscountPercent') || 0;
  const watchedSpecDisc = watch('specialDiscountPercent') || 0;
  const watchedTransportMode = watch('transportMode') || '';

  // Real-time calculations
  const grossAmount = watchedProducts.reduce((sum, p) => sum + (p.mrp_snapshot * (p.quantity || 0)), 0);
  const netAfterProductDiscount = grossAmount;

  const standardDiscountAmount = netAfterProductDiscount * (watchedStdDisc / 100);
  const afterStdDisc = netAfterProductDiscount - standardDiscountAmount;
  const specialDiscountAmount = afterStdDisc * (watchedSpecDisc / 100);

  const totalDiscount = standardDiscountAmount + specialDiscountAmount;

  let totalGstAmount = 0;
  watchedProducts.forEach(p => {
    const product = allProducts.find(ap => ap.id === p.productId);
    const gstPercent = product ? Number(product.gst_percent) : 0;
    const itemGross = p.mrp_snapshot * (p.quantity || 0);
    const itemNet = itemGross;

    const itemProportion = netAfterProductDiscount > 0 ? itemNet / netAfterProductDiscount : 0;
    const proratedDisc = itemProportion * totalDiscount;
    const taxableAmount = itemNet - proratedDisc;

    totalGstAmount += taxableAmount * (gstPercent / 100);
  });

  const finalAmount = netAfterProductDiscount - totalDiscount + totalGstAmount;

  const onSubmit = (data: FormValues) => {
    if (!orderId) return;

    const payload: UpdateOrderDto = {
      products: data.products.map(p => ({
        productId: p.productId,
        quantity: Number(p.quantity),
      })),
      standardDiscountPercent: Number(data.standardDiscountPercent),
      specialDiscountPercent: Number(data.specialDiscountPercent),
      transportMode: data.transportMode || undefined,
      reason: data.reason || 'Edited by Admin',
      manufacturerId: data.manufacturerId || undefined
    };

    updateOrder(payload, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[600px] md:w-[900px] sm:max-w-none overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Edit Order {order?.order_number ? `- ${order.order_number}` : ''}</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !order ? null : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">

            {/* Shop Context (Read Only) */}
            {order.shop ? (
              <section className="bg-slate-50 p-4 rounded-md border">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Shop Context</h3>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">{order.shop.name}</span>
                  {order.shop.city && ` • ${order.shop.city}`}
                </div>
              </section>
            ) : order.manufacturer_id && (
              <section className="bg-slate-50 p-4 rounded-md border">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Manufacturer Target</h3>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-900">
                    {manufacturers.find(m => m.id === order.manufacturer_id)?.company_name || `ID: ${order.manufacturer_id}`}
                  </span>
                </div>
              </section>
            )}

            {/* Order Items Editor */}
            <section>
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Order Items</h3>
                {(order.status?.name === 'DRAFT' || order.status?.name === 'CREATED') && (
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(productId) => {
                      const product = allProducts.find(p => p.id === productId);
                      if (product && !watchedProducts.some(wp => wp.productId === product.id)) {
                        append({
                          productId: product.id,
                          product_name_snapshot: product.name,
                          sku_snapshot: product.sku || "",
                          mrp_snapshot: Number(product.mrp),
                          quantity: 1
                        });
                      }
                    }}>
                      <SelectTrigger className="w-[200px] h-8 text-xs">
                        <SelectValue placeholder="Add new product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id} disabled={watchedProducts.some(wp => wp.productId === p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {fields.length === 0 ? (
                <div className="text-red-500 text-sm italic py-4">No items in order.</div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">MRP</TableHead>
                        <TableHead className="w-24 text-right">Qty</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                        <TableHead className="w-12 text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const qty = watchedProducts[index]?.quantity || 0;
                        const mrp = watchedProducts[index]?.mrp_snapshot || 0;
                        const lineTotal = mrp * qty;

                        return (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">{field.product_name_snapshot}</TableCell>
                            <TableCell className="text-slate-500">{field.sku_snapshot}</TableCell>
                            <TableCell className="text-right">₹{Number(field.mrp_snapshot).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="1"
                                step="1"
                                className="w-20 text-right ml-auto"
                                {...register(`products.${index}.quantity` as const, { required: true, min: 1 })}
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{Number(lineTotal).toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* Logistics & Extra Discounts */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-md p-4 bg-white">
              <div>
                <Label>Transport Mode</Label>
                <Select
                  value={['By Air', 'By Road', 'By Train'].includes(watchedTransportMode) ? watchedTransportMode : (watchedTransportMode ? 'Other' : '')}
                  onValueChange={(val) => {
                    if (val === 'Other') {
                      setValue('transportMode', ' '); // Use a space to distinguish from empty but not predefined
                    } else {
                      setValue('transportMode', val || '');
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-white mt-1">
                    <SelectValue placeholder="Select Transport Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="By Air">By Air</SelectItem>
                    <SelectItem value="By Road">By Road</SelectItem>
                    <SelectItem value="By Train">By Train</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {(!['By Air', 'By Road', 'By Train'].includes(watchedTransportMode) && watchedTransportMode !== '') && (
                  <Input
                    id="transportModeText"
                    placeholder="Enter custom transport mode"
                    {...register('transportMode')}
                    className="mt-2"
                    onChange={(e) => setValue('transportMode', e.target.value.trimStart())}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="stdDisc">Standard Discount (%)</Label>
                <Input id="stdDisc" type="number" min="0" max="100" step="0.01" {...register('standardDiscountPercent')} className="mt-1" />
              </div>
              {(isManufacturerAdmin || isInternalDistributor) && (
                <div>
                  <Label htmlFor="specDisc">Special Discount (%)</Label>
                  <Input id="specDisc" type="number" min="0" max="100" step="0.01" {...register('specialDiscountPercent')} className="mt-1" />
                </div>
              )}
            </section>

            {/* Financial Summary (Real-time Recalculated) */}
            <section className="border rounded-md bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Financial Totals</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Gross Amount</span>
                  <span>₹{Number(grossAmount).toFixed(2)}</span>
                </div>
                {standardDiscountAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Standard Discount</span>
                      <span className="text-red-500">- ₹{Number(standardDiscountAmount).toFixed(2)}</span>
                    </div>
                    {specialDiscountAmount > 0 && (
                      <div className="flex justify-between items-center text-slate-600 font-medium border-t border-slate-200 mt-1 pt-1">
                        <span>Amount after Standard Discount</span>
                        <span>₹{Number(afterStdDisc).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {specialDiscountAmount > 0 && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Special Discount</span>
                    <span className="text-red-500">- ₹{Number(specialDiscountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total GST Amount</span>
                  <span className="text-emerald-600">+ ₹{Number(totalGstAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                  <span>Final Amount</span>
                  <span className="text-base">₹{Number(finalAmount).toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Reason */}
            <section>
              <Label htmlFor="reason">Reason for Edit (Optional)</Label>
              <Input
                id="reason"
                placeholder="e.g. Customer requested quantity change"
                {...register('reason')}
                className="mt-1"
              />
            </section>

            <SheetFooter className="mt-6 flex gap-3 sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || watchedProducts.some(p => p.quantity <= 0) || watchedProducts.length === 0}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
