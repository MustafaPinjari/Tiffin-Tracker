import { useState } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { PlusIcon, MinusIcon, CalendarIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useOrders } from '../hooks/useOrders';
import { motion } from 'framer-motion';
import { Toast } from '../components/Toast';

export function Home() {
  const [tiffins, setTiffins] = useState(1);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { addOrder, getTodayStats, getMonthlyStats, getAllOrders } = useOrders();
  const pricePerTiffin = 40;
  const todayStats = getTodayStats();
  const monthlyStats = getMonthlyStats(format(new Date(), 'yyyy-MM'));
  const allOrders = getAllOrders();

  // Calculate weekly stats
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weeklyOrders = allOrders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= weekStart && orderDate <= weekEnd;
  });
  const weeklyStats = {
    orders: weeklyOrders.length,
    tiffins: weeklyOrders.reduce((sum, order) => sum + order.numberOfTiffins, 0),
    amount: weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  const handleSubmit = () => {
    addOrder({
      date: selectedDate,
      numberOfTiffins: tiffins,
      pricePerTiffin,
      totalAmount: tiffins * pricePerTiffin
    });
    
    const message = isToday 
      ? `Order confirmed! ${tiffins} tiffin${tiffins > 1 ? 's' : ''} for today`
      : `Order added for ${format(new Date(selectedDate), 'MMM d, yyyy')}`;
    
    setToastMessage(message);
    setShowToast(true);
    setTiffins(1);
    setShowDatePicker(false);
  };

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-black">
      {/* Toast Notification */}
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />

      {/* Status Bar Simulation */}
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
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} Bubuuuuu
          </h1>
           <h1 className="text-2xl font-bold text-white mb-1">
            I love you bubuuuuuu 😘🫂           
          </h1>
          <p className="text-gray-400 text-base">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </motion.div>

        {/* Quick Order Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-900 rounded-3xl p-6 mb-6 border border-gray-800"
        >
          {/* Date Selection Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">
                {isToday ? "Today's Tiffin" : "Order Tiffin"}
              </h2>
              <p className="text-gray-400 text-sm">
                {format(new Date(selectedDate), 'EEEE, MMM d')}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full"
            >
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300 text-sm font-medium">
                {isToday ? "Today" : "Change"}
              </span>
            </motion.button>
          </div>

          {/* iOS-style Date Picker */}
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-gray-800 rounded-2xl"
            >
              <div className="space-y-4">
                <input
                  type="date"
                  value={selectedDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl bg-gray-700 text-white p-3 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
                    className="flex-1 px-3 py-2 bg-blue-600 rounded-xl text-white text-sm font-medium"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setSelectedDate(format(yesterday, 'yyyy-MM-dd'));
                    }}
                    className="flex-1 px-3 py-2 bg-gray-700 rounded-xl text-white text-sm font-medium"
                  >
                    Yesterday
                  </button>
                </div>
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
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center"
                disabled={tiffins <= 1}
              >
                <MinusIcon className="h-5 w-5 text-white" />
              </motion.button>

              <div className="text-center">
                <motion.div
                  key={tiffins}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold text-white mb-1"
                >
                  {tiffins}
                </motion.div>
                <p className="text-gray-400 text-sm">Tiffin{tiffins > 1 ? 's' : ''}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTiffins(tiffins + 1)}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center"
              >
                <PlusIcon className="h-5 w-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Price per tiffin</span>
              <span className="text-white font-medium">₹{pricePerTiffin}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20">
              <span className="text-white font-semibold">Total</span>
              <motion.span 
                key={tiffins * pricePerTiffin}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-blue-400"
              >
                ₹{tiffins * pricePerTiffin}
              </motion.span>
            </div>
          </div>

          {/* Order Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-base transition-colors"
          >
            {isToday ? "Confirm Order" : "Add Order"}
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-white mb-1">{todayStats.orders}</div>
            <div className="text-gray-400 text-xs">Today's Orders</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-white mb-1">{todayStats.tiffins}</div>
            <div className="text-gray-400 text-xs">Tiffins</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-4 text-center border border-gray-800">
            <div className="text-2xl font-bold text-blue-400 mb-1">₹{todayStats.amount}</div>
            <div className="text-gray-400 text-xs">Spent</div>
          </div>
        </motion.div>

        {/* Weekly & Monthly Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          {/* This Week */}
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-white">This Week</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{weeklyStats.orders}</div>
                <div className="text-gray-400 text-xs">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{weeklyStats.tiffins}</div>
                <div className="text-gray-400 text-xs">Tiffins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">₹{weeklyStats.amount}</div>
                <div className="text-gray-400 text-xs">Spent</div>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="h-5 w-5 text-green-400" />
              <h3 className="font-semibold text-white">This Month</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{monthlyStats.totalOrders}</div>
                <div className="text-gray-400 text-xs">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{monthlyStats.totalTiffins}</div>
                <div className="text-gray-400 text-xs">Tiffins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">₹{monthlyStats.totalAmount}</div>
                <div className="text-gray-400 text-xs">Spent</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}