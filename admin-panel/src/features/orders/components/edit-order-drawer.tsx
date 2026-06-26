import { useEffect } from 'react';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrderQuery } from '@/hooks/orders/useOrderQuery';
import { useUpdateOrderMutation } from '@/hooks/orders/useUpdateOrderMutation';
import { UpdateOrderDto } from '@/types/api/order.types';
import { useForm, useFieldArray } from 'react-hook-form';

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
    itemDiscountType: 'NONE' | 'PERCENTAGE' | 'FLAT';
    itemDiscountValue: number;
  }[];
  billDiscountType: 'NONE' | 'PERCENTAGE' | 'FLAT';
  billDiscountValue: number;
  reason: string;
};

export function EditOrderDrawer({ orderId, isOpen, onClose }: EditOrderDrawerProps) {
  const { data: response, isLoading } = useOrderQuery(isOpen ? orderId : null);
  const order = response?.data;

  const { mutate: updateOrder, isPending } = useUpdateOrderMutation(orderId);

  const { register, control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      products: [],
      billDiscountType: 'NONE',
      billDiscountValue: 0,
      reason: ''
    }
  });

  const { fields } = useFieldArray({
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
          mrp_snapshot: Number(item.mrp_snapshot),
          quantity: Number(item.quantity),
          itemDiscountType: 'FLAT', // Backend OrderItemDto has discount_amount but not type explicitly in the read DTO, assuming FLAT for the UI or calculating it. Let's use FLAT with discount_amount.
          itemDiscountValue: Number(item.discount_amount),
        })),
        billDiscountType: 'FLAT',
        billDiscountValue: Number(order.bill_discount_amount || 0),
        reason: ''
      });
    }
  }, [order, isOpen, reset]);

  const watchedProducts = watch('products') || [];
  const watchedBillDiscountType = watch('billDiscountType');
  const watchedBillDiscountValue = watch('billDiscountValue') || 0;

  // Real-time calculations
  const grossAmount = watchedProducts.reduce((sum, p) => sum + (p.mrp_snapshot * (p.quantity || 0)), 0);
  const productDiscountAmount = watchedProducts.reduce((sum, p) => sum + Number(p.itemDiscountValue || 0), 0);
  const netAfterProductDiscount = grossAmount - productDiscountAmount;
  
  const billDiscountAmount = watchedBillDiscountType === 'PERCENTAGE' 
    ? (netAfterProductDiscount * (watchedBillDiscountValue / 100))
    : Number(watchedBillDiscountValue || 0);

  const finalAmount = netAfterProductDiscount - billDiscountAmount;

  const onSubmit = (data: FormValues) => {
    if (!orderId) return;

    const payload: UpdateOrderDto = {
      products: data.products.map(p => ({
        productId: p.productId,
        quantity: Number(p.quantity),
        itemDiscountType: p.itemDiscountType,
        itemDiscountValue: Number(p.itemDiscountValue)
      })),
      billDiscountType: data.billDiscountType,
      billDiscountValue: Number(data.billDiscountValue),
      reason: data.reason || 'Edited by Salesman'
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
            <section className="bg-slate-50 p-4 rounded-md border">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Shop Context</h3>
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">{order.shop?.name || 'N/A'}</span>
                {order.shop?.city && ` • ${order.shop.city}`}
              </div>
            </section>

            {/* Order Items Editor */}
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Order Items</h3>
              {fields.length === 0 ? (
                <div className="text-red-500 text-sm italic py-4">Error: No items found to edit.</div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">MRP</TableHead>
                        <TableHead className="w-24 text-right">Qty</TableHead>
                        <TableHead className="w-24 text-right">Discount (FLAT)</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const qty = watchedProducts[index]?.quantity || 0;
                        const mrp = watchedProducts[index]?.mrp_snapshot || 0;
                        const disc = watchedProducts[index]?.itemDiscountValue || 0;
                        const lineTotal = (mrp * qty) - disc;

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
                            <TableCell className="text-right">
                              <Input 
                                type="number" 
                                min="0"
                                step="0.01"
                                className="w-24 text-right ml-auto"
                                {...register(`products.${index}.itemDiscountValue` as const, { min: 0 })}
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{Number(lineTotal).toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
                <div className="flex justify-between items-center text-slate-600">
                  <span>Product Discount</span>
                  <span className="text-red-500">- ₹{Number(productDiscountAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Bill Discount</span>
                  <span className="text-red-500">- ₹{Number(billDiscountAmount).toFixed(2)}</span>
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
              <Button type="submit" disabled={isPending || watchedProducts.some(p => p.quantity <= 0 || p.itemDiscountValue < 0) || watchedProducts.length === 0}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
