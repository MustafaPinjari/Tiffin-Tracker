import { Sqlite } from '@nativescript/sqlite';

export class DatabaseService {
    private database: Sqlite;

    async init() {
        this.database = await new Sqlite('tiffin.db');
        await this.createTables();
    }

    private async createTables() {
        await this.database.execute(`
            CREATE TABLE IF NOT EXISTS tiffin_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                numberOfTiffins INTEGER NOT NULL,
                pricePerTiffin INTEGER NOT NULL,
                totalAmount INTEGER NOT NULL
            )
        `);
    }

    async addOrder(order: any) {
        const query = `
            INSERT INTO tiffin_orders (date, numberOfTiffins, pricePerTiffin, totalAmount)
            VALUES (?, ?, ?, ?)
        `;
        await this.database.execute(query, [
            order.date,
            order.numberOfTiffins,
            order.pricePerTiffin,
            order.totalAmount
        ]);
    }

    async getOrders() {
        const result = await this.database.all('SELECT * FROM tiffin_orders ORDER BY date DESC');
        return result;
    }

    async getOrdersByMonth(month: string) {
        const query = "SELECT * FROM tiffin_orders WHERE strftime('%Y-%m', date) = ? ORDER BY date DESC";
        return await this.database.all(query, [month]);
    }

    async getTotalStats() {
        const result = await this.database.get(`
            SELECT 
                COUNT(*) as totalOrders,
                SUM(numberOfTiffins) as totalTiffins,
                SUM(totalAmount) as totalAmount
            FROM tiffin_orders
        `);
        return result;
    }
}