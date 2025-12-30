import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, isToday } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { notificationService, TiffinStatus } from '../services/notificationService';

export function DailyStatusTracker() {
  const [todayStatus, setTodayStatus] = useState<TiffinStatus>(notificationService.getTodayStatus());
  const [recentHistory, setRecentHistory] = useState<TiffinStatus[]>([]);
  const [stats, setStats] = useState(notificationService.getNotificationStats());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTodayStatus(notificationService.getTodayStatus());
    setStats(notificationService.getNotificationStats());
    
    // Get last 7 days of history
    const history: TiffinStatus[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const status = notificationService.getTiffinStatus(date) || {
        date,
        status: 'pending' as const,
        timestamp: Date.now(),
        reminderSent: false
      };
      history.push(status);
    }
    setRecentHistory(history);
  };

  const handleStatusUpdate = (status: 'ordered' | 'skipped') => {
    const today = format(new Date(), 'yyyy-MM-dd');
    notificationService.updateTiffinStatus(today, status);
    loadData(); // Refresh data
  };

  const getStatusIcon = (status: TiffinStatus['status']) => {
    switch (status) {
      case 'ordered':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'skipped':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: TiffinStatus['status']) => {
    switch (status) {
      case 'ordered':
        return 'bg-green-500/20 border-green-500/30';
      case 'skipped':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusText = (status: TiffinStatus['status']) => {
    switch (status) {
      case 'ordered':
        return 'Ordered';
      case 'skipped':
        return 'Skipped';
      default:
        return 'Pending';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900 rounded-3xl p-6 border border-gray-800 mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ChartBarIcon className="h-6 w-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Daily Status</h3>
      </div>

      {/* Today's Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">Today's Tiffin</h4>
          <span className="text-gray-400 text-sm">
            {format(new Date(), 'MMM d, yyyy')}
          </span>
        </div>

        {todayStatus.status === 'pending' ? (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusUpdate('ordered')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Ordered
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusUpdate('skipped')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XCircleIcon className="h-5 w-5" />
              Skip Today
            </motion.button>
          </div>
        ) : (
          <div className={`p-4 rounded-2xl border ${getStatusColor(todayStatus.status)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(todayStatus.status)}
              <span className="text-white font-medium">
                {getStatusText(todayStatus.status)}
              </span>
              <span className="text-gray-400 text-sm ml-auto">
                {format(new Date(todayStatus.timestamp), 'h:mm a')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Overview */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">This Week</h4>
        <div className="grid grid-cols-7 gap-2">
          {recentHistory.map((status, index) => {
            const date = new Date(status.date);
            const dayName = format(date, 'EEE');
            const isCurrentDay = isToday(date);
            
            return (
              <motion.div
                key={status.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`text-center p-3 rounded-xl border ${
                  isCurrentDay 
                    ? 'border-blue-500/50 bg-blue-500/10' 
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="text-gray-400 text-xs mb-1">{dayName}</div>
                <div className="flex justify-center mb-1">
                  {getStatusIcon(status.status)}
                </div>
                <div className="text-gray-400 text-xs">
                  {format(date, 'd')}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
          <div className="text-xl font-bold text-green-400">{stats.orderedDays}</div>
          <div className="text-gray-400 text-xs">Ordered</div>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
          <div className="text-xl font-bold text-red-400">{stats.skippedDays}</div>
          <div className="text-gray-400 text-xs">Skipped</div>
        </div>
        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
          <div className="text-xl font-bold text-blue-400">{stats.orderRate}%</div>
          <div className="text-gray-400 text-xs">Order Rate</div>
        </div>
      </div>
    </motion.div>
  );
}