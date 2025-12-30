import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: PlusIcon,
      label: 'Quick Order',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => navigate('/')
    },
    {
      icon: ChartBarIcon,
      label: 'My Orders',
      color: 'bg-gray-700 hover:bg-gray-600',
      onClick: () => navigate('/history')
    },
    {
      icon: CalendarIcon,
      label: 'Schedule',
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => {
        // Could open a scheduling modal
        navigate('/');
      }
    }
  ];

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 ${action.color} rounded-2xl text-white shadow-lg transition-all backdrop-blur-sm text-sm font-medium`}
              >
                <action.icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all flex items-center justify-center relative"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <PlusIcon className="h-5 w-5 text-white" />
        </motion.div>
      </motion.button>
    </div>
  );
}