import { Observable, Frame } from '@nativescript/core';
import { StorageService } from '../services/storage.service';
import { showToast } from '../utils/toast';

export class HomeViewModel extends Observable {
    private storage: StorageService;
    private _numberOfTiffins: number = 1;
    private _pricePerTiffin: number = 60;
    private _currentDate: string;
    private _todayStats: any = { orders: 0, tiffins: 0, amount: 0 };
    private _recentOrders: any[] = [];

    constructor() {
        super();
        this.storage = new StorageService();
        this.storage.init();
        
        const now = new Date();
        this._currentDate = now.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        this.loadTodayStats();
        this.loadRecentOrders();
    }

    get numberOfTiffins(): number {
        return this._numberOfTiffins;
    }

    get pricePerTiffin(): number {
        return this._pricePerTiffin;
    }

    get totalAmount(): number {
        return this._numberOfTiffins * this._pricePerTiffin;
    }

    get currentDate(): string {
        return this._currentDate;
    }

    get todayStats(): any {
        return this._todayStats;
    }

    get recentOrders(): any[] {
        return this._recentOrders;
    }

    increaseTiffins() {
        this._numberOfTiffins++;
        this.notifyPropertyChange('numberOfTiffins', this._numberOfTiffins);
        this.notifyPropertyChange('totalAmount', this.totalAmount);
    }

    decreaseTiffins() {
        if (this._numberOfTiffins > 1) {
            this._numberOfTiffins--;
            this.notifyPropertyChange('numberOfTiffins', this._numberOfTiffins);
            this.notifyPropertyChange('totalAmount', this.totalAmount);
        }
    }

    async submitOrder() {
        const order = {
            date: new Date().toISOString().split('T')[0],
            numberOfTiffins: this._numberOfTiffins,
            pricePerTiffin: this._pricePerTiffin,
            totalAmount: this.totalAmount
        };
        
        await this.storage.addOrder(order);
        this._numberOfTiffins = 1;
        this.notifyPropertyChange('numberOfTiffins', this._numberOfTiffins);
        this.notifyPropertyChange('totalAmount', this.totalAmount);
        
        this.loadTodayStats();
        this.loadRecentOrders();
        
        showToast('Order placed successfully!');
    }

    navigateToHistory() {
        Frame.topmost().navigate({
            moduleName: 'history-page',
            transition: {
                name: 'slide'
            }
        });
    }

    private loadTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.storage.getOrdersByDate(today);
        
        this._todayStats = {
            orders: todayOrders.length,
            tiffins: todayOrders.reduce((sum, order) => sum + order.numberOfTiffins, 0),
            amount: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        };
        
        this.notifyPropertyChange('todayStats', this._todayStats);
    }

    private loadRecentOrders() {
        this._recentOrders = this.storage.getOrders().slice(0, 5);
        this.notifyPropertyChange('recentOrders', this._recentOrders);
    }
}