import { useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProductsQuery } from '@/hooks/products/useProductsQuery';
import { useCreateDistributorOrderMutation } from '@/hooks/orders/useCreateDistributorOrderMutation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trash2, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';

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
  }[];
  transportMode: string;
};

export function CreatePurchaseOrderDrawer({ isOpen, onClose, initialItems = [] }: CreatePurchaseOrderDrawerProps) {
  const { mutate: createOrder, isPending } = useCreateDistributorOrderMutation();
  const { data: prodResponse } = useProductsQuery({ limit: 500 });
  const allProducts = prodResponse?.data || [];

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
          productId: item.product_id,
          product_name_snapshot: item.product_name_snapshot,
          sku_snapshot: item.sku_snapshot,
          mrp_snapshot: Number(item.mrp || 0),
          quantity: Number(item.quantity),
        })),
        transportMode: ''
      });
    }
  }, [isOpen, initialItems, reset]);

  const watchedProducts = watch('products') || [];
  const watchedTransportMode = watch('transportMode') || '';

  const grossAmount = watchedProducts.reduce((sum, p) => sum + (p.mrp_snapshot * (p.quantity || 0)), 0);

  let totalGstAmount = 0;
  watchedProducts.forEach(p => {
    const product = allProducts.find(ap => ap.id === p.productId);
    const gstPercent = product ? Number(product.gst_percent) : 0;
    const itemGross = p.mrp_snapshot * (p.quantity || 0);

    totalGstAmount += itemGross * (gstPercent / 100);
  });

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
      <SheetContent className="w-[400px] sm:w-[600px] md:w-[900px] sm:max-w-none overflow-y-auto">
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
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Order Items</h3>
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
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.sku ? `(${p.sku})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                          <div className="font-medium">{field.product_name_snapshot}</div>
                          <div className="text-xs text-muted-foreground">{field.sku_snapshot}</div>
                        </TableCell>
                        <TableCell>
                          ₹{(field.mrp_snapshot || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            className="w-24 h-8"
                            {...control.register(`products.${index}.quantity`, { valueAsNumber: true })}
                          />
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
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No products added.
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
