// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1">
        {/* Mobile padding for header */}
        <div className="pt-16 lg:pt-0">
          <div className="p-4 lg:p-8 min-h-screen">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}