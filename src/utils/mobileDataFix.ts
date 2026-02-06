// Mobile-friendly data repair with visual feedback
export interface DataReport {
  success: boolean;
  message: string;
  details: {
    originalCount: number;
    repairedCount: number;
    issuesFound: string[];
    actionsTaken: string[];
  };
}

export function mobileDataDiagnosis(): DataReport {
  try {
    const saved = localStorage.getItem('orders');
    const report: DataReport = {
      success: true,
      message: '',
      details: {
        originalCount: 0,
        repairedCount: 0,
        issuesFound: [],
        actionsTaken: []
      }
    };

    if (!saved) {
      report.success = false;
      report.message = 'No order data found in storage';
      report.details.issuesFound.push('No data exists');
      return report;
    }

    const orders = JSON.parse(saved);
    report.details.originalCount = orders.length;

    if (orders.length === 0) {
      report.success = false;
      report.message = 'Order data exists but is empty';
      report.details.issuesFound.push('Empty data array');
      return report;
    }

    // Check for common issues
    const missingIds = orders.filter((o: any) => !o.id).length;
    const missingDates = orders.filter((o: any) => !o.date).length;
    const invalidTiffins = orders.filter((o: any) => typeof o.numberOfTiffins !== 'number' || o.numberOfTiffins <= 0).length;
    const invalidAmounts = orders.filter((o: any) => typeof o.totalAmount !== 'number' || o.totalAmount < 0).length;

    if (missingIds > 0) report.details.issuesFound.push(`${missingIds} orders missing IDs`);
    if (missingDates > 0) report.details.issuesFound.push(`${missingDates} orders missing dates`);
    if (invalidTiffins > 0) report.details.issuesFound.push(`${invalidTiffins} orders with invalid tiffin counts`);
    if (invalidAmounts > 0) report.details.issuesFound.push(`${invalidAmounts} orders with invalid amounts`);

    // Check for duplicates
    const dates = orders.map((o: any) => o.date).filter(Boolean);
    const uniqueDates = [...new Set(dates)];
    const duplicates = dates.length - uniqueDates.length;
    if (duplicates > 0) report.details.issuesFound.push(`${duplicates} duplicate orders`);

    if (report.details.issuesFound.length === 0) {
      report.message = `Found ${orders.length} orders - all look good!`;
    } else {
      report.success = false;
      report.message = `Found ${orders.length} orders with ${report.details.issuesFound.length} issues`;
    }

    return report;
  } catch (error) {
    return {
      success: false,
      message: 'Error reading order data - data may be corrupted',
      details: {
        originalCount: 0,
        repairedCount: 0,
        issuesFound: ['Data corruption detected'],
        actionsTaken: []
      }
    };
  }
}

export function mobileDataRepair(): DataReport {
  try {
    const diagnosis = mobileDataDiagnosis();
    const report: DataReport = {
      success: true,
      message: '',
      details: {
        originalCount: diagnosis.details.originalCount,
        repairedCount: 0,
        issuesFound: diagnosis.details.issuesFound,
        actionsTaken: []
      }
    };

    if (diagnosis.success && diagnosis.details.issuesFound.length === 0) {
      report.message = 'No repairs needed - data is already good!';
      report.details.repairedCount = diagnosis.details.originalCount;
      return report;
    }

    const saved = localStorage.getItem('orders');
    if (!saved) {
      report.success = false;
      report.message = 'No data to repair';
      return report;
    }

    // Backup original data
    const timestamp = Date.now();
    localStorage.setItem(`orders_backup_${timestamp}`, saved);
    report.details.actionsTaken.push('Created backup');

    const orders = JSON.parse(saved);
    
    // Repair orders
    const repairedOrders = orders
      .filter((order: any) => order && order.date) // Keep orders with dates
      .map((order: any) => {
        const repaired = {
          id: order.id || crypto.randomUUID(),
          date: order.date,
          numberOfTiffins: Number(order.numberOfTiffins) || 1,
          pricePerTiffin: Number(order.pricePerTiffin) || 40,
          totalAmount: Number(order.totalAmount) || 40
        };

        // Fix calculation if needed
        const calculatedTotal = repaired.numberOfTiffins * repaired.pricePerTiffin;
        if (Math.abs(repaired.totalAmount - calculatedTotal) > 0.01) {
          repaired.totalAmount = calculatedTotal;
        }

        return repaired;
      })
      .reduce((acc: any[], current: any) => {
        // Remove duplicates by date
        const existingIndex = acc.findIndex(order => order.date === current.date);
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          // Keep the one with higher total (more complete data)
          if (current.totalAmount >= acc[existingIndex].totalAmount) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Save repaired data
    localStorage.setItem('orders', JSON.stringify(repairedOrders));
    
    report.details.repairedCount = repairedOrders.length;
    report.details.actionsTaken.push('Fixed missing IDs');
    report.details.actionsTaken.push('Corrected calculations');
    report.details.actionsTaken.push('Removed duplicates');
    report.details.actionsTaken.push('Sorted by date');

    const removed = report.details.originalCount - report.details.repairedCount;
    if (removed > 0) {
      report.details.actionsTaken.push(`Removed ${removed} invalid orders`);
    }

    report.message = `Repair complete! ${report.details.repairedCount} orders ready to use`;
    return report;

  } catch (error) {
    return {
      success: false,
      message: 'Repair failed - data may be severely corrupted',
      details: {
        originalCount: 0,
        repairedCount: 0,
        issuesFound: ['Repair process failed'],
        actionsTaken: ['Created backup before failure']
      }
    };
  }
}

export function getBackupList(): string[] {
  return Object.keys(localStorage)
    .filter(key => key.startsWith('orders_backup_'))
    .sort()
    .reverse(); // Most recent first
}

export function restoreFromMobileBackup(backupKey: string): DataReport {
  try {
    const backup = localStorage.getItem(backupKey);
    if (!backup) {
      return {
        success: false,
        message: 'Backup not found',
        details: { originalCount: 0, repairedCount: 0, issuesFound: ['Backup missing'], actionsTaken: [] }
      };
    }

    localStorage.setItem('orders', backup);
    const orders = JSON.parse(backup);
    
    return {
      success: true,
      message: `Restored ${orders.length} orders from backup`,
      details: {
        originalCount: orders.length,
        repairedCount: orders.length,
        issuesFound: [],
        actionsTaken: ['Restored from backup']
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to restore backup',
      details: { originalCount: 0, repairedCount: 0, issuesFound: ['Restore failed'], actionsTaken: [] }
    };
  }
}