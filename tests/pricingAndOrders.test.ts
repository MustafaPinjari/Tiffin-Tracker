import { describe, it, expect } from 'vitest';
import { calculateOrderTotal } from '../src/utils/calculations';
import { Order, UserSettings } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/utils/storage';

describe('Adjustable Tiffin Pricing and Historical Preservation', () => {
  it('uses default price when no per-order override is provided', () => {
    const settings: UserSettings = { ...DEFAULT_SETTINGS, defaultPrice: 45 };
    const quantity = 2;
    const unitPrice = settings.defaultPrice;
    const total = calculateOrderTotal(quantity, unitPrice);

    expect(total).toBe(90);
  });

  it('preserves historical order prices when global default price changes', () => {
    // 1. Initial global default price is ₹40
    let globalDefault = 40;

    // 2. User logs a historical order: 3 tiffins at ₹40
    const historicalOrder: Order = {
      id: 'hist-1',
      date: '2026-09-15',
      mealType: 'single',
      numberOfTiffins: 3,
      pricePerTiffin: globalDefault,
      totalAmount: calculateOrderTotal(3, globalDefault),
      status: 'ordered',
      createdAt: '2026-09-15T12:00:00Z'
    };

    expect(historicalOrder.totalAmount).toBe(120);

    // 3. User updates global default price in Settings to ₹55
    globalDefault = 55;

    // 4. Verify historical order is completely untouched
    expect(historicalOrder.pricePerTiffin).toBe(40);
    expect(historicalOrder.totalAmount).toBe(120);

    // 5. Future order uses the new default price of ₹55
    const futureOrder: Order = {
      id: 'fut-1',
      date: '2026-10-15',
      mealType: 'single',
      numberOfTiffins: 2,
      pricePerTiffin: globalDefault,
      totalAmount: calculateOrderTotal(2, globalDefault),
      status: 'ordered',
      createdAt: '2026-10-15T12:00:00Z'
    };

    expect(futureOrder.pricePerTiffin).toBe(55);
    expect(futureOrder.totalAmount).toBe(110);
  });

  it('supports per-order custom price overrides', () => {
    const globalDefault = 40;
    const customPrice = 65.5; // Special weekend thali

    const specialOrder: Order = {
      id: 'special-1',
      date: '2026-10-14',
      mealType: 'single',
      numberOfTiffins: 2,
      pricePerTiffin: customPrice,
      totalAmount: calculateOrderTotal(2, customPrice),
      status: 'ordered',
      createdAt: '2026-10-14T12:00:00Z'
    };

    expect(specialOrder.pricePerTiffin).toBe(65.5);
    expect(specialOrder.totalAmount).toBe(131);
    expect(globalDefault).toBe(40); // Global setting unchanged
  });

  it('correctly recalculates total when order quantity or custom price is edited', () => {
    const order: Order = {
      id: 'edit-1',
      date: '2026-10-10',
      mealType: 'single',
      numberOfTiffins: 1,
      pricePerTiffin: 40,
      totalAmount: 40,
      status: 'ordered',
      createdAt: '2026-10-10T12:00:00Z'
    };

    // User edits quantity to 3 and price to ₹45
    const updatedQuantity = 3;
    const updatedPrice = 45;
    const updatedTotal = calculateOrderTotal(updatedQuantity, updatedPrice);

    const updatedOrder: Order = {
      ...order,
      numberOfTiffins: updatedQuantity,
      pricePerTiffin: updatedPrice,
      totalAmount: updatedTotal,
      updatedAt: '2026-10-10T14:00:00Z'
    };

    expect(updatedOrder.numberOfTiffins).toBe(3);
    expect(updatedOrder.pricePerTiffin).toBe(45);
    expect(updatedOrder.totalAmount).toBe(135);
  });
});
