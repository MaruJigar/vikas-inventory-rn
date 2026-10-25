'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { catalogueService } from '@/services/catalogue.service';

interface CataloguePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturerId?: string;
  companyName?: string;
  filename?: string;
}

export function CataloguePreviewDialog({
  isOpen,
  onClose,
  manufacturerId,
  companyName,
  filename,
}: CataloguePreviewDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !manufacturerId) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    catalogueService
      .fetchPdfBlob(manufacturerId)
      .then((blob) => {
        if (!isMounted) return;
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Failed to load PDF catalogue preview');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, manufacturerId]);

  const handleDownload = () => {
    if (!manufacturerId) return;
    catalogueService.downloadPdf(manufacturerId, filename);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <DialogTitle className="text-lg font-semibold">
              {companyName ? `${companyName} - Catalogue` : 'Catalogue Preview'}
            </DialogTitle>
            {filename && (
              <p className="text-xs text-muted-foreground mt-0.5">{filename}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mr-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isLoading || !!error}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full relative bg-slate-100 rounded-md overflow-hidden mt-4">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Loading catalogue PDF...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-slate-50">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm font-medium text-slate-800">{error}</p>
              <Button variant="outline" size="sm" onClick={() => onClose()}>
                Close
              </Button>
            </div>
          )}

          {!isLoading && !error && blobUrl && (
            <iframe
              src={blobUrl}
              className="w-full h-full border-none rounded-md"
              title="PDF Preview"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
