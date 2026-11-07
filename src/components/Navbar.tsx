import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useAlert } from './AlertBanner.tsx';
import { Layout, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logoutUser } = useAuth();
  const { showSuccess } = useAlert();

  const handleLogout = () => {
    logoutUser();
    showSuccess('You have been logged out.');
    navigate('/');
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">
              BuildIt
            </span>
            <span className="block text-[11px] font-medium text-blue-600 uppercase tracking-wider">
              No-Code Builder
            </span>
          </div>
        </button>

        {/* Navigation items */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {user ? (
            // Logged-in state: sees their name and "Log out"
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  currentPath === '/dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => navigate('/templates')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  currentPath === '/templates'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Templates
              </button>

              <button
                type="button"
                onClick={() => navigate('/teams')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  currentPath === '/teams'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Teams
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  currentPath === '/profile'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Profile
              </button>

              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium max-w-[150px] sm:max-w-[200px] truncate transition-colors text-left"
                title="View your profile"
              >
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                ) : (
                  <UserIcon className="w-4 h-4 text-gray-500 shrink-0" />
                )}
                <span className="truncate" title={user.name}>{user.name}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            // Visitor state: sees "Templates", "Log in", and "Register"
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('/templates')}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  currentPath === '/templates'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Templates
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className={`text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
                  currentPath === '/login'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                Register
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
