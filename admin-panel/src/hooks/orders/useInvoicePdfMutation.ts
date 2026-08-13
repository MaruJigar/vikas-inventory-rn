import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { orderService } from '@/services/order.service';

type InvoiceAction = 'download' | 'print';

/**
 * useInvoicePdfMutation
 *
 * Triggers backend Proforma Invoice PDF generation for a given order.
 * On success, opens the returned downloadUrl for either download or print.
 *
 * The backend owns all financial data — no invoice values are calculated
 * on the frontend.
 *
 * @param action 'download' | 'print'
 */
export function useInvoicePdfMutation(action: InvoiceAction) {
  return useMutation({
    mutationFn: (orderId: string) => orderService.getInvoicePdf(orderId),

    onSuccess: (response) => {
      const downloadUrl = response?.data?.downloadUrl;
      const fileName = response?.data?.fileName ?? 'Proforma-Invoice.pdf';

      if (!downloadUrl) {
        toast.error('Invoice generated but no download URL was returned. Please try again.');
        return;
      }

      if (action === 'download') {
        // Trigger browser download via a temporary anchor element
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = fileName;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        toast.success('Invoice downloading…');
      } else {
        // Open in a new tab — user can use the browser's print dialog
        const printWindow = window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        if (!printWindow) {
          // Fallback if popup was blocked
          const anchor = document.createElement('a');
          anchor.href = downloadUrl;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          toast.success('Invoice opened for printing (if blocked, allow popups).');
        } else {
          toast.success('Invoice opened — use Ctrl+P / Cmd+P to print.');
        }
      }
    },

    onError: (error: unknown) => {
      console.error('Invoice generation failed:', error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to generate invoice. Please try again.';
      toast.error(message);
    },
  });
}
