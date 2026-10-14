import React, { useState, useEffect } from 'react';
import {
  CurrencyRupeeIcon,
  BanknotesIcon,
  BellIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PrinterIcon,
  TrashIcon,
  DevicePhoneMobileIcon,
  SwatchIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { Card, Button, Input, Modal } from '../components/ui';
import { exportOrdersToCSV, exportFullBackupJSON, parseAndValidateBackupJSON } from '../utils/exportImport';
import { formatCurrency } from '../utils/calculations';
import { Order } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  dispatchSystemNotification
} from '../utils/notifications';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    orders,
    wallet,
    addWalletCredit,
    restoreOrdersFromBackup,
    resetAllData,
    showToast
  } = useApp();

  // Pricing state
  const [defaultPriceInput, setDefaultPriceInput] = useState<string>(settings.defaultPrice.toString());
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);

  // Budget state
  const [budgetInput, setBudgetInput] = useState<string>(settings.monthlyBudget.toString());
  const [thresholdInput, setThresholdInput] = useState<string>(settings.budgetAlertThreshold.toString());

  // Wallet modal state
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState<string>('500');
  const [creditDesc, setCreditDesc] = useState('Added monthly advance');

  // Backup restore modal state
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restorePreview, setRestorePreview] = useState<{
    valid: boolean;
    count: number;
    parsedOrders: Order[];
  } | null>(null);

  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState(false);

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notifPermission, setNotifPermission] = useState<string>(getNotificationPermission());

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      showToast('Tiffin Tracker installed successfully!', 'success');
    }
    setDeferredPrompt(null);
  };

  // Notification permission request
  const handleToggleReminders = async () => {
    if (!settings.reminders.enabled) {
      const granted = await requestNotificationPermission();
      setNotifPermission(getNotificationPermission());
      if (!granted) {
        showToast('Notification permission was denied. Please allow notifications in browser site settings.', 'error');
        return;
      }
    }

    updateSettings({
      reminders: {
        ...settings.reminders,
        enabled: !settings.reminders.enabled
      }
    });
    showToast(
      !settings.reminders.enabled
        ? `Daily reminder scheduled for ${settings.reminders.reminderTime || '09:00'}`
        : 'Daily reminders turned off',
      'info'
    );
  };

  // Test Notification Trigger
  const handleSendTestNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    if (!granted) {
      showToast('Notification permission is not granted. Please allow notifications.', 'error');
      return;
    }

    const sent = await dispatchSystemNotification('🍱 Tiffin Tracker Test', {
      body: `Daily meal reminders are active! Scheduled for ${settings.reminders.reminderTime || '09:00'} daily.`,
    });

    if (sent) {
      showToast('Test notification sent to your device!', 'success');
    } else {
      showToast('Could not trigger notification. Ensure browser permissions are enabled.', 'error');
    }
  };

  // Save Pricing Changes
  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(defaultPriceInput);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      showToast('Please enter a valid positive price', 'error');
      return;
    }

    updateSettings({
      defaultPrice: Math.round(parsedPrice * 100) / 100,
      currencySymbol: currencySymbol.trim() || '₹'
    });
    showToast('Tiffin pricing configuration updated', 'success');
  };

  // Save Budget Changes
  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(budgetInput);
    const parsedThreshold = parseInt(thresholdInput, 10);

    if (isNaN(parsedBudget) || parsedBudget < 0) {
      showToast('Budget must be zero or a positive amount', 'error');
      return;
    }

    updateSettings({
      monthlyBudget: Math.round(parsedBudget * 100) / 100,
      budgetAlertThreshold: isNaN(parsedThreshold) ? 80 : Math.min(Math.max(parsedThreshold, 10), 100)
    });
    showToast('Monthly budget target updated', 'success');
  };

  // Add Wallet Credit
  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Credit amount must be greater than zero', 'error');
      return;
    }
    addWalletCredit(amount, creditDesc.trim());
    setShowAddCreditModal(false);
    setCreditAmount('500');
  };

  // File Upload for Backup Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = parseAndValidateBackupJSON(content);
      if (!validation.valid || !validation.parsedOrders) {
        showToast(validation.error || 'Failed to read backup file', 'error');
        return;
      }
      setRestorePreview({
        valid: true,
        count: validation.ordersCount,
        parsedOrders: validation.parsedOrders
      });
      setRestoreModalOpen(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyRestore = (mode: 'merge' | 'replace') => {
    if (!restorePreview?.parsedOrders) return;
    restoreOrdersFromBackup(restorePreview.parsedOrders, mode);
    setRestoreModalOpen(false);
    setRestorePreview(null);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#EAF2FF] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-sm text-[#A8B7CE] mt-0.5">
          Configure default tiffin rates, monthly spending caps, prepaid wallet, and data backups
        </p>
      </div>

      {/* 1. MANDATORY FEATURE: Adjustable Tiffin Pricing */}
      <Card padding="lg" variant="default" className="space-y-5">
        <div className="flex items-center gap-3 pb-3.5 border-b border-[#263751]">
          <div className="p-2 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#38BDF8]">
            <CurrencyRupeeIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
              Default Tiffin Pricing
            </h2>
            <p className="text-xs text-[#A8B7CE]">
              Configure your standard meal rate. Historical orders retain their recorded prices.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePricing} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Price per Tiffin"
              type="number"
              step="0.5"
              min="0"
              value={defaultPriceInput}
              onChange={(e) => setDefaultPriceInput(e.target.value)}
              helperText="Applied automatically when logging new meals"
            />

            <Input
              label="Currency Symbol"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              helperText="E.g. ₹ or Rs."
            />
          </div>

          {/* Pricing Rule Explanation Notice */}
          <div className="p-4 bg-[#17243A] border border-[#263751] rounded-xl flex items-start gap-3 text-xs text-[#A8B7CE]">
            <InformationCircleIcon className="w-5 h-5 text-[#38BDF8] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-[#EAF2FF] block">
                How Pricing Works in Tiffin Tracker:
              </span>
              <span>
                • Changing the default rate applies <strong>only to future orders</strong>.
              </span>
              <span className="block">
                • Existing historical orders keep their recorded prices and amounts permanently.
              </span>
              <span className="block">
                • You can also adjust or override the price for any specific meal when logging it.
              </span>
            </div>
          </div>

          <Button type="submit" variant="primary" size="md">
            Save Pricing Settings
          </Button>
        </form>
      </Card>

      {/* 2. Meal Tracking Mode */}
      <Card padding="lg" variant="default" className="space-y-4">
        <div className="pb-3 border-b border-[#263751]">
          <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
            Meal Tracking Detail
          </h2>
          <p className="text-xs text-[#A8B7CE] mt-0.5">
            Choose whether to log a single daily record or separate Lunch & Dinner entries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateSettings({ trackingMode: 'single' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              settings.trackingMode === 'single'
                ? 'bg-[#2563EB]/15 border-[#3B82F6] text-[#EAF2FF] shadow-sm'
                : 'bg-[#17243A] border-[#263751] text-[#A8B7CE] hover:text-[#EAF2FF] hover:border-[#3B82F6]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-[#EAF2FF]">Single Daily Order</span>
              {settings.trackingMode === 'single' && <CheckIcon className="w-4 h-4 text-[#38BDF8]" />}
            </div>
            <p className="text-xs text-[#71829C] leading-relaxed">
              One quick record per day. Ideal for users on a fixed daily meal subscription.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ trackingMode: 'detailed' })}
            className={`p-4 rounded-xl border text-left transition-all ${
              settings.trackingMode === 'detailed'
                ? 'bg-[#2563EB]/15 border-[#3B82F6] text-[#EAF2FF] shadow-sm'
                : 'bg-[#17243A] border-[#263751] text-[#A8B7CE] hover:text-[#EAF2FF] hover:border-[#3B82F6]/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-[#EAF2FF]">Lunch & Dinner Mode</span>
              {settings.trackingMode === 'detailed' && <CheckIcon className="w-4 h-4 text-[#38BDF8]" />}
            </div>
            <p className="text-xs text-[#71829C] leading-relaxed">
              Separate records for Lunch and Dinner. Ideal for flexible or split schedules.
            </p>
          </button>
        </div>
      </Card>

      {/* 3. Monthly Budget Settings */}
      <Card padding="lg" variant="default" className="space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-[#263751]">
          <div className="p-2 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399]">
            <BanknotesIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
              Monthly Budget Target
            </h2>
            <p className="text-xs text-[#A8B7CE]">
              Set spending limits and receive alerts when you approach your cap
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Monthly Budget (${settings.currencySymbol})`}
              type="number"
              min="0"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              helperText="Set to 0 to disable monthly budget tracking"
            />

            <Input
              label="Warning Alert Threshold (%)"
              type="number"
              min="10"
              max="100"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              helperText="Triggers an alert badge when reached (e.g. 80%)"
            />
          </div>

          <Button type="submit" variant="emerald" size="md">
            Save Budget Configuration
          </Button>
        </form>
      </Card>

      {/* 4. Optional Tiffin Wallet */}
      <Card padding="lg" variant="default" className="space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#263751]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399]">
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
                Prepaid Tiffin Wallet
              </h2>
              <p className="text-xs text-[#A8B7CE]">
                Track advance payments paid to your tiffin provider
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => updateSettings({ walletEnabled: !settings.walletEnabled })}
            className={`w-12 h-6 rounded-full transition-colors flex items-center p-0.5 ${
              settings.walletEnabled ? 'bg-[#2563EB]' : 'bg-[#1E2E49] border border-[#263751]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-[#EAF2FF] rounded-full shadow-sm transition-transform ${
                settings.walletEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.walletEnabled ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0B1220] rounded-xl border border-[#263751]">
              <div>
                <span className="text-xs text-[#A8B7CE] font-medium block">Current Prepaid Balance</span>
                <div className="text-2xl sm:text-3xl font-black text-[#34D399] tracking-tight mt-0.5">
                  {formatCurrency(wallet.balance, settings.currencySymbol)}
                </div>
                <span className="text-xs text-[#71829C] mt-1 block">
                  Covers approx. {Math.floor(wallet.balance / (settings.defaultPrice || 40))} meals at {formatCurrency(settings.defaultPrice, settings.currencySymbol)}/tiffin
                </span>
              </div>

              <Button
                variant="emerald"
                size="md"
                onClick={() => setShowAddCreditModal(true)}
              >
                + Add Prepaid Credit
              </Button>
            </div>

            {/* Wallet Transactions Summary */}
            {wallet.transactions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#71829C]">
                  Recent Wallet Activity
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {wallet.transactions.slice(0, 5).map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 bg-[#17243A] rounded-xl text-xs border border-[#263751]"
                    >
                      <div>
                        <span className="font-semibold text-[#EAF2FF]">{t.description}</span>
                        <span className="text-[#71829C] block text-[10px] mt-0.5">{t.date}</span>
                      </div>
                      <span className={`font-mono font-bold ${t.type === 'credit' ? 'text-[#34D399]' : 'text-[#EAF2FF]'}`}>
                        {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount, settings.currencySymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#71829C]">
            Wallet feature is currently turned off. Turn it on to track advance deposits and auto-deduct meals.
          </p>
        )}
      </Card>

      {/* 5. Notifications & Daily Reminders */}
      <Card padding="lg" variant="default" className="space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#263751]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#38BDF8]">
              <BellIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
                Daily Order Reminders
              </h2>
              <p className="text-xs text-[#A8B7CE]">
                Receive browser notifications to record your daily meals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleReminders}
            className={`w-12 h-6 rounded-full transition-colors flex items-center p-0.5 ${
              settings.reminders.enabled ? 'bg-[#2563EB]' : 'bg-[#1E2E49] border border-[#263751]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-[#EAF2FF] rounded-full shadow-sm transition-transform ${
                settings.reminders.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.reminders.enabled && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-[#0B1220] rounded-xl border border-[#263751]">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  notifPermission === 'granted' ? 'bg-[#34D399]' : notifPermission === 'denied' ? 'bg-[#FB7185]' : 'bg-[#FBBF24]'
                }`} />
                <span className="text-xs font-semibold text-[#EAF2FF]">
                  Browser Permission: <span className="capitalize">{notifPermission}</span>
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSendTestNotification}
                leftIcon={<BellIcon className="w-3.5 h-3.5 text-[#38BDF8]" />}
              >
                Send Test Notification
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reminder-time" className="block text-xs font-semibold text-[#A8B7CE] mb-1.5">
                  Daily Reminder Time
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  value={settings.reminders.reminderTime}
                  onChange={(e) => updateSettings({
                    reminders: {
                      ...settings.reminders,
                      reminderTime: e.target.value
                    }
                  })}
                  className="w-full bg-[#0B1220] border border-[#263751] rounded-xl px-4 py-2.5 text-sm text-[#EAF2FF] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="skip-weekends"
                  type="checkbox"
                  checked={settings.reminders.skipWeekends}
                  onChange={(e) => updateSettings({
                    reminders: {
                      ...settings.reminders,
                      skipWeekends: e.target.checked
                    }
                  })}
                  className="w-4 h-4 rounded bg-[#0B1220] border-[#263751] text-[#2563EB] focus:ring-[#38BDF8]"
                />
                <label htmlFor="skip-weekends" className="text-xs text-[#A8B7CE]">
                  Skip reminders on Saturdays & Sundays
                </label>
              </div>
            </div>

            <div className="p-3 bg-[#17243A] border border-[#263751] rounded-xl text-xs text-[#A8B7CE] space-y-1">
              <span className="font-semibold text-[#EAF2FF] block">How Daily Reminders Work:</span>
              <p className="text-[11px] text-[#71829C] leading-relaxed">
                Every day at <strong>{settings.reminders.reminderTime || '09:00'}</strong>, Tiffin Tracker checks if you have logged a meal. If you haven't recorded anything for the day yet, a reminder notification is delivered directly to your device. Once you record your meal or mark it skipped, reminders pause until the next day.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* 6. Appearance & Themes */}
      <Card padding="lg" variant="default" className="space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-[#263751]">
          <div className="p-2 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#38BDF8]">
            <SwatchIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
              Theme Mode
            </h2>
            <p className="text-xs text-[#A8B7CE]">
              Optimized for Midnight + Cobalt high-contrast dark environment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['dark', 'light', 'system'] as const).map(themeMode => (
            <button
              key={themeMode}
              type="button"
              onClick={() => updateSettings({ theme: themeMode })}
              className={`p-3 rounded-xl border text-center transition-all capitalize text-xs font-bold ${
                settings.theme === themeMode
                  ? 'bg-[#2563EB] text-[#EAF2FF] border-[#3B82F6] shadow-md shadow-[#2563EB]/25'
                  : 'bg-[#17243A] border-[#263751] text-[#A8B7CE] hover:text-[#EAF2FF] hover:border-[#3B82F6]/40'
              }`}
            >
              {themeMode === 'dark' ? 'Dark (Default)' : themeMode === 'light' ? 'Light' : 'System'}
            </button>
          ))}
        </div>
      </Card>

      {/* 7. PWA Installation & Device Integration */}
      <Card padding="lg" variant="default" className="space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-[#263751]">
          <div className="p-2 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#38BDF8]">
            <DevicePhoneMobileIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
              Progressive Web App (PWA)
            </h2>
            <p className="text-xs text-[#A8B7CE]">
              Install Tiffin Tracker on your home screen for quick offline access
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {isInstalled ? (
            <div className="p-3.5 bg-[#34D399]/10 border border-[#34D399]/30 rounded-xl text-xs text-[#34D399] flex items-center gap-2.5">
              <CheckIcon className="w-5 h-5 flex-shrink-0" />
              <span>Tiffin Tracker is running as an installed PWA. Offline caching is active.</span>
            </div>
          ) : isInstallable ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleInstallClick}
              leftIcon={<DevicePhoneMobileIcon className="w-4 h-4" />}
            >
              Install App on Device
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#17243A] rounded-xl border border-[#263751] text-xs text-[#A8B7CE] space-y-2">
                <span className="font-bold text-[#EAF2FF] block text-sm">
                  How to Install on Samsung & Android:
                </span>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#2563EB]/20 text-[#38BDF8] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <span className="font-semibold text-[#EAF2FF]">Samsung Internet Browser:</span>
                      <p className="text-[#71829C] text-[11px] mt-0.5">
                        Tap the <strong>download arrow (⬇)</strong> in the top URL bar, or tap the <strong>menu (☰)</strong> at bottom-right &rarr; <strong>"Add page to"</strong> &rarr; <strong>"App screen"</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-[#263751]/60">
                    <span className="w-5 h-5 rounded-md bg-[#2563EB]/20 text-[#38BDF8] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <span className="font-semibold text-[#EAF2FF]">Google Chrome on Android:</span>
                      <p className="text-[#71829C] text-[11px] mt-0.5">
                        Tap the <strong>three dots (⋮)</strong> at top-right &rarr; select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0B1220] border border-[#263751] text-[11px] text-[#A8B7CE]">
                  <span className="text-[#FBBF24] font-semibold">Important Requirement:</span> Android security policies require access via <strong>HTTPS</strong> (e.g. your live Vercel URL) or <strong>localhost</strong>. Plain HTTP on local IP addresses (like <code className="text-[#38BDF8]">http://192.168.x.x</code>) blocks install prompts for security.
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 8. Data Management & Safe Backup */}
      <Card padding="lg" variant="default" className="space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-[#263751]">
          <div className="p-2 rounded-xl bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#38BDF8]">
            <ArrowDownTrayIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
              Data Management & Backup
            </h2>
            <p className="text-xs text-[#A8B7CE]">
              Export, backup, restore, and print your meal records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => exportOrdersToCSV(orders)}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          >
            Export All to CSV
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => exportFullBackupJSON(orders, settings, wallet)}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          >
            Download JSON Backup
          </Button>

          <label className="flex items-center justify-center gap-2 bg-[#17243A] hover:bg-[#1E2E49] text-[#EAF2FF] rounded-xl px-4 py-2.5 text-sm font-semibold border border-[#263751] hover:border-[#3B82F6]/50 cursor-pointer min-h-[44px] transition-colors">
            <ArrowUpTrayIcon className="w-4 h-4 text-[#38BDF8]" />
            <span>Restore from JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            variant="secondary"
            size="md"
            onClick={handlePrintReport}
            leftIcon={<PrinterIcon className="w-4 h-4" />}
          >
            Print Monthly Summary
          </Button>
        </div>

        {/* Danger Zone: Reset All Data */}
        <div className="pt-4 border-t border-[#263751] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#FB7185] block">Reset Application Data</span>
            <span className="text-[11px] text-[#71829C]">
              An emergency backup is automatically created in localStorage before any reset
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowResetModal(true)}
            leftIcon={<TrashIcon className="w-4 h-4" />}
          >
            Reset All
          </Button>
        </div>
      </Card>

      {/* Add Wallet Credit Modal */}
      <Modal
        isOpen={showAddCreditModal}
        onClose={() => setShowAddCreditModal(false)}
        title="Add Prepaid Wallet Credit"
        description="Record an advance amount paid to your provider"
      >
        <form onSubmit={handleAddCredit} className="space-y-4 pt-2">
          <Input
            label={`Advance Amount (${settings.currencySymbol})`}
            type="number"
            min="1"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
          />

          <Input
            label="Description / Vendor"
            value={creditDesc}
            onChange={(e) => setCreditDesc(e.target.value)}
          />

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowAddCreditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              fullWidth
            >
              Add Credit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Restore Backup Preview Modal */}
      <Modal
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setRestorePreview(null);
        }}
        title="Restore Data from Backup"
        description={restorePreview ? `Found ${restorePreview.count} orders in selected backup.` : undefined}
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#A8B7CE]">
            How would you like to restore this backup?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => handleApplyRestore('merge')}
            >
              Merge New Only
            </Button>
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={() => handleApplyRestore('replace')}
            >
              Replace Existing
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Data?"
        description="This will clear your local orders and wallet history. A timestamped backup will be preserved in localStorage."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-[#FB7185]/10 border border-[#FB7185]/30 rounded-xl text-xs text-[#FB7185]">
            ⚠️ This action will remove your active orders from view.
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={() => {
                resetAllData();
                setShowResetModal(false);
              }}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
