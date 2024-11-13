import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            <Link
              to="/"
              className={`flex flex-col items-center py-3 px-6 ${
                location.pathname === '/' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-sm">Home</span>
            </Link>
            
            <Link
              to="/history"
              className={`flex flex-col items-center py-3 px-6 ${
                location.pathname === '/history' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <ClockIcon className="h-6 w-6" />
              <span className="text-sm">History</span>
            </Link>

            <Link
              to="/about"
              className={`flex flex-col items-center py-3 px-6 ${
                location.pathname === '/about' ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="text-sm">About</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}