import { ColumnDef } from '@tanstack/react-table';
import { ManufacturerCatalogueItemDto } from '@/types/api/catalogue.types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  FileText,
} from 'lucide-react';

interface CataloguesColumnsProps {
  onDownload: (item: ManufacturerCatalogueItemDto) => void;
  onUpload: (item: ManufacturerCatalogueItemDto) => void;
  onReplace: (item: ManufacturerCatalogueItemDto) => void;
  onDelete: (item: ManufacturerCatalogueItemDto) => void;
  canManage: boolean;
}

export const getCataloguesColumns = ({
  onDownload,
  onUpload,
  onReplace,
  onDelete,
  canManage,
}: CataloguesColumnsProps): ColumnDef<ManufacturerCatalogueItemDto>[] => [
  {
    accessorKey: 'company_name',
    header: 'Manufacturer',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-slate-900">
          {row.original.company_name}
        </div>
        {(row.original.city || row.original.state) && (
          <div className="text-xs text-slate-500">
            {[row.original.city, row.original.state].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'contact_person',
    header: 'Contact',
    cell: ({ row }) => (
      <div>
        <div className="text-slate-800">
          {row.original.contact_person || '-'}
        </div>
        {row.original.email && (
          <div className="text-xs text-slate-500">{row.original.email}</div>
        )}
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Catalogue Status',
    cell: ({ row }) => {
      const hasCat = row.original.has_catalogue;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            hasCat
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {hasCat ? 'Uploaded' : 'Not Uploaded'}
        </span>
      );
    },
  },
  {
    id: 'file_details',
    header: 'PDF Document',
    cell: ({ row }) => {
      const cat = row.original.catalogue;
      if (!cat) return <span className="text-slate-400">-</span>;

      const sizeMB = (cat.file_size_bytes / (1024 * 1024)).toFixed(2);
      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="truncate">
            <div className="text-sm font-medium text-slate-800 truncate" title={cat.original_filename}>
              {cat.original_filename}
            </div>
            <div className="text-xs text-slate-500">{sizeMB} MB</div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'last_updated',
    header: 'Last Updated',
    cell: ({ row }) => {
      const cat = row.original.catalogue;
      if (!cat) return <span className="text-slate-400">-</span>;
      return (
        <span className="text-slate-600 text-sm whitespace-nowrap">
          {formatDate(cat.updated_at)}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      const hasCat = item.has_catalogue;

      return (
        <div className="flex justify-end gap-1.5 items-center">
          {hasCat ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(item)}
                title="Download Catalogue"
                className="h-8 px-2 text-slate-600 hover:text-slate-900"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>

              {canManage && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReplace(item)}
                    title="Replace Catalogue"
                    className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Replace
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    title="Delete Catalogue"
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </>
          ) : (
            canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpload(item)}
                className="h-8 gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Upload PDF
              </Button>
            )
          )}
        </div>
      );
    },
  },
];
