import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TopNavbar() {
  const { user, profile, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Display full_name from profile, fallback to email
  const displayName = profile?.full_name || user?.email || 'User';
  
  // Use avatar_initials from profile, or generate from name, or fallback to first letter of email
  const avatarInitials = profile?.avatar_initials || 
    (profile?.full_name 
      ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : user?.email?.[0].toUpperCase() || 'U');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Just Do It</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Avatar Circle */}
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {avatarInitials}
              </div>

              {/* User Name */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {displayName}
                </p>
                {profile?.full_name && (
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                )}
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>

                  <hr className="my-1 border-gray-200" />

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}