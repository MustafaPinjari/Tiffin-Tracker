import { Order, UserSettings, WalletState } from '../types';

export interface FullBackupPayload {
  version: string;
  exportedAt: string;
  orders: Order[];
  settings?: UserSettings;
  wallet?: WalletState;
}

/**
 * Generates and triggers download of order records as CSV.
 */
export function exportOrdersToCSV(orders: Order[], filename = 'tiffin-orders.csv'): void {
  const headers = ['ID', 'Date', 'Meal Type', 'Quantity', 'Price Per Tiffin (INR)', 'Total Amount (INR)', 'Status', 'Notes', 'Created At'];
  
  const rows = orders.map(order => [
    order.id,
    order.date,
    order.mealType || 'single',
    order.numberOfTiffins,
    order.pricePerTiffin,
    order.totalAmount,
    order.status,
    `"${(order.notes || '').replace(/"/g, '""')}"`,
    order.createdAt
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Generates and triggers download of full application state as JSON.
 */
export function exportFullBackupJSON(
  orders: Order[],
  settings?: UserSettings,
  wallet?: WalletState,
  filename = 'tiffin-tracker-backup.json'
): void {
  const payload: FullBackupPayload = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    orders,
    settings,
    wallet
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Validates and inspects an imported JSON backup before applying.
 */
export function parseAndValidateBackupJSON(jsonString: string): {
  valid: boolean;
  error?: string;
  ordersCount: number;
  newOrdersCount: number;
  existingDuplicatesCount: number;
  payload?: FullBackupPayload;
  parsedOrders?: Order[];
} {
  try {
    const parsed = JSON.parse(jsonString);
    let ordersList: any[] = [];

    if (Array.isArray(parsed)) {
      ordersList = parsed;
    } else if (parsed && Array.isArray(parsed.orders)) {
      ordersList = parsed.orders;
    } else {
      return { valid: false, error: 'File is not a valid Tiffin Tracker backup or orders array.', ordersCount: 0, newOrdersCount: 0, existingDuplicatesCount: 0 };
    }

    const validOrders: Order[] = [];
    for (const item of ordersList) {
      if (!item || typeof item !== 'object') continue;
      if (typeof item.date !== 'string' || !item.date.match(/^\d{4}-\d{2}-\d{2}$/)) continue;

      const order: Order = {
        id: typeof item.id === 'string' && item.id.trim() ? item.id : `imported-${Math.random()}`,
        date: item.date,
        mealType: item.mealType === 'lunch' || item.mealType === 'dinner' ? item.mealType : 'single',
        numberOfTiffins: Number(item.numberOfTiffins) || 1,
        pricePerTiffin: Number(item.pricePerTiffin) || 40,
        totalAmount: Number(item.totalAmount) || 40,
        status: item.status === 'skipped' ? 'skipped' : 'ordered',
        notes: item.notes,
        createdAt: item.createdAt || new Date().toISOString()
      };
      validOrders.push(order);
    }

    return {
      valid: true,
      ordersCount: validOrders.length,
      newOrdersCount: validOrders.length,
      existingDuplicatesCount: 0,
      payload: parsed,
      parsedOrders: validOrders
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Invalid JSON syntax: ${err.message}`,
      ordersCount: 0,
      newOrdersCount: 0,
      existingDuplicatesCount: 0
    };
  }
}

/**
 * Helper to download a blob via temporary link.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
