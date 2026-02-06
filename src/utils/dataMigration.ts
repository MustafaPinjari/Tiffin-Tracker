// Data migration utility for existing users
export function migrateExistingData() {
  try {
    const saved = localStorage.getItem('orders');
    if (!saved) {
      console.log('No existing data to migrate');
      return [];
    }

    const orders = JSON.parse(saved);
    console.log('Starting data migration for', orders.length, 'orders');

    // Migrate old data structure to new format
    const migratedOrders = orders
      .filter((order: any) => {
        // Keep orders that have essential data
        return order && 
               order.date && 
               (order.numberOfTiffins || order.numberOfTiffins === 0) && 
               (order.totalAmount || order.totalAmount === 0);
      })
      .map((order: any, index: number) => {
        // Ensure all required fields exist
        const migratedOrder = {
          id: order.id || crypto.randomUUID(),
          date: order.date,
          numberOfTiffins: order.numberOfTiffins || 1,
          pricePerTiffin: order.pricePerTiffin || (order.totalAmount / (order.numberOfTiffins || 1)) || 40,
          totalAmount: order.totalAmount || (order.numberOfTiffins * order.pricePerTiffin) || 40,
          // Add timestamp for better sorting if it doesn't exist
          timestamp: order.timestamp || Date.now() - (orders.length - index) * 1000
        };

        // Validate the migrated order
        if (migratedOrder.totalAmount !== migratedOrder.numberOfTiffins * migratedOrder.pricePerTiffin) {
          // Fix calculation inconsistencies
          migratedOrder.totalAmount = migratedOrder.numberOfTiffins * migratedOrder.pricePerTiffin;
        }

        return migratedOrder;
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

    // Remove exact duplicates (same date, same amount)
    const uniqueOrders = migratedOrders.reduce((acc: any[], current: any) => {
      const duplicate = acc.find(order => 
        order.date === current.date && 
        order.totalAmount === current.totalAmount &&
        order.numberOfTiffins === current.numberOfTiffins
      );
      
      if (!duplicate) {
        acc.push(current);
      }
      
      return acc;
    }, []);

    // Save migrated data
    localStorage.setItem('orders', JSON.stringify(uniqueOrders));
    
    console.log('Data migration completed:');
    console.log('- Original orders:', orders.length);
    console.log('- Migrated orders:', uniqueOrders.length);
    console.log('- Removed duplicates/invalid:', orders.length - uniqueOrders.length);
    
    return uniqueOrders;
  } catch (error) {
    console.error('Error during data migration:', error);
    return [];
  }
}

// Function to check if migration is needed
export function needsMigration() {
  try {
    const saved = localStorage.getItem('orders');
    if (!saved) return false;

    const orders = JSON.parse(saved);
    
    // Check if any orders are missing IDs or have invalid structure
    const needsMigration = orders.some((order: any) => 
      !order.id || 
      typeof order.numberOfTiffins !== 'number' ||
      typeof order.totalAmount !== 'number' ||
      !order.date
    );

    return needsMigration;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return true; // If we can't parse, we probably need migration
  }
}

// Function to backup existing data before migration
export function backupExistingData() {
  try {
    const saved = localStorage.getItem('orders');
    if (saved) {
      const timestamp = new Date().toISOString();
      localStorage.setItem(`orders_backup_${timestamp}`, saved);
      console.log('Data backed up with timestamp:', timestamp);
      return timestamp;
    }
  } catch (error) {
    console.error('Error backing up data:', error);
  }
  return null;
}

// Function to restore from backup
export function restoreFromBackup(backupKey: string) {
  try {
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      localStorage.setItem('orders', backup);
      console.log('Data restored from backup:', backupKey);
      return true;
    }
  } catch (error) {
    console.error('Error restoring from backup:', error);
  }
  return false;
}