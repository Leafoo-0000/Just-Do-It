import { Bell, ChevronDown } from 'lucide-react';
import type { TopNavbarProps } from '@/types';

export default function TopNavbar({ pageTitle }: TopNavbarProps) {
  return (
    <header className="bg-white border-b border-gray-300 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <h2 className="text-2xl font-semibold text-gray-900">{pageTitle}</h2>

      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="w-10 h-10 flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
        </button>

        {/* User Avatar Dropdown */}
        <button className="flex items-center gap-3 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">B</span>
          </div>
          <span className="text-gray-900 font-medium">Basil</span>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </header>
  );
}