'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useUploadCatalogueMutation } from '@/hooks/catalogues/useUploadCatalogueMutation';

interface UploadCatalogueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturerId?: string;
  companyName?: string;
  isReplace?: boolean;
  existingFilename?: string;
}

const MAX_SIZE_MB = 25;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function UploadCatalogueDialog({
  isOpen,
  onClose,
  manufacturerId,
  companyName,
  isReplace = false,
  existingFilename,
}: UploadCatalogueDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadCatalogueMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setValidationError('Only PDF documents (.pdf) are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File size exceeds the ${MAX_SIZE_MB}MB limit.`);
      setSelectedFile(null);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setValidationError('Only PDF documents (.pdf) are allowed.');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File size exceeds the ${MAX_SIZE_MB}MB limit.`);
      setSelectedFile(null);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        manufacturerId,
        isReplace,
      });
      handleClose();
    } catch {
      // Error is handled by mutation onError toast
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isReplace ? 'Replace Catalogue' : 'Upload Catalogue'}
          </DialogTitle>
          <DialogDescription>
            {companyName
              ? `${isReplace ? 'Replace' : 'Upload'} the product catalogue PDF for ${companyName}.`
              : `${isReplace ? 'Replace' : 'Upload'} your product catalogue PDF.`}
          </DialogDescription>
        </DialogHeader>

        {isReplace && existingFilename && (
          <div className="bg-slate-50 border rounded-md p-3 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium text-slate-700">Current file:</span>
            <span className="truncate max-w-[220px] text-slate-500">{existingFilename}</span>
          </div>
        )}

        <div className="space-y-4 py-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf,.pdf"
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF documents only (Max {MAX_SIZE_MB}MB)
              </p>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-md bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploadMutation.isPending}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {validationError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending
              ? 'Uploading...'
              : isReplace
              ? 'Replace Catalogue'
              : 'Upload Catalogue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
