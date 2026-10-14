import { UserSettings, Order } from '../types';
import { getTodayDateString } from './date';

const LAST_REMINDER_KEY = 'tiffin_last_reminder_date';

/**
 * Check if browser supports Web Notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Dispatch a notification via Service Worker (preferred for PWA & mobile)
 * or fallback to window.Notification
 */
export async function dispatchSystemNotification(
  title: string,
  options?: NotificationOptions
): Promise<boolean> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  const notificationOptions: NotificationOptions = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'tiffin-daily-reminder',
    ...options
  };

  // 1. Try Service Worker showNotification (works in PWA, Android, background)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch (err) {
      console.warn('Service worker showNotification fallback to new Notification', err);
    }
  }

  // 2. Fallback to native window Notification
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.error('Failed to trigger window Notification:', err);
    return false;
  }
}

/**
 * Check if today's daily reminder should be triggered and trigger it if due.
 *
 * Conditions:
 * 1. Reminders must be enabled in settings.
 * 2. Today is not a skipped weekend day.
 * 3. User has NOT already logged a meal or skip for today.
 * 4. User has NOT already received a reminder today.
 * 5. Current time is >= configured reminderTime (e.g. 09:00).
 */
export async function checkAndTriggerDailyReminder(
  settings: UserSettings,
  orders: Order[],
  onTriggered?: (title: string, body: string) => void
): Promise<boolean> {
  if (!settings.reminders?.enabled) {
    return false;
  }

  const todayStr = getTodayDateString();
  const lastReminderDate = localStorage.getItem(LAST_REMINDER_KEY);

  // Already sent today
  if (lastReminderDate === todayStr) {
    return false;
  }

  // Check weekend filter
  const todayDate = new Date();
  const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 6 = Saturday
  if (settings.reminders.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return false;
  }

  // Check if user already recorded an order or skip for today
  const hasLoggedToday = orders.some(o => o.date === todayStr);
  if (hasLoggedToday) {
    return false;
  }

  // Check reminder time
  const reminderTime = settings.reminders.reminderTime || '09:00';
  const [remHourStr, remMinStr] = reminderTime.split(':');
  const remHours = parseInt(remHourStr, 10) || 9;
  const remMinutes = parseInt(remMinStr, 10) || 0;

  const currentHours = todayDate.getHours();
  const currentMinutes = todayDate.getMinutes();

  const currentTimeInMinutes = currentHours * 60 + currentMinutes;
  const targetReminderInMinutes = remHours * 60 + remMinutes;

  // Has reminder time arrived?
  if (currentTimeInMinutes >= targetReminderInMinutes) {
    const title = '🍱 Tiffin Tracker Reminder';
    const body = "Don't forget to record your tiffin for today! Tap to log your meal.";

    const sent = await dispatchSystemNotification(title, {
      body,
      data: { url: '/' }
    });

    if (sent) {
      localStorage.setItem(LAST_REMINDER_KEY, todayStr);
      onTriggered?.(title, body);
      return true;
    }
  }

  return false;
}
