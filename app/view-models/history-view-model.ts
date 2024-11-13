import { Observable, Frame } from '@nativescript/core';
import { StorageService } from '../services/storage.service';
import { knownFolders } from '@nativescript/core';

export class HistoryViewModel extends Observable {
    private storage: StorageService;
    private _orders: Array<any> = [];
    private _stats: any = { totalOrders: 0, totalTiffins: 0, totalAmount: 0 };
    private _selectedDate: Date;

    constructor() {
        super();
        this.storage = new StorageService();
        this._selectedDate = new Date();
        this.loadOrders();
    }

    get selectedDate(): Date {
        return this._selectedDate;
    }

    set selectedDate(value: Date) {
        this._selectedDate = value;
        this.loadOrders();
    }

    get orders(): Array<any> {
        return this._orders;
    }

    get stats(): any {
        return this._stats;
    }

    goBack() {
        Frame.topmost().goBack();
    }

    async loadOrders() {
        const month = `${this._selectedDate.getFullYear()}-${String(this._selectedDate.getMonth() + 1).padStart(2, '0')}`;
        this._orders = this.storage.getOrdersByMonth(month);
        this._stats = this.storage.getMonthlyStats(month);
        
        this.notifyPropertyChange('orders', this._orders);
        this.notifyPropertyChange('stats', this._stats);
    }

    async exportToExcel() {
        const month = `${this._selectedDate.getFullYear()}-${String(this._selectedDate.getMonth() + 1).padStart(2, '0')}`;
        const orders = this.storage.getOrdersByMonth(month);
        
        // Create CSV content
        const headers = ['Date', 'Number of Tiffins', 'Price per Tiffin', 'Total Amount'];
        const rows = orders.map(order => [
            order.date,
            order.numberOfTiffins,
            order.pricePerTiffin,
            order.totalAmount
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Save file
        const filename = `TiffinOrders_${month}.csv`;
        const filePath = knownFolders.documents().path + '/' + filename;
        
        // Write to file
        const file = knownFolders.documents().getFile(filename);
        await file.writeText(csvContent);
        
        return filePath;
    }
}