import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] bg-[#1F2937]/80 border border-gray-600 shadow-xl rounded-2xl backdrop-blur-md">
        <div className="flex justify-around py-3">
          {[
            { to: '/', icon: HomeIcon, label: 'Home' },
            { to: '/history', icon: ClockIcon, label: 'History' },
            { to: '/about', icon: UserCircleIcon, label: 'About' },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${
                location.pathname === to ? 'text-[#7C3AED]' : 'text-gray-400'
              } group`}
            >
              <Icon className="h-7 w-7 transition-all duration-200 group-hover:scale-110 group-active:animate-bounce" />
              <span className="text-xs">{label}</span>

              {/* Active Indicator */}
              {location.pathname === to && (
                <span className="absolute bottom-[-6px] w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse"></span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
