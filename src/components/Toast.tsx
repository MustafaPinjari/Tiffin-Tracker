import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ToastNotification } from '../types';

interface ToastProps {
  toast: ToastNotification | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const getStyleAndIcon = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-[#34D399]/40 bg-[#17243A]/95 text-[#34D399]',
          icon: <CheckCircleIcon className="w-5 h-5 text-[#34D399] flex-shrink-0" />
        };
      case 'warning':
        return {
          border: 'border-[#FBBF24]/40 bg-[#17243A]/95 text-[#FBBF24]',
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-[#FBBF24] flex-shrink-0" />
        };
      case 'error':
        return {
          border: 'border-[#FB7185]/40 bg-[#17243A]/95 text-[#FB7185]',
          icon: <XCircleIcon className="w-5 h-5 text-[#FB7185] flex-shrink-0" />
        };
      default:
        return {
          border: 'border-[#3B82F6]/40 bg-[#17243A]/95 text-[#38BDF8]',
          icon: <InformationCircleIcon className="w-5 h-5 text-[#38BDF8] flex-shrink-0" />
        };
    }
  };

  const { border, icon } = getStyleAndIcon();

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none"
      >
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl border ${border} shadow-2xl backdrop-blur-xl pointer-events-auto`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {icon}
            <p className="text-sm font-medium text-[#EAF2FF] truncate">
              {toast.message}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss();
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#2563EB] hover:bg-[#3B82F6] text-[#EAF2FF] transition-colors"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="p-1 text-[#A8B7CE] hover:text-[#EAF2FF] rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};