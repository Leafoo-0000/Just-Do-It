import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TopNavbarProps {
  pageTitle?: string;
}

export default function TopNavbar({ pageTitle }: TopNavbarProps) {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex-1">
        {pageTitle && <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
              {initial}
            </div>
            <span className="font-medium text-gray-700 capitalize">{displayName}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}