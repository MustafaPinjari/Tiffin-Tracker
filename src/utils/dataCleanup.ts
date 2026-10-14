// Utility to clean up localStorage data
export function cleanupOrdersData() {
  try {
    const saved = localStorage.getItem('orders');
    if (saved) {
      const orders = JSON.parse(saved);
      
      // Remove null/undefined orders and ensure all orders have valid IDs
      const cleanedOrders = orders
        .filter((order: any) => order && order.date && order.numberOfTiffins && order.totalAmount) // Remove invalid orders
        .map((order: any) => ({
          ...order,
          id: order.id || crypto.randomUUID() // Ensure ID exists
        }))
        .reduce((acc: any[], current: any) => {
          // Remove duplicates by date AND id (keep the most recent one with same date)
          const existingIndex = acc.findIndex(order => order.date === current.date && order.id === current.id);
          if (existingIndex === -1) {
            // Check if there's already an order for this date
            const dateIndex = acc.findIndex(order => order.date === current.date);
            if (dateIndex === -1) {
              // No order for this date, add it
              acc.push(current);
            } else {
              // Replace existing order for this date (keep the one with more recent timestamp or higher total)
              const existing = acc[dateIndex];
              if (!existing.timestamp || (current.timestamp && current.timestamp > existing.timestamp) || 
                  (!current.timestamp && current.totalAmount >= existing.totalAmount)) {
                acc[dateIndex] = current;
              }
            }
          }
          return acc;
        }, []);
      
      // Sort by date descending
      cleanedOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Save cleaned data back
      localStorage.setItem('orders', JSON.stringify(cleanedOrders));
      console.log('Orders data cleaned up:', cleanedOrders);
      
      return cleanedOrders;
    }
  } catch (error) {
    console.error('Error cleaning up orders data:', error);
    // Never delete orders on catch - preserve whatever exists
  }
  
  return [];
}

// Function to completely reset orders data
export function resetOrdersData() {
  localStorage.removeItem('orders');
  console.log('Orders data reset');
}