import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { PERMISSIONS, Role } from '@/config/permissions';
import { ROUTES } from '@/config/routes';
import {
  LayoutDashboard,
  CheckSquare,
  Factory,
  Truck,
  Users,
  Package,
  Store,
  ShoppingCart,
  Boxes,
  RotateCcw,
  PackageCheck,
  Bell,
  Settings,
  ShieldAlert,
  BarChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasRole } from '@/lib/auth/guards';

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: readonly Role[];
};

const navItems: NavItem[] = [
  { title: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, roles: PERMISSIONS.DASHBOARD_VIEW },
  { title: 'Approvals', href: ROUTES.APPROVALS, icon: CheckSquare, roles: PERMISSIONS.APPROVALS_VIEW },
  { title: 'Manufacturers', href: ROUTES.MANUFACTURERS, icon: Factory, roles: PERMISSIONS.MANUFACTURERS_VIEW },
  { title: 'Distributors', href: ROUTES.DISTRIBUTORS, icon: Truck, roles: PERMISSIONS.DISTRIBUTORS_VIEW },
  { title: 'Salesmen', href: ROUTES.SALESMEN, icon: Users, roles: PERMISSIONS.SALESMEN_VIEW },
  { title: 'Products', href: ROUTES.PRODUCTS, icon: Package, roles: PERMISSIONS.PRODUCTS_VIEW },
  { title: 'Shops', href: ROUTES.SHOPS, icon: Store, roles: PERMISSIONS.SHOPS_VIEW },
  { title: 'Orders', href: ROUTES.ORDERS, icon: ShoppingCart, roles: PERMISSIONS.ORDERS_VIEW },
  { title: 'Inventory', href: ROUTES.INVENTORY, icon: Boxes, roles: PERMISSIONS.INVENTORY_VIEW },
  { title: 'Backorders', href: ROUTES.BACKORDERS, icon: RotateCcw, roles: PERMISSIONS.BACKORDERS_VIEW },
  { title: 'Fulfillment', href: ROUTES.FULFILLMENT, icon: PackageCheck, roles: PERMISSIONS.FULFILLMENT_VIEW },
  { title: 'Analytics', href: ROUTES.ANALYTICS, icon: BarChart, roles: PERMISSIONS.ANALYTICS_VIEW },
  { title: 'Notifications', href: ROUTES.NOTIFICATIONS, icon: Bell, roles: PERMISSIONS.NOTIFICATIONS_VIEW },
  { title: 'Audit Logs', href: ROUTES.AUDIT_LOGS, icon: ShieldAlert, roles: PERMISSIONS.AUDIT_LOGS_VIEW },
  { title: 'Settings', href: ROUTES.SETTINGS, icon: Settings, roles: PERMISSIONS.SETTINGS_VIEW },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Do not default to SUPER_ADMIN to avoid leakage. If no user/role, show no items.
  const role = user?.role;

  const filteredItems = role ? navItems.filter(item => hasRole(role, item.roles)) : [];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 font-bold text-xl border-b border-slate-800">
        Vikas Admin
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
