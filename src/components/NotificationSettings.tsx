import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { notificationService, type NotificationSettings } from '../services/notificationService';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check current notification permission
    setHasPermission(Notification.permission === 'granted');
  }, []);

  const handleToggleNotifications = async () => {
    if (!settings.enabled) {
      // Request permission when enabling
      const permission = await notificationService.requestPermission();
      if (!permission) {
        alert('Please enable notifications in your browser settings to receive reminders.');
        return;
      }
      setHasPermission(true);
    }

    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...settings, reminderTime: time };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const handleSkipWeekendsChange = () => {
    const newSettings = { ...settings, skipWeekends: !settings.skipWeekends };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const sendTestNotification = async () => {
    await notificationService.sendNotification(
      '🍱 Test Notification',
      'This is how your tiffin reminders will look!',
      { tag: 'test-notification' }
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BellIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl">
            <div>
              <h3 className="text-white font-medium">Daily Reminders</h3>
              <p className="text-gray-400 text-sm">Get reminded to order your tiffin</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: settings.enabled ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full"
              />
            </motion.button>
          </div>
        </div>

        {settings.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Reminder Time */}
            <div className="p-4 bg-gray-800/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="h-5 w-5 text-blue-400" />
                <h3 className="text-white font-medium">Reminder Time</h3>
              </div>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-xl p-3 border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Skip Weekends */}
            <div className="p-4 bg-gray-800/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-medium">Skip Weekends</h3>
                    <p className="text-gray-400 text-sm">No reminders on Sat & Sun</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSkipWeekendsChange}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.skipWeekends ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: settings.skipWeekends ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full"
                  />
                </motion.button>
              </div>
            </div>

            {/* Test Notification */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendTestNotification}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium transition-colors"
            >
              Send Test Notification
            </motion.button>
          </motion.div>
        )}

        {/* Permission Warning */}
        {!hasPermission && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
          >
            <p className="text-yellow-400 text-sm">
              ⚠️ Notifications are blocked. Please enable them in your browser settings.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}