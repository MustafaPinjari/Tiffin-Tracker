import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, subDays } from 'date-fns';
import { 
  PlusIcon, 
  MinusIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useOrders } from '../hooks/useOrders';
import { notificationService, TiffinStatus } from '../services/notificationService';
import { EnhancedCalendar } from './EnhancedCalendar';
import { NotificationSettings } from './NotificationSettings';

interface UnifiedOrderManagerProps {
  onOrderPlaced: (message: string) => void;
}

export function UnifiedOrderManager({ onOrderPlaced }: UnifiedOrderManagerProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tiffins, setTiffins] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [todayStatus, setTodayStatus] = useState<TiffinStatus>(notificationService.getTodayStatus());
  
  const { addOrder, getAllOrders } = useOrders();
  const pricePerTiffin = 40;
  const allOrders = getAllOrders();
  
  const isSelectedToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  const selectedDateObj = new Date(selectedDate);
  const existingOrder = allOrders.find(order => order.date === selectedDate);

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();
    loadTodayStatus();
  }, []);

  useEffect(() => {
    // Update tiffins when date changes
    if (existingOrder) {
      setTiffins(existingOrder.numberOfTiffins);
    } else {
      setTiffins(1);
    }
  }, [selectedDate, existingOrder]);

  const loadTodayStatus = () => {
    setTodayStatus(notificationService.getTodayStatus());
  };

  const handleOrderSubmit = () => {
    addOrder({
      date: selectedDate,
      numberOfTiffins: tiffins,
      pricePerTiffin,
      totalAmount: tiffins * pricePerTiffin
    });
    
    // Update notification status
    notificationService.updateTiffinStatus(selectedDate, 'ordered', tiffins, tiffins * pricePerTiffin);
    
    const message = isSelectedToday 
      ? `Order confirmed! ${tiffins} tiffin${tiffins > 1 ? 's' : ''} for today`
      : `Order added for ${format(selectedDateObj, 'MMM d, yyyy')} - ${tiffins} tiffin${tiffins > 1 ? 's' : ''}`;
    
    onOrderPlaced(message);
    loadTodayStatus();
  };

  const handleStatusUpdate = (status: 'ordered' | 'skipped') => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (status === 'ordered') {
      // If marking as ordered, use current tiffin count
      addOrder({
        date: today,
        numberOfTiffins: tiffins,
        pricePerTiffin,
        totalAmount: tiffins * pricePerTiffin
      });
      notificationService.updateTiffinStatus(today, 'ordered', tiffins, tiffins * pricePerTiffin);
      onOrderPlaced(`Order confirmed! ${tiffins} tiffin${tiffins > 1 ? 's' : ''} for today`);
    } else {
      notificationService.updateTiffinStatus(today, 'skipped');
      onOrderPlaced('Marked as skipped for today');
    }
    loadTodayStatus();
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleCalendarOrderUpdate = (date: string, numberOfTiffins: number) => {
    addOrder({
      date,
      numberOfTiffins,
      pricePerTiffin,
      totalAmount: numberOfTiffins * pricePerTiffin
    });
    
    notificationService.updateTiffinStatus(date, 'ordered', numberOfTiffins, numberOfTiffins * pricePerTiffin);
    onOrderPlaced(`Order updated for ${format(new Date(date), 'MMM d, yyyy')}`);
    loadTodayStatus();
  };

  const getStatusIcon = (status: TiffinStatus['status']) => {
    switch (status) {
      case 'ordered':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'skipped':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: TiffinStatus['status']) => {
    switch (status) {
      case 'ordered':
        return 'bg-green-500/20 border-green-500/30';
      case 'skipped':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-yellow-500/20 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Notification Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
          </h1>
          <p className="text-gray-400 text-base">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNotificationSettings(true)}
          className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700"
        >
          <BellIcon className="h-5 w-5 text-gray-400" />
        </motion.button>
      </motion.div>

      {/* Today's Quick Status (only show if today) */}
      {isSelectedToday && todayStatus.status === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Status Update</h3>
            <span className="text-gray-400 text-sm">Today</span>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusUpdate('ordered')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Order {tiffins} Tiffin{tiffins > 1 ? 's' : ''}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusUpdate('skipped')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XCircleIcon className="h-5 w-5" />
              Skip Today
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Order Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
      >
        {/* Date Selection Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDateNavigation('prev')}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
            </motion.button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-white">
                {isSelectedToday ? "Today's Order" : format(selectedDateObj, 'MMM d, yyyy')}
              </h2>
              <p className="text-gray-400 text-sm">
                {format(selectedDateObj, 'EEEE')}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDateNavigation('next')}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300 text-sm font-medium">Calendar</span>
          </motion.button>
        </div>

        {/* Existing Order Status */}
        {existingOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl border ${getStatusColor('ordered')}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon('ordered')}
                <span className="text-white font-medium">
                  Existing Order: {existingOrder.numberOfTiffins} tiffin{existingOrder.numberOfTiffins > 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-white font-bold">₹{existingOrder.totalAmount}</span>
            </div>
          </motion.div>
        )}

        {/* Quantity Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-gray-800 rounded-2xl p-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTiffins(Math.max(1, tiffins - 1))}
              className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
              disabled={tiffins <= 1}
            >
              <MinusIcon className="h-6 w-6 text-white" />
            </motion.button>

            <div className="text-center">
              <motion.div
                key={tiffins}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold text-white mb-2"
              >
                {tiffins}
              </motion.div>
              <p className="text-gray-400 text-lg">Tiffin{tiffins > 1 ? 's' : ''}</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTiffins(tiffins + 1)}
              className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-2xl">
            <span className="text-gray-300">Price per tiffin</span>
            <span className="text-white font-medium text-lg">₹{pricePerTiffin}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
            <span className="text-white font-semibold text-lg">Total Amount</span>
            <motion.span 
              key={tiffins * pricePerTiffin}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-blue-400"
            >
              ₹{tiffins * pricePerTiffin}
            </motion.span>
          </div>
        </div>

        {/* Order Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOrderSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition-colors"
        >
          {existingOrder ? 'Update Order' : (isSelectedToday ? 'Confirm Order' : 'Add Order')}
        </motion.button>
      </motion.div>

      {/* Enhanced Calendar */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onOrderUpdate={handleCalendarOrderUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Settings Modal */}
      <NotificationSettings 
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </div>
  );
}