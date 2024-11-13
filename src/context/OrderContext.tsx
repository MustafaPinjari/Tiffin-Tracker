import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format, startOfDay } from 'date-fns';

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
  getOrdersByMonth: (month: string) => Order[];
  getTodayStats: () => { orders: number; tiffins: number; amount: number };
  getMonthlyStats: (month: string) => { totalOrders: number; totalTiffins: number; totalAmount: number };
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder = {
      ...order,
      id: crypto.randomUUID()
    };
    setOrders(prev => [newOrder, ...prev]);
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
    <OrderContext.Provider value={{ orders, addOrder, getOrdersByMonth, getTodayStats, getMonthlyStats }}>
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