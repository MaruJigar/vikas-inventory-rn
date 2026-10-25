/**
 * Mirrors the backend public catalogue DTO (Backend/src/catalogue/dto/public-catalogue-item.dto.ts).
 */
export interface CatalogueItem {
  manufacturerId: string;
  manufacturerName: string;
  fileName: string;
  fileSizeBytes: number;
  updatedAt: string;
  city?: string | null;
  state?: string | null;
  pdfUrl: string;
  downloadUrl: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCataloguesResponse {
  data: CatalogueItem[];
  meta: PaginatedMeta;
}

export interface CatalogueQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
