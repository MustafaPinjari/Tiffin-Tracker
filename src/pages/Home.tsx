import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ChartBarIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useOrders } from '../context/OrderContext';
import { motion } from 'framer-motion';
import { Toast } from '../components/Toast';
import { UnifiedOrderManager } from '../components/UnifiedOrderManager';
import { ManageTiffin } from '../components/ManageTiffin';
import { notificationService } from '../services/notificationService';
import { Card, Button, Heading1, BodyText } from '../components/ui';
import { animations } from '../utils/animations';

export function Home() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showManageTiffin, setShowManageTiffin] = useState(false);
  const { getTodayStats, getMonthlyStats, getAllOrders } = useOrders();
  const todayStats = getTodayStats();
  const monthlyStats = getMonthlyStats(format(new Date(), 'yyyy-MM'));
  const allOrders = getAllOrders();

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize();
  }, []);

  // Calculate weekly stats
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weeklyOrders = allOrders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate >= weekStart && orderDate <= weekEnd;
  });
  const weeklyStats = {
    orders: weeklyOrders.length,
    tiffins: weeklyOrders.reduce((sum, order) => sum + order.numberOfTiffins, 0),
    amount: weeklyOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  const handleOrderPlaced = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleOrderDeleted = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Toast Notification */}
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
      />

      {/* Status Bar Simulation */}
      <div className="h-11 bg-black flex items-center justify-center">
        <div className="text-white text-sm font-medium">
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
        </div>
      </div>

      <div className="px-4 pb-28">
        {/* Header with Manage Tiffin Button */}
        <motion.div 
          {...animations.fadeInUp}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <Heading1 className="mb-1">
              Tiffin Tracker
            </Heading1>
            <BodyText>
              {format(new Date(), 'EEEE, MMMM d')}
            </BodyText>
          </div>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Cog6ToothIcon className="w-4 h-4" />}
            onClick={() => setShowManageTiffin(true)}
          >
            Manage
          </Button>
        </motion.div>

        {/* Unified Order Manager */}
        <UnifiedOrderManager onOrderPlaced={handleOrderPlaced} />

        {/* Quick Stats */}
        <motion.div 
          {...animations.fadeInUp}
          transition={{ ...animations.fadeInUp.transition, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <Card padding="md" hover>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{todayStats.orders}</div>
              <div className="text-gray-400 text-xs">Today's Orders</div>
            </div>
          </Card>
          <Card padding="md" hover>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{todayStats.tiffins}</div>
              <div className="text-gray-400 text-xs">Tiffins</div>
            </div>
          </Card>
          <Card padding="md" hover>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">₹{todayStats.amount}</div>
              <div className="text-gray-400 text-xs">Spent</div>
            </div>
          </Card>
        </motion.div>

        {/* Weekly & Monthly Overview */}
        <motion.div 
          {...animations.staggerContainer}
          className="space-y-4"
        >
          {/* This Week */}
          <motion.div {...animations.staggerItem}>
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-white">This Week</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{weeklyStats.orders}</div>
                  <div className="text-gray-400 text-xs">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{weeklyStats.tiffins}</div>
                  <div className="text-gray-400 text-xs">Tiffins</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">₹{weeklyStats.amount}</div>
                  <div className="text-gray-400 text-xs">Spent</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* This Month */}
          <motion.div {...animations.staggerItem}>
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <ChartBarIcon className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold text-white">This Month</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{monthlyStats.totalOrders}</div>
                  <div className="text-gray-400 text-xs">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{monthlyStats.totalTiffins}</div>
                  <div className="text-gray-400 text-xs">Tiffins</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">₹{monthlyStats.totalAmount}</div>
                  <div className="text-gray-400 text-xs">Spent</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Manage Tiffin Modal */}
        <ManageTiffin 
          isOpen={showManageTiffin}
          onClose={() => setShowManageTiffin(false)}
          onOrderDeleted={handleOrderDeleted}
        />
      </div>
    </div>
  );
}