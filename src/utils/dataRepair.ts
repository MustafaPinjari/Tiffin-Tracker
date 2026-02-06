// Comprehensive data repair utility for users with corrupted data
export function repairOrdersData() {
  try {
    console.log('Starting comprehensive data repair...');
    
    // Get all possible data sources
    const mainData = localStorage.getItem('orders');
    const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('orders_backup_'));
    
    let allOrders: any[] = [];
    
    // Parse main data
    if (mainData) {
      try {
        const parsed = JSON.parse(mainData);
        if (Array.isArray(parsed)) {
          allOrders = [...allOrders, ...parsed];
        }
      } catch (e) {
        console.warn('Main orders data is corrupted');
      }
    }
    
    // Parse backup data
    backupKeys.forEach(key => {
      try {
        const backup = localStorage.getItem(key);
        if (backup) {
          const parsed = JSON.parse(backup);
          if (Array.isArray(parsed)) {
            allOrders = [...allOrders, ...parsed];
          }
        }
      } catch (e) {
        console.warn(`Backup ${key} is corrupted`);
      }
    });
    
    console.log('Found', allOrders.length, 'total orders from all sources');
    
    // Repair and deduplicate orders
    const repairedOrders = allOrders
      .filter(order => {
        // Keep orders that have at least a date
        return order && order.date;
      })
      .map(order => {
        // Repair missing or invalid fields
        const repaired = {
          id: order.id || crypto.randomUUID(),
          date: order.date,
          numberOfTiffins: Number(order.numberOfTiffins) || 1,
          pricePerTiffin: Number(order.pricePerTiffin) || 40,
          totalAmount: Number(order.totalAmount) || 40
        };
        
        // Fix calculation if inconsistent
        const calculatedTotal = repaired.numberOfTiffins * repaired.pricePerTiffin;
        if (Math.abs(repaired.totalAmount - calculatedTotal) > 0.01) {
          // If total doesn't match calculation, recalculate
          repaired.totalAmount = calculatedTotal;
        }
        
        return repaired;
      })
      .reduce((acc: any[], current: any) => {
        // Remove duplicates - keep the one with the most recent data or highest total
        const existingIndex = acc.findIndex(order => order.date === current.date);
        
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          const existing = acc[existingIndex];
          // Keep the order with higher total amount (assuming it's more complete)
          if (current.totalAmount > existing.totalAmount || 
              (current.totalAmount === existing.totalAmount && current.numberOfTiffins > existing.numberOfTiffins)) {
            acc[existingIndex] = current;
          }
        }
        
        return acc;
      }, [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Save repaired data
    localStorage.setItem('orders', JSON.stringify(repairedOrders));
    
    console.log('Data repair completed:');
    console.log('- Total orders found:', allOrders.length);
    console.log('- Repaired orders:', repairedOrders.length);
    console.log('- Removed/merged:', allOrders.length - repairedOrders.length);
    
    // Create a repair report
    const report = {
      timestamp: new Date().toISOString(),
      originalCount: allOrders.length,
      repairedCount: repairedOrders.length,
      removedCount: allOrders.length - repairedOrders.length,
      backupsFound: backupKeys.length
    };
    
    localStorage.setItem('repair_report', JSON.stringify(report));
    
    return repairedOrders;
  } catch (error) {
    console.error('Error during data repair:', error);
    return [];
  }
}

// Function to get repair report
export function getRepairReport() {
  try {
    const report = localStorage.getItem('repair_report');
    return report ? JSON.parse(report) : null;
  } catch (error) {
    console.error('Error getting repair report:', error);
    return null;
  }
}

// Function to completely reset and start fresh (last resort)
export function resetAllData() {
  const confirmation = window.confirm(
    'This will delete ALL order data permanently. Are you sure you want to continue?'
  );
  
  if (confirmation) {
    // Remove all order-related data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('orders') || key.includes('repair')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All order data has been reset');
    window.location.reload();
  }
}