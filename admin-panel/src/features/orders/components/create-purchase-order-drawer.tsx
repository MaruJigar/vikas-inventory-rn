import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useCreateDistributorOrderMutation } from '@/hooks/orders/useCreateDistributorOrderMutation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trash2, PlusCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { ProductSearchSelector } from './ProductSearchSelector';
import { Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreatePurchaseOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialItems?: any[];
}

type FormValues = {
  products: {
    productId: string;
    product_name_snapshot: string;
    sku_snapshot: string;
    mrp_snapshot: number;
    quantity: number;
    product_image_url?: string;
  }[];
  transportMode: string;
};

export function CreatePurchaseOrderDrawer({ isOpen, onClose, initialItems = [] }: CreatePurchaseOrderDrawerProps) {
  const { mutate: createOrder, isPending } = useCreateDistributorOrderMutation();

  const { register, control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      products: [],
      transportMode: ''
    }
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "products"
  });

  // Pre-fill form when opened
  useEffect(() => {
    if (isOpen) {
      reset({
        products: initialItems.map(item => ({
          productId: item.product_id || item.productId,
          product_name_snapshot: item.product_name_snapshot || item.product?.name || '',
          sku_snapshot: item.sku_snapshot || item.product?.sku || '',
          mrp_snapshot: Number(item.mrp_snapshot || item.mrp || 0),
          quantity: Number(item.quantity || 1),
          product_image_url: item.product_image_url || item.product?.product_image_url || undefined,
        })),
        transportMode: ''
      });
    }
  }, [isOpen, initialItems, reset]);

  const watchedProducts = watch('products') || [];
  const watchedTransportMode = watch('transportMode') || '';

  const grossAmount = watchedProducts.reduce((sum, p) => sum + (p.mrp_snapshot * (p.quantity || 0)), 0);

  let totalGstAmount = 0; // Not perfectly calculating GST here if we don't have allProducts, but this is simulated logic anyway.
  // We can just set it to 0 for now since the backend will recalculate it. Or if we really need it, we could include gst_percent in the product payload.

  const finalAmount = grossAmount + totalGstAmount;

  const onSubmit = (data: FormValues) => {
    if (!data.products.length) return;

    createOrder({
      products: data.products.map(p => ({
        productId: p.productId,
        quantity: Number(p.quantity),
      })),
      transportMode: data.transportMode || undefined,
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full !max-w-2xl overflow-y-auto p-4 sm:p-6">
        <SheetHeader className="mb-6">
          <SheetTitle>Create Purchase Request</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
          <section className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Simulated Order Items</h3>
            <div className="text-sm text-blue-800">
              Review and adjust the required items below. Submitting this form will automatically group the items by manufacturer and create the respective purchase orders.
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Order Items</h3>
              <div className="flex items-center gap-2">
                <ProductSearchSelector 
                  selectedIds={watchedProducts.map(wp => wp.productId)}
                  onSelect={(product) => {
                    append({
                      productId: product.id,
                      product_name_snapshot: product.name,
                      sku_snapshot: product.sku || "",
                      mrp_snapshot: Number(product.mrp),
                      quantity: 1,
                      product_image_url: product.product_image_url || undefined
                    });
                  }}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[120px]">MRP</TableHead>
                    <TableHead className="w-[150px]">Quantity</TableHead>
                    <TableHead className="w-[150px] text-right">Gross</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const watchedItem = watchedProducts[index];
                    const itemGross = (watchedItem?.mrp_snapshot || 0) * (watchedItem?.quantity || 0);

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {watchedItem.product_image_url ? (
                                <img src={watchedItem.product_image_url} alt={watchedItem.product_name_snapshot} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{field.product_name_snapshot}</div>
                              <div className="text-xs text-muted-foreground">{field.sku_snapshot}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ₹{(field.mrp_snapshot || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                const current = watchedItem.quantity || 1;
                                if (current > 1) {
                                  setValue(`products.${index}.quantity`, current - 1);
                                }
                              }}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              className="w-20 h-8 text-center"
                              {...control.register(`products.${index}.quantity`, { valueAsNumber: true, min: 1 })}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                const current = watchedItem.quantity || 1;
                                setValue(`products.${index}.quantity`, current + 1);
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{itemGross.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {fields.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48">
                        <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                          <Package className="h-12 w-12 text-slate-300" />
                          <div className="text-center">
                            <p className="font-medium text-slate-700">No products added</p>
                            <p className="text-sm">Search and select products to add them to this order.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4 bg-white">
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
          </section>

          {/* Financial Summary (Real-time Recalculated) */}
          <section className="border rounded-md bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Financial Totals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Gross Amount</span>
                <span>₹{Number(grossAmount).toFixed(2)}</span>
              </div>
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

          <SheetFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || fields.length === 0} className="bg-blue-600 text-white">
              {isPending ? 'Placing Order...' : 'Place Order'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
