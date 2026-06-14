import { useAuthStore } from '@/store/useAuthStore';
import { UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Placeholder for Breadcrumbs or Mobile Menu Toggle */}
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <UserCircle className="w-6 h-6 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {user?.name || 'Administrator'}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
