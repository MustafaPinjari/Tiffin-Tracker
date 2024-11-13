import { useState } from 'react';
import { format } from 'date-fns';
import { useOrders } from '../hooks/useOrders';


export function History() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getOrdersByMonth, getMonthlyStats } = useOrders();
  
  const orders = getOrdersByMonth(format(selectedDate, 'yyyy-MM'));
  const stats = getMonthlyStats(format(selectedDate, 'yyyy-MM'));

  return (
    <div className="py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <input
          type="month"
          value={format(selectedDate, 'yyyy-MM')}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="rounded-lg border-gray-300"
        />
      </div>

      {/* Monthly Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{stats.totalOrders}</span>
            <p className="text-sm text-gray-500">Orders</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900">{stats.totalTiffins}</span>
            <p className="text-sm text-gray-500">Tiffins</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-indigo-600">₹{stats.totalAmount}</span>
            <p className="text-sm text-gray-500">Revenue</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">
                  {format(new Date(order.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {order.numberOfTiffins} Tiffins
                </p>
              </div>
              <span className="text-lg font-bold text-indigo-600">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}