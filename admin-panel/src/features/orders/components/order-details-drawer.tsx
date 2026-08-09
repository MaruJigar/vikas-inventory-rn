import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderQuery } from '@/hooks/orders/useOrderQuery';
import { OrderItemDto } from '@/types/api/order.types';
import { formatDate } from '@/lib/utils';
import { OrderStatusBadge } from './order-status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getImageUrl } from '@/lib/utils/image';
import Image from 'next/image';
import { useUpdateOrderStatusMutation } from '@/hooks/orders/useUpdateOrderStatusMutation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package } from 'lucide-react';

const STATUS_PROGRESSION: Record<string, string> = {
  'PENDING': 'ORDERED',
  'ORDERED': 'SHIPPED',
  'SHIPPED': 'DELIVERED',
};

interface OrderDetailsDrawerProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsDrawer({ orderId, isOpen, onClose }: OrderDetailsDrawerProps) {
  const { data: response, isLoading, isError } = useOrderQuery(orderId);
  const order = response && 'data' in response ? response.data : response;
  
  const updateStatusMutation = useUpdateOrderStatusMutation(orderId);
  
  const currentStatusName = typeof order?.status === 'object' ? (order.status as any)?.name : order?.status;
  const nextStatus = currentStatusName ? STATUS_PROGRESSION[currentStatusName] : null;

  const { user } = useAuthStore();
  const isCreator = user?.id === order?.salesman_id || user?.id === order?.distributor_id;
  const isPurchaseOrder = !!order?.manufacturer_id;

  const gross = Number(order?.gross_order_amount || 0);
  const dDisc = Number(order?.distributor_discount_amount || 0);
  const dMargin = Number(order?.distributor_margin_amount || 0);
  const fDisc = Number(order?.freight_discount_amount || 0);
  const sDisc = Number(order?.special_discount_amount || 0);
  const cDisc = Number(order?.cash_discount_amount || 0);
  const stdDisc = Number(order?.standard_discount_amount || 0);

  const balAfterDDisc = gross - dDisc;
  const balAfterDMargin = balAfterDDisc - dMargin;
  const balAfterFDisc = balAfterDMargin - fDisc;
  const balAfterSDisc = balAfterFDisc - sDisc;
  const balAfterStdDisc = gross - stdDisc;

  const handleAdvanceStatus = () => {
    if (nextStatus && orderId) {
      updateStatusMutation.mutate({ status: nextStatus });
    }
  };

  return (
    <EntityFormDrawer 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      title="Order Details"
      width="lg"
    >
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
        <div className="space-y-6 pb-10">
          
          {/* Section 1: Order Summary */}
          <section className="border rounded-md bg-white p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-sm font-semibold text-slate-900">Order Summary</h3>
              {nextStatus && !isCreator && (
                <Button 
                  size="sm" 
                  onClick={handleAdvanceStatus} 
                  disabled={updateStatusMutation.isPending}
                  className="h-8"
                >
                  Move to {nextStatus} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
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
              <div>
                <div className="text-slate-500">Transport Mode</div>
                <div className="font-medium capitalize">{order.transport_mode?.replace(/_/g, ' ') || 'N/A'}</div>
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
          {!isPurchaseOrder && (
            <section className="border rounded-md bg-white p-4 shadow-sm">
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
                  <div className="text-slate-500">Address</div>
                  <div className="font-medium">
                    {[
                      order.shop?.address, 
                      order.shop?.city_name, 
                      order.shop?.state_name
                    ].filter(Boolean).join(', ') || 'N/A'}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Sales Team */}
          <section className="border rounded-md bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 border-b pb-2">Sales Team</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              {!isPurchaseOrder && (
                <div>
                  <div className="text-slate-500">Salesman Name</div>
                  <div className="font-medium">{order.salesman?.full_name || 'N/A'}</div>
                </div>
              )}
              <div>
                <div className="text-slate-500">Distributor Name</div>
                <div className="font-medium">{order.distributor?.business_name || 'N/A'}</div>
              </div>
            </div>
          </section>

          {/* Section 2: Order Items */}
          <section className="border rounded-md bg-white p-4 shadow-sm">
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
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">MRP</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item: OrderItemDto) => {
                        let imageUrl = item.product?.product_image_url;
                        if (Array.isArray(imageUrl)) {
                          imageUrl = imageUrl[0];
                        } else if (typeof imageUrl === 'string') {
                          imageUrl = imageUrl.split(',')[0].trim();
                        }
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-slate-100 flex items-center justify-center">
                                {imageUrl ? (
                                  <Image
                                    src={getImageUrl(imageUrl)}
                                    alt={item.product_name_snapshot}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{item.product_name_snapshot}</TableCell>
                          <TableCell className="text-slate-500">{item.sku_snapshot}</TableCell>
                          <TableCell className="text-right">{Number(item.quantity || 0)}</TableCell>
                          <TableCell className="text-right">₹{Number(item.mrp || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{Number((item.gross_line_amount || 0) - (item.net_line_amount || 0) + (item.gst_amount || 0)).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">₹{Number(item.net_line_amount || 0).toFixed(2)}</TableCell>
                      </TableRow>
                        );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          {/* Section 3: Financial Summary */}
          <section className="border rounded-md bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-2">Financial Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Gross Amount</span>
                <span>₹{Number(order.gross_order_amount || 0).toFixed(2)}</span>
              </div>
              {!order.manufacturer_id ? (
                <>
                  {stdDisc > 0 && (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Standard Discount ({Number(order.standard_discount_percent || 0)}%)</span>
                        <span className="text-red-500">- ₹{stdDisc.toFixed(2)}</span>
                      </div>
                      {sDisc > 0 && (
                        <div className="flex justify-between items-center text-slate-600 font-medium border-t border-slate-200 mt-1 pt-1">
                          <span>Total after Standard Discount</span>
                          <span>₹{balAfterStdDisc.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  {sDisc > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Special Discount ({Number(order.special_discount_percent || 0)}%)</span>
                      <span className="text-red-500">- ₹{sDisc.toFixed(2)}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {dDisc > 0 && (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Distributor Discount ({Number(order.distributor_discount_percent || 0)}%)</span>
                        <span className="text-red-500">- ₹{dDisc.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium border-t border-slate-200 mt-1 pt-1">
                        <span>Total after Distributor Discount</span>
                        <span>₹{balAfterDDisc.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {dMargin > 0 && (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Distributor Margin ({Number(order.distributor_margin_percent || 0)}%)</span>
                        <span className="text-red-500">- ₹{dMargin.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium border-t border-slate-200 mt-1 pt-1">
                        <span>Total after Distributor Margin</span>
                        <span>₹{balAfterDMargin.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {fDisc > 0 && (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Freight Discount ({Number(order.freight_discount_percent || 0)}%)</span>
                        <span className="text-red-500">- ₹{fDisc.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium border-t border-slate-200 mt-1 pt-1">
                        <span>Total after Freight Discount</span>
                        <span>₹{balAfterFDisc.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {sDisc > 0 && (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Special Discount ({Number(order.special_discount_percent || 0)}%)</span>
                        <span className="text-red-500">- ₹{sDisc.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 font-medium border-t border-slate-200 mt-1 pt-1">
                        <span>Total after Special Discount</span>
                        <span>₹{balAfterSDisc.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {cDisc > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Cash Discount ({Number(order.cash_discount_percent || 0)}%)</span>
                      <span className="text-red-500">- ₹{cDisc.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              {Number(order.total_gst_amount || 0) > 0 && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>Total GST</span>
                  <span className="text-emerald-600">+ ₹{Number(order.total_gst_amount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-slate-900 pt-2 border-t border-slate-200 mt-2">
                <span>Final Amount</span>
                <span className="text-base">₹{Number(order.final_order_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </section>

        </div>
      )}
    </EntityFormDrawer>
  );
}
