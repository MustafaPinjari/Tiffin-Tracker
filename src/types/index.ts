export type MealType = 'single' | 'lunch' | 'dinner' | 'other';
export type MealStatus = 'ordered' | 'skipped' | 'cancelled';

export interface Order {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  numberOfTiffins: number;
  pricePerTiffin: number; // Historical/configured unit price at time of order
  totalAmount: number; // numberOfTiffins * pricePerTiffin
  status: MealStatus;
  notes?: string;
  vendor?: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}

export type OrderInput = {
  date: string;
  mealType?: MealType;
  numberOfTiffins: number;
  pricePerTiffin?: number;
  status?: MealStatus;
  notes?: string;
  vendor?: string;
};

export interface ReminderSettings {
  enabled: boolean;
  reminderTime: string; // HH:MM (24-hour format)
  skipWeekends: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UserSettings {
  defaultPrice: number;
  currency: string;
  currencySymbol: string;
  trackingMode: 'single' | 'detailed'; // single = 1 order per day; detailed = lunch & dinner
  monthlyBudget: number; // 0 = disabled
  budgetAlertThreshold: number; // percentage, e.g. 80
  theme: 'dark' | 'light' | 'system';
  accentColor: 'blue' | 'emerald' | 'violet' | 'amber';
  gamificationEnabled: boolean;
  walletEnabled: boolean;
  reminders: ReminderSettings;
}

export interface WalletTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  orderId?: string;
  timestamp: number;
}

export interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DailyExpenseSummary {
  date: string;
  orders: Order[];
  totalTiffins: number;
  totalAmount: number;
  status: 'ordered' | 'skipped' | 'none';
}

export interface PeriodStats {
  totalOrders: number;
  totalTiffins: number;
  totalAmount: number;
  averagePerMeal: number;
  averageDailySpend: number;
  skippedDays: number;
  activeDays: number;
}
