import { Order, UserSettings, WalletState } from '../types';
import { generateId } from './id';

const STORAGE_KEYS = {
  ORDERS: 'orders',
  SETTINGS: 'tiffin_settings',
  WALLET: 'tiffin_wallet',
  BACKUP_PREFIX: 'orders_backup_',
  CORRUPTED_RAW: 'orders_corrupted_raw'
} as const;

export const DEFAULT_SETTINGS: UserSettings = {
  defaultPrice: 40,
  currency: 'INR',
  currencySymbol: '₹',
  trackingMode: 'single',
  monthlyBudget: 0,
  budgetAlertThreshold: 80,
  theme: 'dark',
  accentColor: 'blue',
  gamificationEnabled: true,
  walletEnabled: true,
  reminders: {
    enabled: false,
    reminderTime: '12:00',
    skipWeekends: true
  }
};

export const DEFAULT_WALLET: WalletState = {
  balance: 0,
  transactions: []
};

/**
 * Safely loads orders from storage with defensive validation and legacy migration.
 * NEVER deletes data on parsing or validation error.
 */
export function loadOrdersSafely(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw || raw.trim() === '') {
      return [];
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error('Failed to parse orders from localStorage. Preserving raw data in emergency backup.', parseError);
      // Save raw data to emergency key so it is NEVER lost
      localStorage.setItem(`${STORAGE_KEYS.CORRUPTED_RAW}_${Date.now()}`, raw);
      return [];
    }

    if (!Array.isArray(parsed)) {
      console.warn('Orders in storage is not an array. Preserving raw dump.');
      localStorage.setItem(`${STORAGE_KEYS.CORRUPTED_RAW}_${Date.now()}`, raw);
      return [];
    }

    // Sanitize and migrate legacy orders
    const validOrders: Order[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;

      // Extract date
      const date = typeof item.date === 'string' ? item.date.trim() : '';
      if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) continue;

      // Extract quantity
      const numberOfTiffins = typeof item.numberOfTiffins === 'number' && item.numberOfTiffins > 0
        ? item.numberOfTiffins
        : typeof item.quantity === 'number' && item.quantity > 0
        ? item.quantity
        : 1;

      // Extract unit price (support legacy where totalAmount was stored without unit price)
      let pricePerTiffin = typeof item.pricePerTiffin === 'number' && item.pricePerTiffin >= 0
        ? item.pricePerTiffin
        : 0;

      if (pricePerTiffin === 0 && typeof item.totalAmount === 'number' && item.totalAmount > 0) {
        pricePerTiffin = Math.round((item.totalAmount / numberOfTiffins) * 100) / 100;
      }
      if (pricePerTiffin === 0) {
        pricePerTiffin = 40; // Default fallback for historical untagged orders
      }

      const totalAmount = typeof item.totalAmount === 'number' && item.totalAmount >= 0
        ? item.totalAmount
        : Math.round(numberOfTiffins * pricePerTiffin * 100) / 100;

      const order: Order = {
        id: typeof item.id === 'string' && item.id.trim() ? item.id : generateId(),
        date,
        mealType: item.mealType === 'lunch' || item.mealType === 'dinner' ? item.mealType : 'single',
        numberOfTiffins,
        pricePerTiffin,
        totalAmount,
        status: item.status === 'skipped' ? 'skipped' : 'ordered',
        notes: typeof item.notes === 'string' ? item.notes : undefined,
        vendor: typeof item.vendor === 'string' ? item.vendor : undefined,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined
      };

      validOrders.push(order);
    }

    // Sort descending by date
    validOrders.sort((a, b) => b.date.localeCompare(a.date));
    return validOrders;
  } catch (err) {
    console.error('Unexpected error loading orders:', err);
    return [];
  }
}

/**
 * Safely saves orders to localStorage with quota error handling.
 */
export function saveOrdersSafely(orders: Order[]): { success: boolean; error?: string } {
  try {
    const serialized = JSON.stringify(orders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, serialized);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to save orders to localStorage:', err);
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      return { success: false, error: 'Storage quota exceeded. Please export and archive older records.' };
    }
    return { success: false, error: 'Could not write to local storage.' };
  }
}

/**
 * Safely loads user settings.
 */
export function loadSettingsSafely(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      reminders: {
        ...DEFAULT_SETTINGS.reminders,
        ...(parsed.reminders || {})
      }
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Safely saves user settings.
 */
export function saveSettingsSafely(settings: UserSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return false;
  }
}

/**
 * Safely loads wallet state.
 */
export function loadWalletSafely(): WalletState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (!raw) return DEFAULT_WALLET;
    const parsed = JSON.parse(raw);
    return {
      balance: typeof parsed.balance === 'number' ? parsed.balance : 0,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : []
    };
  } catch {
    return DEFAULT_WALLET;
  }
}

/**
 * Safely saves wallet state.
 */
export function saveWalletSafely(wallet: WalletState): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    return true;
  } catch (err) {
    console.error('Failed to save wallet:', err);
    return false;
  }
}

/**
 * Creates an emergency pre-migration or manual timestamped backup.
 */
export function createTimestampedBackup(): string | null {
  try {
    const currentOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!currentOrders) return null;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = `${STORAGE_KEYS.BACKUP_PREFIX}${timestamp}`;
    localStorage.setItem(backupKey, currentOrders);
    return backupKey;
  } catch (err) {
    console.error('Failed to create backup:', err);
    return null;
  }
}

/**
 * Lists available local backups.
 */
export function getLocalBackups(): { key: string; date: string; count: number }[] {
  const backups: { key: string; date: string; count: number }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.BACKUP_PREFIX)) {
        const raw = localStorage.getItem(key);
        let count = 0;
        try {
          const parsed = JSON.parse(raw || '[]');
          if (Array.isArray(parsed)) count = parsed.length;
        } catch {}
        backups.push({
          key,
          date: key.replace(STORAGE_KEYS.BACKUP_PREFIX, ''),
          count
        });
      }
    }
  } catch {}
  return backups.sort((a, b) => b.key.localeCompare(a.key));
}
