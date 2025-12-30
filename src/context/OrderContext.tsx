import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, startOfDay } from 'date-fns';
import { cleanupOrdersData } from '../utils/dataCleanup';

interface Order {
  id: string;
  date: string;
  numberOfTiffins: number;
  pricePerTiffin: number;
  totalAmount: number;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  deleteOrder: (id: string) => void;
  updateOrder: (id: string, updatedOrder: Omit<Order, 'id'>) => void;
  getAllOrders: () => Order[];
  getOrdersByMonth: (month: string) => Order[];
  getTodayStats: () => { orders: number; tiffins: number; amount: number };
  getMonthlyStats: (month: string) => { totalOrders: number; totalTiffins: number; totalAmount: number };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    // Use cleanup function to ensure data consistency
    return cleanupOrdersData();
  });

  useEffect(() => {
    // Clean up and save orders
    const validOrders = orders.filter(order => order.id && order.id.trim() !== '');
    if (validOrders.length !== orders.length) {
      // If we filtered out invalid orders, update the state
      setOrders(validOrders);
    }
    localStorage.setItem('orders', JSON.stringify(validOrders));
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id'>) => {
    // Remove existing order for the same date if it exists
    setOrders(prev => {
      const filtered = prev.filter(existingOrder => existingOrder.date !== order.date);
      const newOrder = {
        ...order,
        id: crypto.randomUUID()
      };
      return [newOrder, ...filtered];
    });
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const updateOrder = (id: string, updatedOrder: Omit<Order, 'id'>) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...updatedOrder, id } : order
    ));
  };

  const getAllOrders = () => {
    // Filter out any orders with invalid IDs
    return orders.filter(order => order.id && order.id.trim() !== '');
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

  return (
    <OrderContext.Provider value={{ 
      orders, 
      addOrder, 
      deleteOrder, 
      updateOrder, 
      getAllOrders, 
      getOrdersByMonth, 
      getTodayStats, 
      getMonthlyStats 
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}