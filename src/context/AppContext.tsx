import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Order,
  OrderInput,
  UserSettings,
  WalletState,
  ToastNotification,
  PeriodStats
} from '../types';
import {
  loadOrdersSafely,
  saveOrdersSafely,
  loadSettingsSafely,
  saveSettingsSafely,
  loadWalletSafely,
  saveWalletSafely,
  createTimestampedBackup,
  DEFAULT_SETTINGS,
  DEFAULT_WALLET
} from '../utils/storage';
import { generateId } from '../utils/id';
import {
  getTodayDateString,
  getWeekBoundaries,
  getMonthKey,
  isDateWithin
} from '../utils/date';
import {
  calculateOrderTotal,
  calculateStatsForOrders
} from '../utils/calculations';
import { checkAndTriggerDailyReminder } from '../utils/notifications';

interface FilterOptions {
  mode: 'month' | 'week' | 'all' | 'custom';
  anchorDate: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface AppContextType {
  orders: Order[];
  settings: UserSettings;
  wallet: WalletState;
  isOffline: boolean;
  toast: ToastNotification | null;
  showToast: (message: string, type?: ToastNotification['type'], action?: ToastNotification['action']) => void;
  dismissToast: () => void;
  
  // Order actions
  addOrder: (input: OrderInput) => { success: boolean; orderId?: string; isUpdate?: boolean };
  updateOrder: (id: string, updates: Partial<Order>) => boolean;
  deleteOrder: (id: string) => boolean;
  undoLastAction: () => void;
  recordSkippedMeal: (date: string, mealType?: Order['mealType'], notes?: string) => void;
  
  // Settings & Pricing
  updateSettings: (updates: Partial<UserSettings>) => void;
  
  // Wallet
  addWalletCredit: (amount: number, description: string) => void;
  deductWallet: (amount: number, description: string, orderId?: string) => boolean;
  
  // Statistics & Queries
  getTodayStats: () => PeriodStats & { todayOrders: Order[] };
  getWeeklyStats: (anchorDate?: string) => PeriodStats & { weekOrders: Order[]; weekRange: string };
  getMonthlyStats: (monthKey?: string) => PeriodStats & { monthOrders: Order[] };
  getTotalStats: () => PeriodStats;
  getFilteredOrders: (options: FilterOptions) => { orders: Order[]; stats: PeriodStats };
  
  // Backup / Reset
  restoreOrdersFromBackup: (importedOrders: Order[], mode: 'merge' | 'replace') => number;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => loadOrdersSafely());
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettingsSafely());
  const [wallet, setWalletState] = useState<WalletState>(() => loadWalletSafely());
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [lastDeletedOrder, setLastDeletedOrder] = useState<Order | null>(null);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('You are back online', 'info');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('Offline Mode — Changes saved to device', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [settings.theme]);

  // Persist orders on change
  useEffect(() => {
    saveOrdersSafely(orders);
  }, [orders]);

  // Persist settings on change
  useEffect(() => {
    saveSettingsSafely(settings);
  }, [settings]);

  // Persist wallet on change
  useEffect(() => {
    saveWalletSafely(wallet);
  }, [wallet]);

  const showToast = useCallback((
    message: string,
    type: ToastNotification['type'] = 'success',
    action?: ToastNotification['action']
  ) => {
    setToast({
      id: generateId(),
      message,
      type,
      action
    });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Daily reminder evaluation and background polling
  useEffect(() => {
    // Run immediate check
    checkAndTriggerDailyReminder(settings, orders, (title, body) => {
      showToast(`${title}: ${body}`, 'info');
    });

    // Run periodic evaluation every 30 seconds
    const interval = setInterval(() => {
      checkAndTriggerDailyReminder(settings, orders, (title, body) => {
        showToast(`${title}: ${body}`, 'info');
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [settings, orders, showToast]);

  // ADD ORDER
  const addOrder = useCallback((input: OrderInput) => {
    const mealType = input.mealType || (settings.trackingMode === 'detailed' ? 'lunch' : 'single');
    const unitPrice = input.pricePerTiffin !== undefined && input.pricePerTiffin >= 0
      ? input.pricePerTiffin
      : settings.defaultPrice;

    const totalAmount = calculateOrderTotal(input.numberOfTiffins, unitPrice);

    let isUpdate = false;
    let finalOrderId = '';

    setOrders(prev => {
      // Check if an existing order on the same date and mealType already exists
      const existingIdx = prev.findIndex(o => o.date === input.date && o.mealType === mealType);

      if (existingIdx >= 0) {
        // Update existing record safely
        isUpdate = true;
        const updated = [...prev];
        finalOrderId = updated[existingIdx].id;
        updated[existingIdx] = {
          ...updated[existingIdx],
          numberOfTiffins: input.numberOfTiffins,
          pricePerTiffin: unitPrice,
          totalAmount,
          status: input.status || 'ordered',
          notes: input.notes !== undefined ? input.notes : updated[existingIdx].notes,
          vendor: input.vendor !== undefined ? input.vendor : updated[existingIdx].vendor,
          updatedAt: new Date().toISOString()
        };
        return updated;
      }

      // Create new record
      finalOrderId = generateId();
      const newOrder: Order = {
        id: finalOrderId,
        date: input.date,
        mealType,
        numberOfTiffins: input.numberOfTiffins,
        pricePerTiffin: unitPrice,
        totalAmount,
        status: input.status || 'ordered',
        notes: input.notes,
        vendor: input.vendor,
        createdAt: new Date().toISOString()
      };

      const next = [newOrder, ...prev];
      next.sort((a, b) => b.date.localeCompare(a.date));
      return next;
    });

    return { success: true, orderId: finalOrderId, isUpdate };
  }, [settings.defaultPrice, settings.trackingMode]);

  // UPDATE ORDER
  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    let updated = false;
    setOrders(prev => {
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) return prev;

      updated = true;
      const current = prev[idx];
      const newQuantity = updates.numberOfTiffins !== undefined ? updates.numberOfTiffins : current.numberOfTiffins;
      const newUnitPrice = updates.pricePerTiffin !== undefined ? updates.pricePerTiffin : current.pricePerTiffin;
      const newTotal = calculateOrderTotal(newQuantity, newUnitPrice);

      const next = [...prev];
      next[idx] = {
        ...current,
        ...updates,
        numberOfTiffins: newQuantity,
        pricePerTiffin: newUnitPrice,
        totalAmount: newTotal,
        updatedAt: new Date().toISOString()
      };

      next.sort((a, b) => b.date.localeCompare(a.date));
      return next;
    });

    return updated;
  }, []);

  // DELETE ORDER (with Undo support)
  const deleteOrder = useCallback((id: string) => {
    let deleted: Order | null = null;
    setOrders(prev => {
      const target = prev.find(o => o.id === id);
      if (target) {
        deleted = target;
      }
      return prev.filter(o => o.id !== id);
    });

    if (deleted) {
      setLastDeletedOrder(deleted);
      showToast(
        `Deleted order for ${(deleted as Order).date}`,
        'info',
        {
          label: 'Undo',
          onClick: () => {
            if (deleted) {
              setOrders(prev => [deleted!, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
              setLastDeletedOrder(null);
              showToast('Order restored', 'success');
            }
          }
        }
      );
      return true;
    }
    return false;
  }, [showToast]);

  // UNDO LAST ACTION
  const undoLastAction = useCallback(() => {
    if (lastDeletedOrder) {
      setOrders(prev => [lastDeletedOrder, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
      setLastDeletedOrder(null);
      showToast('Order restored', 'success');
    }
  }, [lastDeletedOrder, showToast]);

  // RECORD SKIPPED MEAL
  const recordSkippedMeal = useCallback((date: string, mealType?: Order['mealType'], notes?: string) => {
    const type = mealType || (settings.trackingMode === 'detailed' ? 'lunch' : 'single');
    setOrders(prev => {
      const filtered = prev.filter(o => !(o.date === date && o.mealType === type));
      const skippedOrder: Order = {
        id: generateId(),
        date,
        mealType: type,
        numberOfTiffins: 0,
        pricePerTiffin: 0,
        totalAmount: 0,
        status: 'skipped',
        notes: notes || 'Meal skipped',
        createdAt: new Date().toISOString()
      };
      const next = [skippedOrder, ...filtered];
      next.sort((a, b) => b.date.localeCompare(a.date));
      return next;
    });
    showToast(`Marked ${date} as skipped`, 'info');
  }, [settings.trackingMode, showToast]);

  // UPDATE SETTINGS
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...updates };
      // Note: Changing defaultPrice only affects future orders; existing orders are untouched
      return next;
    });
    showToast('Settings saved successfully', 'success');
  }, [showToast]);

  // WALLET ACTIONS
  const addWalletCredit = useCallback((amount: number, description: string) => {
    if (amount <= 0) return;
    setWalletState(prev => {
      const newTransaction = {
        id: generateId(),
        date: getTodayDateString(),
        type: 'credit' as const,
        amount,
        description: description || 'Added prepaid credit',
        timestamp: Date.now()
      };
      return {
        balance: Math.round((prev.balance + amount) * 100) / 100,
        transactions: [newTransaction, ...prev.transactions]
      };
    });
    showToast(`Added ${settings.currencySymbol}${amount} to wallet`, 'success');
  }, [settings.currencySymbol, showToast]);

  const deductWallet = useCallback((amount: number, description: string, orderId?: string) => {
    if (amount <= 0) return false;
    let allowed = false;
    setWalletState(prev => {
      if (prev.balance < amount) {
        return prev;
      }
      allowed = true;
      const newTransaction = {
        id: generateId(),
        date: getTodayDateString(),
        type: 'debit' as const,
        amount,
        description: description || 'Meal deduction',
        orderId,
        timestamp: Date.now()
      };
      return {
        balance: Math.round((prev.balance - amount) * 100) / 100,
        transactions: [newTransaction, ...prev.transactions]
      };
    });
    return allowed;
  }, []);

  // STATISTICS QUERIES
  const getTodayStats = useCallback(() => {
    const today = getTodayDateString();
    const todayOrders = orders.filter(o => o.date === today);
    const stats = calculateStatsForOrders(todayOrders);
    return { ...stats, todayOrders };
  }, [orders]);

  const getWeeklyStats = useCallback((anchorDate = getTodayDateString()) => {
    const { startStr, endStr, display } = getWeekBoundaries(anchorDate);
    const weekOrders = orders.filter(o => isDateWithin(o.date, startStr, endStr));
    const stats = calculateStatsForOrders(weekOrders);
    return { ...stats, weekOrders, weekRange: display };
  }, [orders]);

  const getMonthlyStats = useCallback((monthKey = getMonthKey(new Date())) => {
    const monthOrders = orders.filter(o => o.date.startsWith(monthKey));
    const stats = calculateStatsForOrders(monthOrders);
    return { ...stats, monthOrders };
  }, [orders]);

  const getTotalStats = useCallback(() => {
    return calculateStatsForOrders(orders);
  }, [orders]);

  const getFilteredOrders = useCallback((options: FilterOptions) => {
    let filtered = [...orders];

    if (options.mode === 'month') {
      const monthKey = options.anchorDate.substring(0, 7);
      filtered = filtered.filter(o => o.date.startsWith(monthKey));
    } else if (options.mode === 'week') {
      const { startStr, endStr } = getWeekBoundaries(options.anchorDate);
      filtered = filtered.filter(o => isDateWithin(o.date, startStr, endStr));
    } else if (options.mode === 'custom' && options.startDate && options.endDate) {
      filtered = filtered.filter(o => isDateWithin(o.date, options.startDate!, options.endDate!));
    }

    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(o =>
        o.date.includes(q) ||
        (o.notes && o.notes.toLowerCase().includes(q)) ||
        (o.vendor && o.vendor.toLowerCase().includes(q)) ||
        o.mealType.toLowerCase().includes(q) ||
        o.totalAmount.toString().includes(q)
      );
    }

    const stats = calculateStatsForOrders(filtered);
    return { orders: filtered, stats };
  }, [orders]);

  // BACKUP RESTORE
  const restoreOrdersFromBackup = useCallback((importedOrders: Order[], mode: 'merge' | 'replace') => {
    createTimestampedBackup();

    let mergedCount = 0;
    setOrders(prev => {
      if (mode === 'replace') {
        const sorted = [...importedOrders].sort((a, b) => b.date.localeCompare(a.date));
        mergedCount = sorted.length;
        return sorted;
      }

      // Merge mode: Add any orders that don't exist by date and mealType
      const existingKeySet = new Set(prev.map(o => `${o.date}-${o.mealType}`));
      const newOrdersToAdd: Order[] = [];

      importedOrders.forEach(imp => {
        const key = `${imp.date}-${imp.mealType}`;
        if (!existingKeySet.has(key)) {
          newOrdersToAdd.push(imp);
          existingKeySet.add(key);
        }
      });

      mergedCount = newOrdersToAdd.length;
      const combined = [...newOrdersToAdd, ...prev];
      combined.sort((a, b) => b.date.localeCompare(a.date));
      return combined;
    });

    showToast(`Restored ${mergedCount} orders from backup`, 'success');
    return mergedCount;
  }, [showToast]);

  // RESET ALL DATA
  const resetAllData = useCallback(() => {
    createTimestampedBackup();
    setOrders([]);
    setWalletState(DEFAULT_WALLET);
    setSettingsState(DEFAULT_SETTINGS);
    showToast('All order data has been reset. A backup was preserved.', 'info');
  }, [showToast]);

  const value = useMemo(() => ({
    orders,
    settings,
    wallet,
    isOffline,
    toast,
    showToast,
    dismissToast,
    addOrder,
    updateOrder,
    deleteOrder,
    undoLastAction,
    recordSkippedMeal,
    updateSettings,
    addWalletCredit,
    deductWallet,
    getTodayStats,
    getWeeklyStats,
    getMonthlyStats,
    getTotalStats,
    getFilteredOrders,
    restoreOrdersFromBackup,
    resetAllData
  }), [
    orders,
    settings,
    wallet,
    isOffline,
    toast,
    showToast,
    dismissToast,
    addOrder,
    updateOrder,
    deleteOrder,
    undoLastAction,
    recordSkippedMeal,
    updateSettings,
    addWalletCredit,
    deductWallet,
    getTodayStats,
    getWeeklyStats,
    getMonthlyStats,
    getTotalStats,
    getFilteredOrders,
    restoreOrdersFromBackup,
    resetAllData
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
