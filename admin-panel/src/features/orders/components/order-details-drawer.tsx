import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderQuery } from '@/hooks/orders/useOrderQuery';
import { OrderItemDto } from '@/types/api/order.types';
import { formatDate } from '@/lib/utils';
import { OrderStatusBadge } from './order-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OrderDetailsDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsDrawer({ orderId, isOpen, onClose }: OrderDetailsDrawerProps) {
  const { data: response, isLoading, isError } = useOrderQuery(orderId);
  const order = response?.data;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[600px] md:w-[800px] sm:max-w-none overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Order Details</SheetTitle>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {isError && (
          <div className="text-red-500 bg-red-50 p-4 rounded-md">
            Failed to load order details. Please try again.
          </div>
        )}

        {order && (
          <div className="space-y-8 pb-10">
            
            {/* Section 1: Order Summary */}
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Order Summary</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <div className="text-slate-500">Order Number</div>
                  <div className="font-medium">{order.order_number || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="mt-1"><OrderStatusBadge status={typeof order.status === 'object' ? (order.status as any)?.name : order.status} /></div>
                </div>
                <div>
                  <div className="text-slate-500">Created Date</div>
                  <div className="font-medium">{formatDate(order.created_at)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Total Quantity</div>
                  <div className="font-medium">{Number(order.total_quantity) || 0}</div>
                </div>
                {order.cancellation_reason && (
                  <div className="col-span-2">
                    <div className="text-slate-500">Cancellation Reason</div>
                    <div className="font-medium text-red-600 bg-red-50 p-2 rounded mt-1 border border-red-100">
                      {order.cancellation_reason}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 2: Shop Information */}
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Shop Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <div className="text-slate-500">Shop Name</div>
                  <div className="font-medium">{order.shop?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Owner Name</div>
                  <div className="font-medium">{order.shop?.owner_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Phone</div>
                  <div className="font-medium">{order.shop?.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Location</div>
                  <div className="font-medium">
                    {[order.shop?.city, order.shop?.state].filter(Boolean).join(', ') || 'N/A'}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Salesman Information */}
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Sales Team</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <div className="text-slate-500">Salesman Name</div>
                  <div className="font-medium">{order.salesman?.full_name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Distributor Name</div>
                  <div className="font-medium">{order.distributor?.business_name || 'N/A'}</div>
                </div>
              </div>
            </section>

            {/* Section 4: Order Items */}
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Order Items</h3>
              {!order.items || order.items.length === 0 ? (
                <div className="text-slate-500 text-sm italic py-4 text-center border rounded-md bg-slate-50">
                  No order items found
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">MRP</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item: OrderItemDto) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product_name_snapshot}</TableCell>
                          <TableCell className="text-slate-500">{item.sku_snapshot}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{Number(item.mrp_snapshot).toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{Number(item.discount_amount).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">₹{Number(item.line_total).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* Section 5: Financial Summary */}
            <section className="border rounded-md bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Financial Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Gross Amount</span>
                  <span>₹{Number(order.gross_order_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Product Discount</span>
                  <span>- ₹{Number(order.total_product_discount_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Bill Discount</span>
                  <span>- ₹{Number(order.bill_discount_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                  <span>Final Amount</span>
                  <span className="text-base">₹{Number(order.final_order_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </section>

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
