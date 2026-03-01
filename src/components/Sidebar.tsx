import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  LayoutDashboard, 
  ListTodo, 
  TrendingUp, 
  User, 
  Menu, 
  X, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Habits', href: '/my-habits', icon: ListTodo },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Header - Fixed at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">Just Do It</h1>
            <p className="text-xs text-gray-500">Habit Builder</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out flex flex-col
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        {/* Logo Section - Fixed height */}
        <div className={`
          flex items-center gap-3 p-6 border-b border-gray-100 h-20 flex-shrink-0
          ${isCollapsed ? 'lg:justify-center' : ''}
        `}>
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">Just Do It</h1>
            <p className="text-xs text-gray-500">Habit Builder</p>
          </div>
          
          {/* Collapse button (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          
          {/* Close button (mobile only) */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${active
                    ? 'bg-green-50 text-green-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'lg:justify-center' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-sm ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                {active && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section - Fixed at bottom, no more floating! */}
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className={`
            flex items-center gap-3 rounded-xl bg-gray-50 p-3
            ${isCollapsed ? 'lg:justify-center' : ''}
          `}>
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {profile?.avatar_initials || user?.email?.[0].toUpperCase() || 'U'}
            </div>
            
            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            
            <button
              onClick={signOut}
              className={`
                p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0
                ${isCollapsed ? 'lg:hidden' : ''}
              `}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content spacer for desktop (pushes content to the right) */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}