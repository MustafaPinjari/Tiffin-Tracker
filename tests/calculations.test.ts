import { describe, it, expect } from 'vitest';
import {
  calculateOrderTotal,
  formatCurrency,
  calculateStatsForOrders,
  calculateBudgetStatus,
  projectMonthlySpend
} from '../src/utils/calculations';
import { Order } from '../src/types';

describe('Financial and Order Calculations', () => {
  it('calculates order total with 2-decimal accuracy', () => {
    expect(calculateOrderTotal(2, 40)).toBe(80);
    expect(calculateOrderTotal(3, 45.5)).toBe(136.5);
    expect(calculateOrderTotal(1, 0)).toBe(0);
    expect(calculateOrderTotal(0, 50)).toBe(0);
    expect(calculateOrderTotal(-1, 50)).toBe(0);
  });

  it('formats currency correctly in Indian numbering system', () => {
    expect(formatCurrency(80)).toBe('₹80');
    expect(formatCurrency(1250)).toBe('₹1,250');
    expect(formatCurrency(45.5)).toBe('₹45.50');
  });

  it('calculates aggregate stats for orders correctly', () => {
    const orders: Order[] = [
      {
        id: '1',
        date: '2026-10-01',
        mealType: 'single',
        numberOfTiffins: 2,
        pricePerTiffin: 40,
        totalAmount: 80,
        status: 'ordered',
        createdAt: '2026-10-01T12:00:00Z'
      },
      {
        id: '2',
        date: '2026-10-02',
        mealType: 'single',
        numberOfTiffins: 1,
        pricePerTiffin: 50,
        totalAmount: 50,
        status: 'ordered',
        createdAt: '2026-10-02T12:00:00Z'
      },
      {
        id: '3',
        date: '2026-10-03',
        mealType: 'single',
        numberOfTiffins: 0,
        pricePerTiffin: 0,
        totalAmount: 0,
        status: 'skipped',
        createdAt: '2026-10-03T12:00:00Z'
      }
    ];

    const stats = calculateStatsForOrders(orders);
    expect(stats.totalOrders).toBe(2);
    expect(stats.totalTiffins).toBe(3);
    expect(stats.totalAmount).toBe(130);
    expect(stats.averagePerMeal).toBe(65);
    expect(stats.activeDays).toBe(2);
    expect(stats.skippedDays).toBe(1);
  });

  it('calculates budget utilization, remaining, and alert thresholds', () => {
    // Under budget, below 80%
    const status1 = calculateBudgetStatus(500, 1000, 80);
    expect(status1.remaining).toBe(500);
    expect(status1.utilizationPercent).toBe(50);
    expect(status1.isOverBudget).toBe(false);
    expect(status1.isNearThreshold).toBe(false);

    // Near threshold (85%)
    const status2 = calculateBudgetStatus(850, 1000, 80);
    expect(status2.utilizationPercent).toBe(85);
    expect(status2.isNearThreshold).toBe(true);
    expect(status2.isOverBudget).toBe(false);

    // Over budget
    const status3 = calculateBudgetStatus(1200, 1000, 80);
    expect(status3.remaining).toBe(-200);
    expect(status3.isOverBudget).toBe(true);
    expect(status3.isNearThreshold).toBe(false);
  });

  it('projects monthly spending based on day-of-month pace', () => {
    // On day 10 of a 30-day month with ₹1000 spent: pace is ₹100/day, projection is ₹3000
    const projection = projectMonthlySpend(1000, 10, 30);
    expect(projection.dailyPace).toBe(100);
    expect(projection.projectedTotal).toBe(3000);
  });
});
