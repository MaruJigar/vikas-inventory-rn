import { InventoryList } from '@/features/inventory/components/InventoryList';
import { InventorySettings } from '@/features/inventory/components/InventorySettings';
import { Metadata } from 'next';
import { AppLayout } from '@/components/layout/AppLayout';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Inventory | Vikas Inventory',
  description: 'Manage your product inventory',
};

export default function InventoryPage() {
  return (
    <AppLayout>
      <RoleGuard allowedRoles={['SUPER_ADMIN', 'MANUFACTURER_ADMIN', 'DISTRIBUTOR_ADMIN']}>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage your product stock levels.
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="stock" className="space-y-6">
            <TabsList>
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stock" className="space-y-6">
              <InventoryList />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <InventorySettings />
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
