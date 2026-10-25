import { apiClient } from '@/api/client';
import type { Paginated } from '@/api/types';
import type { CatalogueItem, CatalogueQueryParams } from '@/types/catalogue';

export const catalogueApi = {
  /**
   * Public Catalogue Discovery.
   * Anyone can call this anonymously without authentication.
   */
  getPublicCatalogues: (query?: CatalogueQueryParams): Promise<Paginated<CatalogueItem>> =>
    apiClient
      .get<Paginated<CatalogueItem>>('/catalogues/public', { params: query })
      .then((r) => r.data),

  /**
   * Relationship-Scoped Catalogue Discovery.
   * Requires an authenticated session (Distributor or Salesman).
   */
  getAccessibleCatalogues: (query?: CatalogueQueryParams): Promise<Paginated<CatalogueItem>> =>
    apiClient
      .get<Paginated<CatalogueItem>>('/catalogues/accessible-to-me', { params: query })
      .then((r) => r.data),

  /**
   * Retrieve metadata for a specific manufacturer catalogue.
   */
  getCatalogueByManufacturerId: (manufacturerId: string): Promise<any> =>
    apiClient
      .get(`/catalogues/${manufacturerId}`)
      .then((r) => r.data),
};
