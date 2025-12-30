import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FloatingActionButton } from './FloatingActionButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="pb-20">{children}</div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* iOS-style Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-2xl border-t border-gray-800/50">
        <div className="safe-area-inset-bottom">
          <div className="flex justify-around py-2">
            {[
              { to: '/', icon: HomeIcon, label: 'Home' },
              { to: '/history', icon: ClockIcon, label: 'History' },
            ].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 py-2 px-6 transition-all duration-200 ${
                  location.pathname === to 
                    ? 'text-blue-500' 
                    : 'text-gray-500'
                }`}
              >
                <Icon className={`h-6 w-6 transition-all duration-200 ${
                  location.pathname === to ? 'scale-110' : 'scale-100'
                }`} />
                <span className={`text-xs font-medium ${
                  location.pathname === to ? 'text-blue-500' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
