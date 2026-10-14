import { Order, PeriodStats } from '../types';

/**
 * Calculates order total with proper 2-decimal rounding.
 */
export function calculateOrderTotal(quantity: number, unitPrice: number): number {
  if (!quantity || quantity <= 0) return 0;
  if (!unitPrice || unitPrice < 0) return 0;
  return Math.round(quantity * unitPrice * 100) / 100;
}

/**
 * Formats a currency amount with symbol (defaults to ₹) and sensible decimals.
 */
export function formatCurrency(amount: number, symbol = '₹'): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  // If amount has decimal parts, show 2 decimals; otherwise show integer
  const formatted = safeAmount % 1 !== 0 
    ? safeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : safeAmount.toLocaleString('en-IN');
  return `${symbol}${formatted}`;
}

/**
 * Calculates aggregate statistics for an array of orders.
 */
export function calculateStatsForOrders(orders: Order[]): PeriodStats {
  const activeOrders = orders.filter(o => o.status === 'ordered');
  const skippedOrders = orders.filter(o => o.status === 'skipped');

  const totalOrders = activeOrders.length;
  const totalTiffins = activeOrders.reduce((sum, o) => sum + (o.numberOfTiffins || 0), 0);
  const totalAmount = Math.round(activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) * 100) / 100;

  // Set of unique active dates
  const activeDates = new Set(activeOrders.map(o => o.date));
  const activeDays = activeDates.size;

  const averagePerMeal = totalOrders > 0 ? Math.round((totalAmount / totalOrders) * 100) / 100 : 0;
  const averageDailySpend = activeDays > 0 ? Math.round((totalAmount / activeDays) * 100) / 100 : 0;

  return {
    totalOrders,
    totalTiffins,
    totalAmount,
    averagePerMeal,
    averageDailySpend,
    skippedDays: skippedOrders.length,
    activeDays
  };
}

/**
 * Projects monthly spending based on recorded month-to-date pace.
 */
export function projectMonthlySpend(
  monthTotalAmount: number,
  currentDayOfMonth: number,
  totalDaysInMonth: number
): { projectedTotal: number; dailyPace: number } {
  if (currentDayOfMonth <= 0 || totalDaysInMonth <= 0) {
    return { projectedTotal: monthTotalAmount, dailyPace: 0 };
  }

  const dailyPace = monthTotalAmount / currentDayOfMonth;
  const projectedTotal = Math.round(dailyPace * totalDaysInMonth * 100) / 100;

  return { projectedTotal, dailyPace: Math.round(dailyPace * 100) / 100 };
}

/**
 * Calculates budget utilization and remaining amount.
 */
export function calculateBudgetStatus(
  spent: number,
  budget: number,
  alertThresholdPercent = 80
): {
  spent: number;
  budget: number;
  remaining: number;
  utilizationPercent: number;
  isOverBudget: boolean;
  isNearThreshold: boolean;
} {
  if (!budget || budget <= 0) {
    return {
      spent,
      budget: 0,
      remaining: 0,
      utilizationPercent: 0,
      isOverBudget: false,
      isNearThreshold: false
    };
  }

  const utilizationPercent = Math.min(Math.round((spent / budget) * 100), 999);
  const remaining = Math.round((budget - spent) * 100) / 100;
  const isOverBudget = spent > budget;
  const isNearThreshold = utilizationPercent >= alertThresholdPercent && !isOverBudget;

  return {
    spent,
    budget,
    remaining,
    utilizationPercent,
    isOverBudget,
    isNearThreshold
  };
}
