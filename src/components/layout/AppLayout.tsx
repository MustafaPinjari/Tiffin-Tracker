import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WifiIcon,
  PlusCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ClockIcon as ClockIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid';
import { useApp } from '../../context/AppContext';
import { Toast } from '../Toast';
import { formatDisplayDate, getTodayDateString } from '../../utils/date';
import { formatCurrency } from '../../utils/calculations';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, activeIcon: HomeIconSolid },
  { to: '/history', label: 'History', icon: ClockIcon, activeIcon: ClockIconSolid },
  { to: '/insights', label: 'Analytics', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon, activeIcon: Cog6ToothIconSolid },
];

export const AppLayout: React.FC = () => {
  const { isOffline, toast, dismissToast, settings, wallet, getTodayStats } = useApp();
  const location = useLocation();
  const todayStr = getTodayDateString();
  const todayStats = getTodayStats();

  // Determine current page title
  const currentTitle = 
    location.pathname === '/' ? 'Dashboard' :
    location.pathname === '/history' ? 'Order History' :
    location.pathname === '/insights' ? 'Spending Analytics' :
    location.pathname === '/settings' ? 'System Settings' : 'Tiffin Tracker';

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#EAF2FF] flex selection:bg-[#2563EB] selection:text-white">
      {/* Toast Alert */}
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Offline Alert Bar */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#FBBF24]/10 border-b border-[#FBBF24]/30 text-[#FBBF24] text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 backdrop-blur-md">
          <WifiIcon className="w-4 h-4 animate-pulse" />
          <span>Offline Mode Active — Changes stored securely on device</span>
        </div>
      )}

      {/* DESKTOP SIDEBAR RAIL */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111B2E] border-r border-[#263751] fixed inset-y-0 left-0 z-30 select-none">
        {/* Brand Group */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-[#263751]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#2563EB]/25">
            <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-[#EAF2FF] tracking-tight leading-none flex items-center gap-1.5">
              <span>Tiffin Tracker</span>
              <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-1 py-0.2 rounded">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-[#71829C] mt-1 font-medium">
              Expense & Meal OS
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <nav aria-label="Main Navigation" className="flex-1 px-3 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#71829C]">
            Application
          </div>
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[44px]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]
                  ${isActive
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                    : 'text-[#A8B7CE] hover:text-[#EAF2FF] hover:bg-[#17243A]'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#71829C]'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Status / Wallet Dock */}
        <div className="p-4 m-3 rounded-2xl bg-[#17243A] border border-[#263751] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A8B7CE] font-medium">Active Rate</span>
            <span className="text-[#EAF2FF] font-bold">
              {formatCurrency(settings.defaultPrice, settings.currencySymbol)}
            </span>
          </div>
          {settings.walletEnabled && (
            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#263751]">
              <span className="text-[#A8B7CE] font-medium">Prepaid Wallet</span>
              <span className="text-[#34D399] font-bold">
                {formatCurrency(wallet.balance, settings.currencySymbol)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] text-[#71829C] pt-1">
            <span>Today's Log</span>
            <span className={todayStats.totalOrders > 0 ? 'text-[#34D399] font-semibold' : 'text-[#71829C]'}>
              {todayStats.totalOrders > 0 ? `${todayStats.totalTiffins} Tiffins Logged` : 'Pending'}
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER (Offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* COMPACT TOP BAR */}
        <header className="sticky top-0 z-20 h-16 bg-[#0B1220]/90 backdrop-blur-xl border-b border-[#263751] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs">
              TT
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#EAF2FF] tracking-tight leading-none">
                {currentTitle}
              </h1>
              <div className="text-xs text-[#71829C] mt-0.5 hidden sm:block">
                {formatDisplayDate(todayStr, { showYear: true, showDayName: true })}
              </div>
            </div>
          </div>

          {/* Contextual Action / Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111B2E] border border-[#263751] text-xs text-[#A8B7CE]">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span>Standard: {formatCurrency(settings.defaultPrice, settings.currencySymbol)}/tiffin</span>
            </div>

            <NavLink to="/">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] active:bg-[#1D4ED8] text-white text-xs font-semibold shadow-md shadow-[#2563EB]/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              >
                <PlusCircleIcon className="w-4 h-4" />
                <span className="hidden xs:inline">Record Meal</span>
              </button>
            </NavLink>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 pb-28 md:pb-12">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111B2E]/95 backdrop-blur-xl border-t border-[#263751] safe-area-inset-bottom"
      >
        <div className="grid grid-cols-4 px-2 py-1 max-w-md mx-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`
                  flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all min-h-[48px] select-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]
                  ${isActive
                    ? 'text-[#38BDF8] font-bold'
                    : 'text-[#71829C] hover:text-[#A8B7CE]'
                  }
                `}
              >
                <div className={`p-1 rounded-lg transition-transform ${isActive ? 'bg-[#2563EB]/15 scale-105' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
