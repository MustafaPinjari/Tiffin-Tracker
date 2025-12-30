import { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';

interface Order {
  date: string;
  numberOfTiffins: number;
  pricePerTiffin: number;
  totalAmount: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const getOrdersByMonth = (month: string) => {
    return orders.filter(order => order.date.startsWith(month));
  };

  const getTodayStats = () => {
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const todayOrders = orders.filter(order => order.date === today);
    
    return {
      orders: todayOrders.length,
      tiffins: todayOrders.reduce((sum, order) => sum + order.numberOfTiffins, 0),
      amount: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    };
  };

  const getMonthlyStats = (month: string) => {
    const monthOrders = getOrdersByMonth(month);
    
    return {
      totalOrders: monthOrders.length,
      totalTiffins: monthOrders.reduce((sum, order) => sum + order.numberOfTiffins, 0),
      totalAmount: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    };
  };

  const getAllOrders = () => {
    return orders;
  };

  return {
    orders,
    addOrder,
    getOrdersByMonth,
    getAllOrders,
    getTodayStats,
    getMonthlyStats
  };
}