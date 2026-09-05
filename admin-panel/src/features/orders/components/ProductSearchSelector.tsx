import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Package, Check } from 'lucide-react';
import { useProductsQuery } from '@/hooks/products/useProductsQuery';
import { getImageUrl } from '@/lib/utils/image';
import toast from 'react-hot-toast';

interface ProductSearchSelectorProps {
  onSelect: (product: any) => void;
  selectedIds: string[];
}

export function ProductSearchSelector({ onSelect, selectedIds }: ProductSearchSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Debounce search string
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { data, isLoading } = useProductsQuery({ limit: 20, search: debouncedSearch.trim() || undefined, is_active: true });
  const products = data?.data || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: any) => {
    if (selectedIds.includes(product.id)) {
      toast.error('Product already added. Update its quantity instead.');
    } else {
      onSelect(product);
      setSearch('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full sm:w-[350px]" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder="Search product by name or SKU..."
          className="pl-9 bg-white shadow-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-[400px] mt-1 bg-white rounded-md border shadow-lg max-h-80 overflow-y-auto left-0 sm:left-auto sm:right-0">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No products found.</div>
          ) : (
            <div className="py-1">
              {products.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors border-b last:border-0 border-slate-100"
                  >
                    <div className="w-10 h-10 rounded border bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.product_image_url ? (
                        <img src={getImageUrl(product.product_image_url)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {product.sku ? `SKU: ${product.sku}` : 'No SKU'}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium">
                        <Check className="h-3 w-3 mr-1" /> Added
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
