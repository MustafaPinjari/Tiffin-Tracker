import React from 'react';
import { useApp } from './AppContext';
import { Order, MealType, MealStatus } from '../types';

export interface LegacyOrder {
  id: string;
  date: string;
  numberOfTiffins: number;
  pricePerTiffin: number;
  totalAmount: number;
  mealType?: MealType;
  status?: MealStatus;
  notes?: string;
  vendor?: string;
  createdAt?: string;
}

export type LegacyOrderInput = {
  date: string;
  numberOfTiffins: number;
  pricePerTiffin?: number;
  totalAmount?: number;
  mealType?: MealType;
  status?: MealStatus;
  notes?: string;
  vendor?: string;
};

/**
 * Backward compatibility adapter for OrderContext.
 * Re-routes calls to the unified AppContext.
 */
export function OrderProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useOrders() {
  const app = useApp();

  return {
    orders: app.orders,
    addOrder: (order: LegacyOrderInput) => {
      app.addOrder({
        date: order.date,
        numberOfTiffins: order.numberOfTiffins,
        pricePerTiffin: order.pricePerTiffin,
        mealType: order.mealType || 'single',
        status: order.status || 'ordered',
        notes: order.notes,
        vendor: order.vendor
      });
    },
    deleteOrder: (id: string) => app.deleteOrder(id),
    updateOrder: (id: string, updatedOrder: Partial<Order>) => app.updateOrder(id, updatedOrder),
    getAllOrders: () => app.orders,
    getOrdersByMonth: (month: string) => app.orders.filter(o => o.date.startsWith(month)),
    getTodayStats: () => {
      const stats = app.getTodayStats();
      return {
        orders: stats.totalOrders,
        tiffins: stats.totalTiffins,
        amount: stats.totalAmount
      };
    },
    getMonthlyStats: (month: string) => {
      const stats = app.getMonthlyStats(month);
      return {
        totalOrders: stats.totalOrders,
        totalTiffins: stats.totalTiffins,
        totalAmount: stats.totalAmount
      };
    },
    getTotalStats: () => {
      const stats = app.getTotalStats();
      return {
        totalOrders: stats.totalOrders,
        totalTiffins: stats.totalTiffins,
        totalAmount: stats.totalAmount
      };
    }
  };
}