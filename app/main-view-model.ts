import { Observable } from '@nativescript/core';
import { StorageService, TiffinOrder } from './services/storage.service';

export class MainViewModel extends Observable {
    private storage: StorageService;
    private _selectedTabIndex: number = 0;
    private _numberOfTiffins: number = 1;
    private _pricePerTiffin: number = 60;
    private _currentDate: string;
    private _orders: TiffinOrder[] = [];
    private _stats: any;
    private _selectedYear: number;
    private _selectedMonth: number;

    constructor() {
        super();
        this.storage = new StorageService();
        this.storage.init();
        
        const now = new Date();
        this._currentDate = now.toISOString().split('T')[0];
        this._selectedYear = now.getFullYear();
        this._selectedMonth = now.getMonth();
        
        this.loadOrders();
    }

    get selectedTabIndex(): number {
        return this._selectedTabIndex;
    }

    get numberOfTiffins(): number {
        return this._numberOfTiffins;
    }

    set numberOfTiffins(value: number) {
        if (this._numberOfTiffins !== value) {
            this._numberOfTiffins = value;
            this.notifyPropertyChange('numberOfTiffins', value);
            this.notifyPropertyChange('totalAmount', this.totalAmount);
        }
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

    get orders(): TiffinOrder[] {
        return this._orders;
    }

    get stats(): any {
        return this._stats;
    }

    get selectedYear(): number {
        return this._selectedYear;
    }

    get selectedMonth(): number {
        return this._selectedMonth;
    }

    submitOrder() {
        const order: TiffinOrder = {
            date: this._currentDate,
            numberOfTiffins: this._numberOfTiffins,
            pricePerTiffin: this._pricePerTiffin,
            totalAmount: this.totalAmount
        };
        
        this.storage.addOrder(order);
        this._numberOfTiffins = 1;
        this.notifyPropertyChange('numberOfTiffins', 1);
        this.loadOrders();
    }

    onDateChanged(args: any) {
        const date = args.value as Date;
        this._selectedYear = date.getFullYear();
        this._selectedMonth = date.getMonth();
        this.loadOrders();
    }

    private loadOrders() {
        const monthStr = `${this._selectedYear}-${String(this._selectedMonth + 1).padStart(2, '0')}`;
        this._orders = this.storage.getOrdersByMonth(monthStr);
        this._stats = this.storage.getTotalStats();
        
        this.notifyPropertyChange('orders', this._orders);
        this.notifyPropertyChange('stats', this._stats);
    }
}