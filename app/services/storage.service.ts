import { ApplicationSettings } from '@nativescript/core';

export interface TiffinOrder {
    date: string;
    numberOfTiffins: number;
    pricePerTiffin: number;
    totalAmount: number;
}

export class StorageService {
    private static ORDERS_KEY = 'tiffin_orders';

    init(): void {
        if (!ApplicationSettings.getString(StorageService.ORDERS_KEY)) {
            ApplicationSettings.setString(StorageService.ORDERS_KEY, JSON.stringify([]));
        }
    }

    addOrder(order: TiffinOrder): void {
        const orders = this.getOrders();
        orders.unshift(order); // Add to beginning of array
        ApplicationSettings.setString(StorageService.ORDERS_KEY, JSON.stringify(orders));
    }

    getOrders(): TiffinOrder[] {
        const orders = ApplicationSettings.getString(StorageService.ORDERS_KEY);
        return orders ? JSON.parse(orders) : [];
    }

    getOrdersByMonth(month: string): TiffinOrder[] {
        return this.getOrders().filter(order => order.date.startsWith(month));
    }

    getOrdersByDate(date: string): TiffinOrder[] {
        return this.getOrders().filter(order => order.date === date);
    }

    getTotalStats() {
        const orders = this.getOrders();
        return {
            totalOrders: orders.length,
            totalTiffins: orders.reduce((sum, order) => sum + order.numberOfTiffins, 0),
            totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
        };
    }

    getMonthlyStats(month: string) {
        const orders = this.getOrdersByMonth(month);
        return {
            totalOrders: orders.length,
            totalTiffins: orders.reduce((sum, order) => sum + order.numberOfTiffins, 0),
            totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
        };
    }
}