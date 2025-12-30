import { format, addDays } from 'date-fns';

export interface NotificationSettings {
  enabled: boolean;
  reminderTime: string; // HH:MM format
  skipWeekends: boolean;
  reminderDays: number; // Days in advance to remind
}

export interface TiffinStatus {
  date: string;
  status: 'ordered' | 'skipped' | 'pending';
  numberOfTiffins?: number; // Number of tiffins ordered
  totalAmount?: number; // Total amount spent
  timestamp: number;
  reminderSent: boolean;
}

class NotificationService {
  private readonly STORAGE_KEY = 'tiffin-notifications';
  private readonly STATUS_KEY = 'tiffin-status-history';
  private readonly SETTINGS_KEY = 'notification-settings';

  // Default notification settings
  private defaultSettings: NotificationSettings = {
    enabled: false,
    reminderTime: '09:00',
    skipWeekends: true,
    reminderDays: 0 // Same day reminder
  };

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Get current notification settings
  getSettings(): NotificationSettings {
    const stored = localStorage.getItem(this.SETTINGS_KEY);
    return stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : this.defaultSettings;
  }

  // Update notification settings
  updateSettings(settings: Partial<NotificationSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updated));
    
    // Reschedule notifications with new settings
    if (updated.enabled) {
      this.scheduleNextReminder();
    } else {
      this.clearAllReminders();
    }
  }

  // Get tiffin status for a specific date
  getTiffinStatus(date: string): TiffinStatus | null {
    const history = this.getStatusHistory();
    return history.find(status => status.date === date) || null;
  }

  // Update tiffin status for a date with order details
  updateTiffinStatus(date: string, status: 'ordered' | 'skipped', numberOfTiffins?: number, totalAmount?: number): void {
    const history = this.getStatusHistory();
    const existingIndex = history.findIndex(s => s.date === date);
    
    const statusEntry: TiffinStatus = {
      date,
      status,
      numberOfTiffins: status === 'ordered' ? numberOfTiffins : undefined,
      totalAmount: status === 'ordered' ? totalAmount : undefined,
      timestamp: Date.now(),
      reminderSent: true // Mark as handled since user took action
    };

    if (existingIndex >= 0) {
      history[existingIndex] = statusEntry;
    } else {
      history.push(statusEntry);
    }

    // Keep only last 30 days of history
    const thirtyDaysAgo = format(addDays(new Date(), -30), 'yyyy-MM-dd');
    const filteredHistory = history.filter(s => s.date >= thirtyDaysAgo);
    
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(filteredHistory));
  }

  // Clear tiffin status for a date
  clearTiffinStatus(date: string): void {
    const history = this.getStatusHistory();
    const filteredHistory = history.filter(s => s.date !== date);
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(filteredHistory));
  }

  // Get all status history
  private getStatusHistory(): TiffinStatus[] {
    const stored = localStorage.getItem(this.STATUS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Check if today's status needs attention
  getTodayStatus(): TiffinStatus {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existing = this.getTiffinStatus(today);
    
    if (existing) {
      return existing;
    }

    // Return pending status for today
    return {
      date: today,
      status: 'pending',
      timestamp: Date.now(),
      reminderSent: false
    };
  }

  // Send immediate notification
  async sendNotification(title: string, body: string, options?: NotificationOptions): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'tiffin-reminder',
      requireInteraction: true,
      ...options
    });

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  // Send daily reminder notification
  async sendDailyReminder(): Promise<void> {
    const settings = this.getSettings();
    if (!settings.enabled) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayStatus = this.getTodayStatus();

    // Don't send if already handled today
    if (todayStatus.status !== 'pending' || todayStatus.reminderSent) {
      return;
    }

    // Skip weekends if setting is enabled
    const dayOfWeek = new Date().getDay();
    if (settings.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return;
    }

    const title = '🍱 Tiffin Reminder';
    const body = "Don't forget to order your tiffin for today! Tap to open the app.";

    await this.sendNotification(title, body);

    // Mark reminder as sent
    const history = this.getStatusHistory();
    const existingIndex = history.findIndex(s => s.date === today);
    
    if (existingIndex >= 0) {
      history[existingIndex].reminderSent = true;
    } else {
      history.push({
        date: today,
        status: 'pending',
        timestamp: Date.now(),
        reminderSent: true
      });
    }
    
    localStorage.setItem(this.STATUS_KEY, JSON.stringify(history));
  }

  // Schedule next reminder based on settings
  scheduleNextReminder(): void {
    const settings = this.getSettings();
    if (!settings.enabled) return;

    // Clear existing timeouts
    this.clearAllReminders();

    const now = new Date();
    const [hours, minutes] = settings.reminderTime.split(':').map(Number);
    
    // Calculate next reminder time
    let nextReminder = new Date();
    nextReminder.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (nextReminder <= now) {
      nextReminder = addDays(nextReminder, 1);
    }

    // Skip weekends if enabled
    if (settings.skipWeekends) {
      while (nextReminder.getDay() === 0 || nextReminder.getDay() === 6) {
        nextReminder = addDays(nextReminder, 1);
      }
    }

    const timeUntilReminder = nextReminder.getTime() - now.getTime();

    // Schedule the reminder
    const timeoutId = setTimeout(() => {
      this.sendDailyReminder();
      // Schedule next reminder for tomorrow
      this.scheduleNextReminder();
    }, timeUntilReminder);

    // Store timeout ID for cleanup
    localStorage.setItem(this.STORAGE_KEY, timeoutId.toString());
  }

  // Clear all scheduled reminders
  clearAllReminders(): void {
    const timeoutId = localStorage.getItem(this.STORAGE_KEY);
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Get notification statistics
  getNotificationStats(): {
    totalDays: number;
    orderedDays: number;
    skippedDays: number;
    pendingDays: number;
    orderRate: number;
  } {
    const history = this.getStatusHistory();
    const totalDays = history.length;
    const orderedDays = history.filter(s => s.status === 'ordered').length;
    const skippedDays = history.filter(s => s.status === 'skipped').length;
    const pendingDays = history.filter(s => s.status === 'pending').length;
    const orderRate = totalDays > 0 ? (orderedDays / totalDays) * 100 : 0;

    return {
      totalDays,
      orderedDays,
      skippedDays,
      pendingDays,
      orderRate: Math.round(orderRate)
    };
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    const settings = this.getSettings();
    
    if (settings.enabled) {
      const hasPermission = await this.requestPermission();
      if (hasPermission) {
        this.scheduleNextReminder();
      } else {
        // Disable notifications if permission denied
        this.updateSettings({ enabled: false });
      }
    }

    // Handle notification actions (for browsers that support it)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.action === 'order') {
          window.focus();
          // Navigate to home page
          window.location.href = '/';
        } else if (event.data.action === 'skip') {
          const today = format(new Date(), 'yyyy-MM-dd');
          this.updateTiffinStatus(today, 'skipped');
        }
      });
    }
  }

  // Check if user needs reminder based on patterns
  shouldSendReminder(): boolean {
    const history = this.getStatusHistory();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Don't remind if already handled today
    const todayStatus = this.getTiffinStatus(today);
    if (todayStatus && todayStatus.status !== 'pending') {
      return false;
    }

    // Get last 7 days of history (excluding today)
    const recentHistory = history
      .filter(s => s.date < today)
      .slice(-7);

    // If user typically orders on this day of week, send reminder
    const dayOfWeek = new Date().getDay();
    const sameWeekdayOrders = recentHistory.filter(s => {
      const statusDate = new Date(s.date);
      return statusDate.getDay() === dayOfWeek && s.status === 'ordered';
    });

    // Send reminder if user has ordered on this weekday before
    return sameWeekdayOrders.length > 0;
  }
}

export const notificationService = new NotificationService();