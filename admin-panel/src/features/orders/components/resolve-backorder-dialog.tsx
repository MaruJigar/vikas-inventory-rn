import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BackorderDto } from '@/types/api/order.types';
import { useResolveBackorderMutation } from '@/hooks/orders/useResolveBackorderMutation';

interface ResolveBackorderDialogProps {
  backorder: BackorderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResolveBackorderDialog({ backorder, isOpen, onClose }: ResolveBackorderDialogProps) {
  const [allocatedQty, setAllocatedQty] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const { mutate: resolve, isPending } = useResolveBackorderMutation();

  const remaining = backorder ? Number(backorder.quantity) - Number(backorder.resolved_quantity) : 0;

  const handleClose = () => {
    setAllocatedQty('');
    setNotes('');
    onClose();
  };

  const handleResolve = () => {
    if (!backorder) return;
    const qty = Number(allocatedQty);
    if (isNaN(qty) || qty <= 0 || qty > remaining) return;

    resolve(
      { id: backorder.id, data: { resolved_quantity: qty, notes: notes || undefined } },
      { onSuccess: handleClose }
    );
  };

  const isValid = () => {
    const qty = Number(allocatedQty);
    return !isNaN(qty) && qty > 0 && qty <= remaining;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Backorder</DialogTitle>
          <DialogDescription>
            Allocate inventory to partially or fully resolve this backlog.
          </DialogDescription>
        </DialogHeader>

        {backorder && (
          <div className="grid gap-4 py-4">
            <div className="bg-slate-50 border rounded-md p-3 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Product</span>
                <span className="font-medium text-slate-900">{backorder.product?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distributor</span>
                <span className="font-medium text-slate-900">{backorder.distributor?.business_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium text-slate-700">Remaining Need</span>
                <span className="font-bold text-red-600">{remaining}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allocateQty" className="text-right">
                Allocate Quantity
              </Label>
              <Input
                id="allocateQty"
                type="number"
                min="1"
                max={remaining}
                value={allocatedQty}
                onChange={(e) => setAllocatedQty(e.target.value)}
                placeholder={`Max: ${remaining}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="E.g., Sent from alternative warehouse..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={!isValid() || isPending}>
            {isPending ? 'Resolving...' : 'Confirm Allocation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
