// Debug utility to inspect order data
export function debugOrdersData() {
  try {
    const saved = localStorage.getItem('orders');
    if (saved) {
      const orders = JSON.parse(saved);
      console.log('=== ORDER DATA DEBUG ===');
      console.log('Total orders in localStorage:', orders.length);
      console.log('Raw data:', orders);
      
      // Check for invalid orders
      const invalidOrders = orders.filter((order: any) => !order || !order.date || !order.id);
      if (invalidOrders.length > 0) {
        console.log('Invalid orders found:', invalidOrders);
      }
      
      // Check for duplicates
      const dates = orders.map((order: any) => order.date);
      const duplicateDates = dates.filter((date: string, index: number) => dates.indexOf(date) !== index);
      if (duplicateDates.length > 0) {
        console.log('Duplicate dates found:', duplicateDates);
      }
      
      // Group by month
      const byMonth = orders.reduce((acc: any, order: any) => {
        const month = order.date.substring(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = [];
        acc[month].push(order);
        return acc;
      }, {});
      
      console.log('Orders by month:', byMonth);
      console.log('=== END DEBUG ===');
      
      return {
        total: orders.length,
        invalid: invalidOrders.length,
        duplicates: duplicateDates.length,
        byMonth
      };
    } else {
      console.log('No orders data found in localStorage');
      return { total: 0, invalid: 0, duplicates: 0, byMonth: {} };
    }
  } catch (error) {
    console.error('Error debugging orders data:', error);
    return null;
  }
}

// Function to manually trigger data cleanup
export function forceCleanupOrders() {
  const { cleanupOrdersData } = require('./dataCleanup');
  return cleanupOrdersData();
}