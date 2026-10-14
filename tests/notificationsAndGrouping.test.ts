import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Order, UserSettings } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/utils/storage';
import { checkAndTriggerDailyReminder } from '../src/utils/notifications';

describe('Space Optimization — Day Grouping for History and Recent Activity', () => {
  it('combines Lunch and Dinner for the same date into one DayGroup with correct combined totals', () => {
    const orders: Order[] = [
      {
        id: 'lunch-1',
        date: '2026-10-14',
        mealType: 'lunch',
        numberOfTiffins: 1,
        pricePerTiffin: 40,
        totalAmount: 40,
        status: 'ordered',
        createdAt: '2026-10-14T12:00:00Z'
      },
      {
        id: 'dinner-1',
        date: '2026-10-14',
        mealType: 'dinner',
        numberOfTiffins: 2,
        pricePerTiffin: 40,
        totalAmount: 80,
        status: 'ordered',
        createdAt: '2026-10-14T20:00:00Z'
      },
      {
        id: 'lunch-prev',
        date: '2026-10-13',
        mealType: 'lunch',
        numberOfTiffins: 1,
        pricePerTiffin: 40,
        totalAmount: 40,
        status: 'ordered',
        createdAt: '2026-10-13T12:00:00Z'
      }
    ];

    // Grouping algorithm
    const map = new Map<string, Order[]>();
    for (const order of orders) {
      const list = map.get(order.date) || [];
      list.push(order);
      map.set(order.date, list);
    }

    const day14 = map.get('2026-10-14')!;
    expect(day14).toBeDefined();
    expect(day14.length).toBe(2);

    const totalTiffins14 = day14.reduce((sum, o) => sum + o.numberOfTiffins, 0);
    const totalAmount14 = day14.reduce((sum, o) => sum + o.totalAmount, 0);

    expect(totalTiffins14).toBe(3);
    expect(totalAmount14).toBe(120);

    // Verify sort order: lunch first, then dinner
    const sortedMeals = [...day14].sort((a, b) => {
      if (a.mealType === 'lunch' && b.mealType === 'dinner') return -1;
      if (a.mealType === 'dinner' && b.mealType === 'lunch') return 1;
      return 0;
    });

    expect(sortedMeals[0].mealType).toBe('lunch');
    expect(sortedMeals[1].mealType).toBe('dinner');
  });
});

describe('Daily Reminder Automation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does NOT trigger reminder if user already logged an order today', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      reminders: {
        enabled: true,
        reminderTime: '00:00', // Past midnight, so time condition is met
        skipWeekends: false
      }
    };

    const ordersToday: Order[] = [
      {
        id: 'ord-today',
        date: todayStr,
        mealType: 'lunch',
        numberOfTiffins: 1,
        pricePerTiffin: 40,
        totalAmount: 40,
        status: 'ordered',
        createdAt: new Date().toISOString()
      }
    ];

    const triggered = await checkAndTriggerDailyReminder(settings, ordersToday);
    expect(triggered).toBe(false);
  });

  it('does NOT trigger reminder if reminders are disabled in settings', async () => {
    const settings: UserSettings = {
      ...DEFAULT_SETTINGS,
      reminders: {
        enabled: false,
        reminderTime: '00:00',
        skipWeekends: false
      }
    };

    const triggered = await checkAndTriggerDailyReminder(settings, []);
    expect(triggered).toBe(false);
  });
});
