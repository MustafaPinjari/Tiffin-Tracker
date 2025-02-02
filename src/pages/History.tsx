import { useState } from 'react';
import { format } from 'date-fns';
import { useOrders } from '../hooks/useOrders';
import { motion } from 'framer-motion';

export function History() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getOrdersByMonth, getMonthlyStats } = useOrders();

  const orders = getOrdersByMonth(format(selectedDate, 'yyyy-MM'));
  const stats = getMonthlyStats(format(selectedDate, 'yyyy-MM'));

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto bg-gray-900 min-h-screen text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          Order History
        </h1>
        <input
          type="month"
          value={format(selectedDate, 'yyyy-MM')}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="rounded-lg bg-gray-800 text-gray-100 p-2 border border-gray-700 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Monthly Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 backdrop-blur-sm bg-opacity-20"
      >
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 bg-gray-700 rounded-lg"
          >
            <span className="text-3xl font-bold text-gray-100">{stats.totalOrders}</span>
            <p className="text-sm text-gray-400">Orders</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 bg-gray-700 rounded-lg"
          >
            <span className="text-3xl font-bold text-gray-100">{stats.totalTiffins}</span>
            <p className="text-sm text-gray-400">Tiffins</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-center p-4 bg-gray-700 rounded-lg"
          >
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              ₹{stats.totalAmount}
            </span>
            <p className="text-sm text-gray-400">Revenue</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {orders.map((order, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 rounded-xl shadow-lg p-4 hover:bg-gray-700 transition-colors backdrop-blur-sm bg-opacity-20"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-100">
                  {format(new Date(order.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-400">
                  {order.numberOfTiffins} Tiffins
                </p>
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                ₹{order.totalAmount}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}