import { useState } from 'react';
import { format } from 'date-fns';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useOrders } from '../hooks/useOrders';
import { motion } from 'framer-motion';

export function Home() {
  const [tiffins, setTiffins] = useState(1);
  const { addOrder, getTodayStats } = useOrders();
  const pricePerTiffin = 70;
  const todayStats = getTodayStats();

  const handleSubmit = () => {
    addOrder({
      date: format(new Date(), 'yyyy-MM-dd'),
      numberOfTiffins: tiffins,
      pricePerTiffin,
      totalAmount: tiffins * pricePerTiffin
    });
    setTiffins(1);
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto bg-gray-900 min-h-screen text-gray-100">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl p-6 mb-8 shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm bg-opacity-20"
      >
        <h1 className="text-3xl font-bold text-white">Tiffin Tracker</h1>
        <p className="text-indigo-100">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </motion.div>

      {/* Order Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 backdrop-blur-sm bg-opacity-20 border border-transparent hover:border-indigo-500 transition-all"
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-6">New Order</h2>

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setTiffins(Math.max(1, tiffins - 1))}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <MinusIcon className="h-6 w-6 text-gray-100" />
          </button>

          <div className="text-center">
            <span className="text-4xl font-bold text-gray-100">{tiffins}</span>
            <p className="text-gray-400">Tiffins</p>
          </div>

          <button
            onClick={() => setTiffins(tiffins + 1)}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="h-6 w-6 text-gray-100" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price per tiffin</span>
            <span className="font-medium text-gray-100">₹{pricePerTiffin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-100 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              ₹{tiffins * pricePerTiffin}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          Place Order
        </motion.button>
      </motion.div>

      {/* Today's Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 rounded-xl shadow-lg p-6 backdrop-blur-sm bg-opacity-20"
      >
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Today's Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl font-bold text-gray-100">{todayStats.orders}</span>
            <p className="text-sm text-gray-400">Orders</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl font-bold text-gray-100">{todayStats.tiffins}</span>
            <p className="text-sm text-gray-400">Tiffins</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              ₹{todayStats.amount}
            </span>
            <p className="text-sm text-gray-400">Revenue</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}