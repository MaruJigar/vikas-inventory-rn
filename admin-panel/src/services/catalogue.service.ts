import { api } from '@/lib/api/axios';
import { PaginatedResponse } from '@/types/api/common.types';
import {
  CatalogueDto,
  ManufacturerCatalogueItemDto,
} from '@/types/api/catalogue.types';

export const catalogueService = {
  /**
   * List all manufacturers with their catalogue status.
   */
  getCatalogues: (params?: Record<string, unknown>) =>
    api
      .get<PaginatedResponse<ManufacturerCatalogueItemDto>>('/catalogues', {
        params,
      })
      .then((res) => res.data),

  /**
   * Get catalogue metadata by manufacturer ID.
   */
  getCatalogueByManufacturerId: (manufacturerId: string) =>
    api
      .get<CatalogueDto>(`/catalogues/${manufacturerId}`)
      .then((res) => res.data),

  /**
   * Get own catalogue metadata (for authenticated manufacturer admin).
   */
  getOwnCatalogue: () =>
    api.get<CatalogueDto>('/manufacturer/catalogue').then((res) => res.data),

  /**
   * Upload catalogue (multipart form data).
   */
  uploadCatalogue: (file: File, manufacturerId?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    const url = manufacturerId
      ? `/catalogues/${manufacturerId}`
      : '/manufacturer/catalogue';

    return api.post<CatalogueDto>(url, formData).then((res) => res.data);
  },

  /**
   * Replace catalogue.
   */
  replaceCatalogue: (file: File, manufacturerId?: string) => {
    const formData = new FormData();
    formData.append('file', file);

    if (manufacturerId) {
      return api
        .post<CatalogueDto>(`/catalogues/${manufacturerId}`, formData)
        .then((res) => res.data);
    }

    return api
      .put<CatalogueDto>('/manufacturer/catalogue', formData)
      .then((res) => res.data);
  },

  /**
   * Delete catalogue.
   */
  deleteCatalogue: (manufacturerId?: string) => {
    const url = manufacturerId
      ? `/catalogues/${manufacturerId}`
      : '/manufacturer/catalogue';
    return api.delete<{ success: boolean; message: string }>(url).then((res) => res.data);
  },

  /**
   * Fetches the PDF blob with Authorization header for secure preview or download.
   */
  fetchPdfBlob: async (manufacturerId: string): Promise<Blob> => {
    const response = await api.get(`/catalogues/${manufacturerId}/file`, {
      responseType: 'blob',
    });
    return new Blob([response.data], { type: 'application/pdf' });
  },

  /**
   * Downloads the PDF file directly to client machine.
   */
  downloadPdf: async (manufacturerId: string, filename?: string): Promise<void> => {
    const blob = await catalogueService.fetchPdfBlob(manufacturerId);
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename || 'catalogue.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  },
};
