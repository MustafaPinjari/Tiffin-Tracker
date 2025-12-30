// Utility to clean up localStorage data
export function cleanupOrdersData() {
  try {
    const saved = localStorage.getItem('orders');
    if (saved) {
      const orders = JSON.parse(saved);
      
      // Remove duplicates and ensure all orders have valid IDs
      const cleanedOrders = orders
        .filter((order: any) => order && order.date) // Remove null/undefined orders
        .map((order: any) => ({
          ...order,
          id: order.id || crypto.randomUUID() // Ensure ID exists
        }))
        .reduce((acc: any[], current: any) => {
          // Remove duplicates by date (keep the first one)
          const existingIndex = acc.findIndex(order => order.date === current.date);
          if (existingIndex === -1) {
            acc.push(current);
          }
          return acc;
        }, []);
      
      // Save cleaned data back
      localStorage.setItem('orders', JSON.stringify(cleanedOrders));
      console.log('Orders data cleaned up:', cleanedOrders);
      
      return cleanedOrders;
    }
  } catch (error) {
    console.error('Error cleaning up orders data:', error);
    // If there's an error, clear the localStorage
    localStorage.removeItem('orders');
  }
  
  return [];
}

// Function to completely reset orders data
export function resetOrdersData() {
  localStorage.removeItem('orders');
  console.log('Orders data reset');
}