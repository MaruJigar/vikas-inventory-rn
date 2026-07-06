'use client';

import { useState } from 'react';
import { EntityFormDrawer } from '@/components/shared/EntityFormDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadShopImageMutation } from '@/hooks/shops/useUploadShopImageMutation';
import { ShopDto } from '@/types/api/shop.types';

interface UploadShopImageDialogProps {
  shop: ShopDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function UploadShopImageDialog({ shop, isOpen, onClose }: UploadShopImageDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const uploadMutation = useUploadShopImageMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setErrorMsg('Invalid file type. Allowed: jpg, jpeg, png, webp');
        setFile(null);
        return;
      }
      
      if (selectedFile.size > MAX_FILE_SIZE) {
        setErrorMsg('File size must be less than 5MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await uploadMutation.mutateAsync({
        shopId: shop.id,
        formData,
      });

      setSuccessMsg('Image uploaded successfully.');
      setTimeout(() => {
        setFile(null);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const errorMsg = axiosErr?.response?.data?.message || (err as Error).message || 'Image upload failed';
      setErrorMsg(errorMsg);
    }
  };

  return (
    <EntityFormDrawer
      title="Upload Verification Image"
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setFile(null);
          setErrorMsg(null);
          setSuccessMsg(null);
          onClose();
        }
      }}
      width="sm"
    >
      <form onSubmit={onSubmit} className="space-y-6 mt-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
            {successMsg}
          </div>
        )}

        <div>
          <Label htmlFor="verification_image">Select Image (Max 5MB)</Label>
          <Input
            id="verification_image"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="mt-2"
          />
          {file && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              setFile(null);
              onClose();
            }} 
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!file || uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      </form>
    </EntityFormDrawer>
  );
}
