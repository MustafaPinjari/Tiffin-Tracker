import { useState } from 'react';
import { format } from 'date-fns';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useOrders } from '../hooks/useOrders';

export function Home() {
  const [tiffins, setTiffins] = useState(1);
  const { addOrder, getTodayStats } = useOrders();
  const pricePerTiffin = 60;
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
    <div className="py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 -mx-4 px-4 py-6 sm:mx-0 sm:rounded-lg">
        <h1 className="text-2xl font-bold text-white">Tiffin Tracker</h1>
        <p className="text-indigo-100">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Order Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">New Order</h2>
        
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setTiffins(Math.max(1, tiffins - 1))}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <MinusIcon className="h-6 w-6" />
          </button>
          
          <div className="text-center">
            <span className="text-3xl font-bold text-gray-900">{tiffins}</span>
            <p className="text-gray-500">Tiffins</p>
          </div>
          
          <button
            onClick={() => setTiffins(tiffins + 1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Price per tiffin</span>
            <span className="font-medium">₹{pricePerTiffin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-900 font-medium">Total Amount</span>
            <span className="text-xl font-bold text-indigo-600">₹{tiffins * pricePerTiffin}</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
        >
          Place Order
        </button>
      </div>

      {/* Today's Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{todayStats.orders}</span>
            <p className="text-sm text-gray-500">Orders</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{todayStats.tiffins}</span>
            <p className="text-sm text-gray-500">Tiffins</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-indigo-600">₹{todayStats.amount}</span>
            <p className="text-sm text-gray-500">Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
}