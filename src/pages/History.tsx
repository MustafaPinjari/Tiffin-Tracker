import { useState } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useOrders } from '../hooks/useOrders';
import { motion } from 'framer-motion';
import { CalendarIcon, FunnelIcon } from '@heroicons/react/24/outline';

export function History() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'all'>('month');
  const { getOrdersByMonth, getMonthlyStats, getAllOrders } = useOrders();

  const getFilteredOrders = () => {
    switch (viewMode) {
      case 'month':
        return getOrdersByMonth(format(selectedDate, 'yyyy-MM'));
      case 'week':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return getAllOrders().filter(order => 
          isWithinInterval(new Date(order.date), { start: weekStart, end: weekEnd })
        );
      case 'all':
        return getAllOrders();
      default:
        return getOrdersByMonth(format(selectedDate, 'yyyy-MM'));
    }
  };

  const orders = getFilteredOrders();
  const stats = getMonthlyStats(format(selectedDate, 'yyyy-MM'));

  return (
    <div className="min-h-screen bg-black">
      {/* Status Bar */}
      <div className="h-11 bg-black flex items-center justify-center">
        <div className="text-white text-sm font-medium">
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
        </div>
      </div>

      <div className="px-4 pb-28">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-4 pb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            Order History
          </h1>
          <p className="text-gray-400">
            Your tiffin orders
          </p>
        </motion.div>

        {/* Filter Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-900 rounded-3xl p-5 mb-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-blue-400" />
              <span className="text-white font-medium">Filter</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <input
                type="month"
                value={format(selectedDate, 'yyyy-MM')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="bg-transparent text-white text-sm border-none focus:outline-none"
              />
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex bg-gray-800 rounded-2xl p-1">
            {(['month', 'week', 'all'] as const).map((mode) => (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode(mode)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-white mb-1">{stats.totalOrders}</div>
            <div className="text-gray-400 text-xs">Orders</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-white mb-1">{stats.totalTiffins}</div>
            <div className="text-gray-400 text-xs">Tiffins</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-blue-400 mb-1">₹{stats.totalAmount}</div>
            <div className="text-gray-400 text-xs">Total</div>
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-3"
        >
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-gray-900 rounded-3xl border border-gray-800"
            >
              <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Orders Found</h3>
              <p className="text-gray-500 text-sm px-6">
                {viewMode === 'month' && `No orders for ${format(selectedDate, 'MMMM yyyy')}`}
                {viewMode === 'week' && `No orders this week`}
                {viewMode === 'all' && `Start ordering to see your history`}
              </p>
            </motion.div>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={`${order.date}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-gray-900 rounded-2xl p-5 border border-gray-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <p className="font-semibold text-white text-base">
                        {format(new Date(order.date), 'EEEE, MMM d')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{order.numberOfTiffins} Tiffin{order.numberOfTiffins > 1 ? 's' : ''}</span>
                      <span>₹{order.pricePerTiffin} each</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-400">
                      ₹{order.totalAmount}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}