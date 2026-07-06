export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productsKeys.lists(), { filters }] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  categories: () => [...productsKeys.all, 'categories'] as const,
  pricingHistory: (id: string) => [...productsKeys.detail(id), 'pricingHistory'] as const,
};
