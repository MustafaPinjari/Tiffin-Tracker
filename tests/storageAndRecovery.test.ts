import { describe, it, expect, beforeEach } from 'vitest';
import { generateId } from '../src/utils/id';
import {
  loadOrdersSafely,
  saveOrdersSafely,
  createTimestampedBackup,
  DEFAULT_SETTINGS
} from '../src/utils/storage';
import { parseAndValidateBackupJSON } from '../src/utils/exportImport';
import { Order } from '../src/types';

describe('Storage Resilience and Recovery', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates unique IDs with fallback when crypto.randomUUID is not available', () => {
    const originalCrypto = globalThis.crypto;
    try {
      // Simulate insecure context or older mobile browser without randomUUID
      // @ts-ignore
      delete globalThis.crypto;

      const id1 = generateId();
      const id2 = generateId();

      expect(typeof id1).toBe('string');
      expect(id1.startsWith('tiffin-')).toBe(true);
      expect(id1).not.toBe(id2);
    } finally {
      globalThis.crypto = originalCrypto;
    }
  });

  it('preserves emergency raw backup and does NOT delete storage on malformed JSON', () => {
    const corruptedJSON = '{"invalid_json_format_without_bracket:';
    localStorage.setItem('orders', corruptedJSON);

    // loadOrdersSafely should catch the syntax error gracefully
    const orders = loadOrdersSafely();
    expect(orders).toEqual([]);

    // The corrupted string must be preserved in an emergency backup key
    let foundEmergencyBackup = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('orders_corrupted_raw_')) {
        foundEmergencyBackup = true;
        expect(localStorage.getItem(key)).toBe(corruptedJSON);
      }
    }
    expect(foundEmergencyBackup).toBe(true);
  });

  it('creates timestamped backups without altering active data', () => {
    const testOrders: Order[] = [
      {
        id: 'ord-1',
        date: '2026-10-14',
        mealType: 'single',
        numberOfTiffins: 2,
        pricePerTiffin: 40,
        totalAmount: 80,
        status: 'ordered',
        createdAt: '2026-10-14T12:00:00Z'
      }
    ];

    saveOrdersSafely(testOrders);
    const backupKey = createTimestampedBackup();

    expect(backupKey).toBeTruthy();
    expect(backupKey?.startsWith('orders_backup_')).toBe(true);

    const backupContent = localStorage.getItem(backupKey!);
    expect(backupContent).toBeTruthy();
    expect(JSON.parse(backupContent!).length).toBe(1);

    // Active orders still intact
    const loaded = loadOrdersSafely();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('ord-1');
  });

  it('validates imported JSON backup files and parses valid records', () => {
    const validBackup = JSON.stringify({
      version: '2.0.0',
      exportedAt: '2026-10-14T12:00:00Z',
      orders: [
        {
          id: 'imp-1',
          date: '2026-10-10',
          mealType: 'single',
          numberOfTiffins: 1,
          pricePerTiffin: 40,
          totalAmount: 40,
          status: 'ordered',
          createdAt: '2026-10-10T12:00:00Z'
        }
      ]
    });

    const result = parseAndValidateBackupJSON(validBackup);
    expect(result.valid).toBe(true);
    expect(result.ordersCount).toBe(1);
    expect(result.parsedOrders?.[0].id).toBe('imp-1');

    // Invalid JSON
    const invalidResult = parseAndValidateBackupJSON('{bad json');
    expect(invalidResult.valid).toBe(false);
  });
});
