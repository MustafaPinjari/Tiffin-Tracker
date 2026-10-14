import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  BookmarkSquareIcon,
  ArrowRightIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Input, Modal, Badge } from '../components/ui';
import { SpendingChart } from '../components/analytics/SpendingChart';
import {
  getTodayDateString,
  formatDisplayDate,
  formatMonthName,
  getMonthKey
} from '../utils/date';
import { formatCurrency, calculateOrderTotal, calculateBudgetStatus } from '../utils/calculations';
import { Order, MealType } from '../types';

export const HomePage: React.FC = () => {
  const {
    orders,
    settings,
    addOrder,
    updateOrder,
    deleteOrder,
    recordSkippedMeal,
    getMonthlyStats,
    showToast
  } = useApp();

  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [mealType, setMealType] = useState<MealType>(settings.trackingMode === 'detailed' ? 'lunch' : 'single');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPriceEnabled, setCustomPriceEnabled] = useState(false);
  const [unitPrice, setUnitPrice] = useState<number>(settings.defaultPrice);
  const [notes, setNotes] = useState('');

  // Editing order modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editPrice, setEditPrice] = useState(settings.defaultPrice);
  const [editNotes, setEditNotes] = useState('');

  // Delete confirmation modal state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Form scroll ref
  const orderSectionRef = useRef<HTMLDivElement>(null);

  // Sync unitPrice when defaultPrice changes if custom price not enabled
  useEffect(() => {
    if (!customPriceEnabled) {
      setUnitPrice(settings.defaultPrice);
    }
  }, [settings.defaultPrice, customPriceEnabled]);

  // Check if an order already exists for selected date and mealType
  const existingOrder = orders.find(o => o.date === selectedDate && o.mealType === mealType);

  useEffect(() => {
    if (existingOrder && existingOrder.status === 'ordered') {
      setQuantity(existingOrder.numberOfTiffins);
      setUnitPrice(existingOrder.pricePerTiffin);
      setCustomPriceEnabled(existingOrder.pricePerTiffin !== settings.defaultPrice);
      setNotes(existingOrder.notes || '');
    } else {
      setQuantity(1);
      setUnitPrice(settings.defaultPrice);
      setCustomPriceEnabled(false);
      setNotes('');
    }
  }, [existingOrder, selectedDate, mealType, settings.defaultPrice]);

  const activeUnitPrice = customPriceEnabled ? unitPrice : settings.defaultPrice;
  const calculatedTotal = calculateOrderTotal(quantity, activeUnitPrice);

  // Statistics
  const monthlyStats = getMonthlyStats();

  const budgetStatus = calculateBudgetStatus(
    monthlyStats.totalAmount,
    settings.monthlyBudget,
    settings.budgetAlertThreshold
  );

  // Today's meal slot check
  const todayLunch = orders.find(o => o.date === todayStr && o.mealType === 'lunch');
  const todayDinner = orders.find(o => o.date === todayStr && o.mealType === 'dinner');
  const todaySingle = orders.find(o => o.date === todayStr && o.mealType === 'single');

  // Space optimization: group recent orders by day so lunch and dinner are unified
  const recentDayGroups = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const order of orders) {
      const list = map.get(order.date) || [];
      list.push(order);
      map.set(order.date, list);
    }
    const groups: {
      date: string;
      orders: Order[];
      totalAmount: number;
      totalTiffins: number;
      isAllSkipped: boolean;
    }[] = [];
    for (const [date, dayOrders] of map.entries()) {
      const sorted = [...dayOrders].sort((a, b) => {
        if (a.mealType === 'lunch' && b.mealType === 'dinner') return -1;
        if (a.mealType === 'dinner' && b.mealType === 'lunch') return 1;
        return 0;
      });
      const totalAmount = sorted.reduce((sum, o) => sum + (o.status === 'ordered' ? o.totalAmount : 0), 0);
      const totalTiffins = sorted.reduce((sum, o) => sum + (o.status === 'ordered' ? o.numberOfTiffins : 0), 0);
      const isAllSkipped = sorted.length > 0 && sorted.every(o => o.status === 'skipped');
      groups.push({ date, orders: sorted, totalAmount, totalTiffins, isAllSkipped });
    }
    return groups.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [orders]);

  const scrollToOrderForm = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }
    if (activeUnitPrice < 0) {
      showToast('Price cannot be negative', 'error');
      return;
    }

    const res = addOrder({
      date: selectedDate,
      mealType,
      numberOfTiffins: quantity,
      pricePerTiffin: activeUnitPrice,
      notes: notes.trim() || undefined,
      status: 'ordered'
    });

    if (res.success) {
      showToast(
        res.isUpdate
          ? `Updated ${formatDisplayDate(selectedDate)}: ${quantity} tiffin${quantity > 1 ? 's' : ''}`
          : `Recorded ${quantity} tiffin${quantity > 1 ? 's' : ''} for ${formatDisplayDate(selectedDate)}`,
        'success'
      );
    }
  };

  const handleSkipToday = () => {
    recordSkippedMeal(selectedDate, mealType, 'Marked as skipped');
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setEditQuantity(order.numberOfTiffins);
    setEditPrice(order.pricePerTiffin);
    setEditNotes(order.notes || '');
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;
    if (editQuantity <= 0) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }
    if (editPrice < 0) {
      showToast('Price cannot be negative', 'error');
      return;
    }

    updateOrder(editingOrder.id, {
      numberOfTiffins: editQuantity,
      pricePerTiffin: editPrice,
      notes: editNotes.trim() || undefined
    });

    setEditingOrder(null);
    showToast(`Updated order for ${formatDisplayDate(editingOrder.date)}`, 'success');
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    deleteOrder(orderToDelete.id);
    setOrderToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#263751]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EAF2FF] tracking-tight">
            Financial & Meal Dashboard
          </h1>
          <p className="text-xs text-[#A8B7CE] mt-0.5">
            Monitor daily orders, monthly outlay, and active commitments
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={scrollToOrderForm}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Record Order
          </Button>
        </div>
      </div>

      {/* 2. MAIN FINANCIAL SUMMARY (Visually Dominant Anchor Area) */}
      <div className="bg-[#111B2E] border border-[#263751] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Dominant Outlay Figure (Cols 1 to 7) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                {formatMonthName(getMonthKey(todayStr))} Spending
              </span>
              <span className="text-[#263751]">•</span>
              <span className="text-xs text-[#71829C]">Active Period</span>
            </div>

            <div className="text-4xl sm:text-5xl font-black text-[#EAF2FF] tracking-tight">
              {formatCurrency(monthlyStats.totalAmount, settings.currencySymbol)}
            </div>

            <p className="text-xs text-[#A8B7CE] max-w-md">
              {monthlyStats.totalOrders > 0
                ? `${monthlyStats.totalTiffins} total tiffins consumed across ${monthlyStats.totalOrders} recorded meals this month.`
                : 'No meals have been recorded yet for the current calendar month.'}
            </p>
          </div>

          {/* Subordinate Supporting Metrics (Cols 8 to 12) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#263751] lg:pl-6">
            <div className="p-3.5 rounded-2xl bg-[#17243A] border border-[#263751]">
              <span className="text-[11px] font-semibold uppercase text-[#71829C] block">
                Avg Cost / Meal
              </span>
              <span className="text-lg font-bold text-[#EAF2FF] block mt-0.5">
                {formatCurrency(monthlyStats.averagePerMeal, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-[#A8B7CE]">Effective rate</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#17243A] border border-[#263751]">
              <span className="text-[11px] font-semibold uppercase text-[#71829C] block">
                Daily Run Rate
              </span>
              <span className="text-lg font-bold text-[#38BDF8] block mt-0.5">
                {formatCurrency(monthlyStats.averageDailySpend, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-[#A8B7CE]">Per active day</span>
            </div>

            {settings.monthlyBudget > 0 && (
              <div className="col-span-2 p-3.5 rounded-2xl bg-[#17243A] border border-[#263751] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#A8B7CE] font-medium">Budget Utilization</span>
                  <span className={budgetStatus.isOverBudget ? 'text-[#FB7185] font-bold' : 'text-[#34D399] font-bold'}>
                    {budgetStatus.utilizationPercent}% Used
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0B1220] rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      budgetStatus.isOverBudget
                        ? 'bg-[#FB7185]'
                        : budgetStatus.isNearThreshold
                        ? 'bg-[#FBBF24]'
                        : 'bg-[#2563EB]'
                    }`}
                    style={{ width: `${Math.min(budgetStatus.utilizationPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#71829C]">
                  <span>{formatCurrency(budgetStatus.spent, settings.currencySymbol)} spent</span>
                  <span>{formatCurrency(budgetStatus.remaining, settings.currencySymbol)} remaining</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN BENTO: ORDER ENTRY CONSOLE + TODAY'S STATUS & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ORDER ENTRY WORKFLOW (Cols 1 to 7) */}
        <div ref={orderSectionRef} className="lg:col-span-7 space-y-4">
          <div className="bg-[#111B2E] border border-[#263751] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#263751]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB]/15 text-[#38BDF8] flex items-center justify-center font-bold">
                  <BookmarkSquareIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#EAF2FF] tracking-tight">
                    {existingOrder ? 'Edit Recorded Order' : 'Record Order'}
                  </h2>
                  <p className="text-xs text-[#71829C]">
                    {formatDisplayDate(selectedDate, { showDayName: true, showYear: true })}
                  </p>
                </div>
              </div>

              {existingOrder && (
                <Badge variant={existingOrder.status === 'skipped' ? 'amber' : 'emerald'} size="sm">
                  {existingOrder.status === 'skipped' ? 'Skipped' : 'Logged'}
                </Badge>
              )}
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4">
              {/* Date Selection & Meal Type Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="order-date-input" className="block text-xs font-semibold uppercase tracking-wider text-[#A8B7CE] mb-1.5">
                    Order Date
                  </label>
                  <input
                    id="order-date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#263751] rounded-xl px-3.5 py-2 text-sm text-[#EAF2FF] font-semibold focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B7CE] mb-1.5">
                    Meal Session
                  </label>
                  <div className="flex bg-[#0B1220] p-1 rounded-xl border border-[#263751]">
                    {settings.trackingMode === 'detailed' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setMealType('lunch')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            mealType === 'lunch'
                              ? 'bg-[#2563EB] text-white shadow-sm'
                              : 'text-[#A8B7CE] hover:text-[#EAF2FF]'
                          }`}
                        >
                          <SunIcon className="w-3.5 h-3.5" />
                          <span>Lunch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMealType('dinner')}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            mealType === 'dinner'
                              ? 'bg-[#2563EB] text-white shadow-sm'
                              : 'text-[#A8B7CE] hover:text-[#EAF2FF]'
                          }`}
                        >
                          <MoonIcon className="w-3.5 h-3.5" />
                          <span>Dinner</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMealType('single')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] text-white text-center"
                      >
                        Single Daily Meal
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tiffin Quantity Stepper */}
              <div className="p-4 rounded-2xl bg-[#0B1220] border border-[#263751] text-center space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71829C] block">
                  Tiffin Quantity
                </span>

                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-xl bg-[#17243A] hover:bg-[#1E2E49] active:bg-[#111B2E] text-[#EAF2FF] flex items-center justify-center border border-[#263751] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-[#EAF2FF] tracking-tight tabular-nums">
                      {quantity}
                    </span>
                    <span className="text-xs text-[#71829C] font-medium">
                      {quantity === 1 ? 'tiffin' : 'tiffins'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="w-10 h-10 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] active:bg-[#1D4ED8] text-white flex items-center justify-center shadow-md shadow-[#2563EB]/25 transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Presets */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#17243A]">
                  <span className="text-[11px] text-[#71829C] mr-1">Presets:</span>
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                        quantity === num
                          ? 'bg-[#EAF2FF] text-[#0B1220] font-bold'
                          : 'bg-[#17243A] text-[#A8B7CE] hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price HUD & Custom Price Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#0B1220] border border-[#263751] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#71829C]">Rate Applied:</span>
                    <button
                      type="button"
                      onClick={() => setCustomPriceEnabled(!customPriceEnabled)}
                      className="inline-flex items-center gap-1 font-bold text-[#38BDF8] hover:underline"
                    >
                      <PencilIcon className="w-3 h-3" />
                      <span>{formatCurrency(activeUnitPrice, settings.currencySymbol)} / tiffin</span>
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[#71829C] block">Subtotal</span>
                    <span className="text-base font-bold text-[#EAF2FF] tracking-tight">
                      {formatCurrency(calculatedTotal, settings.currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Inline Custom Price Input */}
                {customPriceEnabled && (
                  <div className="pt-2 border-t border-[#17243A] flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] uppercase font-bold text-[#71829C] block mb-1">
                        Override Price For This Meal
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#111B2E] border border-[#263751] rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUnitPrice(settings.defaultPrice);
                        setCustomPriceEnabled(false);
                      }}
                      className="text-xs text-[#71829C] hover:text-[#EAF2FF] underline self-end pb-1.5"
                    >
                      Reset ({formatCurrency(settings.defaultPrice, settings.currencySymbol)})
                    </button>
                  </div>
                )}
              </div>

              {/* Notes Input */}
              <div>
                <input
                  type="text"
                  placeholder="Optional meal notes (e.g. Special sabzi, extra roti)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#263751] rounded-xl px-3.5 py-2 text-xs text-[#EAF2FF] placeholder-[#71829C] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<CheckCircleIcon className="w-5 h-5" />}
                >
                  {existingOrder ? 'Update Meal' : 'Confirm & Log Order'} • {formatCurrency(calculatedTotal, settings.currencySymbol)}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleSkipToday}
                  leftIcon={<XCircleIcon className="w-4 h-4 text-[#FBBF24]" />}
                  title="Record this session as skipped"
                >
                  Skip
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: TODAY'S STATUS & SPENDING VISUALIZATION (Cols 8 to 12) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Today's Order Status Section */}
          <div className="bg-[#111B2E] border border-[#263751] rounded-3xl p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#263751]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8B7CE] flex items-center gap-1.5">
                <CalendarDaysIcon className="w-4 h-4 text-[#38BDF8]" />
                <span>Today's Meal Ledger</span>
              </span>
              <span className="text-[11px] text-[#71829C]">
                {formatDisplayDate(todayStr)}
              </span>
            </div>

            {settings.trackingMode === 'detailed' ? (
              <div className="space-y-2.5">
                {/* Lunch Slot */}
                <div
                  onClick={() => {
                    setSelectedDate(todayStr);
                    setMealType('lunch');
                    scrollToOrderForm();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    todayLunch?.status === 'ordered'
                      ? 'bg-[#17243A] border-[#2563EB]/50'
                      : todayLunch?.status === 'skipped'
                      ? 'bg-[#17243A] border-[#FBBF24]/30'
                      : 'bg-[#0B1220] border-[#263751] hover:border-[#3B82F6]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#111B2E] border border-[#263751] flex items-center justify-center text-[#FBBF24]">
                      <SunIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#EAF2FF]">Lunch Session</div>
                      <div className="text-[11px] text-[#A8B7CE]">
                        {todayLunch?.status === 'ordered'
                          ? `${todayLunch.numberOfTiffins} Tiffin • ${formatCurrency(todayLunch.totalAmount, settings.currencySymbol)}`
                          : todayLunch?.status === 'skipped'
                          ? 'Marked as skipped'
                          : 'Not recorded yet'}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#38BDF8]">
                    {todayLunch ? 'Edit' : '+ Record'}
                  </span>
                </div>

                {/* Dinner Slot */}
                <div
                  onClick={() => {
                    setSelectedDate(todayStr);
                    setMealType('dinner');
                    scrollToOrderForm();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    todayDinner?.status === 'ordered'
                      ? 'bg-[#17243A] border-[#2563EB]/50'
                      : todayDinner?.status === 'skipped'
                      ? 'bg-[#17243A] border-[#FBBF24]/30'
                      : 'bg-[#0B1220] border-[#263751] hover:border-[#3B82F6]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#111B2E] border border-[#263751] flex items-center justify-center text-[#38BDF8]">
                      <MoonIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#EAF2FF]">Dinner Session</div>
                      <div className="text-[11px] text-[#A8B7CE]">
                        {todayDinner?.status === 'ordered'
                          ? `${todayDinner.numberOfTiffins} Tiffin • ${formatCurrency(todayDinner.totalAmount, settings.currencySymbol)}`
                          : todayDinner?.status === 'skipped'
                          ? 'Marked as skipped'
                          : 'Not recorded yet'}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#38BDF8]">
                    {todayDinner ? 'Edit' : '+ Record'}
                  </span>
                </div>
              </div>
            ) : (
              /* Single Mode Slot */
              <div
                onClick={() => {
                  setSelectedDate(todayStr);
                  setMealType('single');
                  scrollToOrderForm();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  todaySingle?.status === 'ordered'
                    ? 'bg-[#17243A] border-[#2563EB]/50'
                    : 'bg-[#0B1220] border-[#263751] hover:border-[#3B82F6]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#111B2E] border border-[#263751] flex items-center justify-center text-[#38BDF8]">
                    <BookmarkSquareIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#EAF2FF]">Daily Tiffin</div>
                    <div className="text-[11px] text-[#A8B7CE]">
                      {todaySingle?.status === 'ordered'
                        ? `${todaySingle.numberOfTiffins} Tiffin • ${formatCurrency(todaySingle.totalAmount, settings.currencySymbol)}`
                        : 'Not recorded yet'}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-semibold text-[#38BDF8]">
                  {todaySingle ? 'Edit' : '+ Record'}
                </span>
              </div>
            )}
          </div>

          {/* Genuine 7-Day Spending Chart Component */}
          <SpendingChart orders={orders} currencySymbol={settings.currencySymbol} />
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LEDGER */}
      <div className="bg-[#111B2E] border border-[#263751] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#263751]">
          <div>
            <h2 className="text-sm font-bold text-[#EAF2FF] tracking-tight">
              Recent Activity Ledger
            </h2>
            <p className="text-xs text-[#71829C] mt-0.5">
              Historical records of your meals and adjustments
            </p>
          </div>

          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8] hover:text-[#EAF2FF] transition-colors"
          >
            <span>View Full History</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDayGroups.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-[#0B1220] border border-[#263751]">
            <p className="text-xs font-semibold text-[#A8B7CE]">No transaction history found</p>
            <p className="text-[11px] text-[#71829C] mt-1 max-w-xs mx-auto">
              Your logged meals and daily spending records will appear chronologically here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentDayGroups.map(dayGroup => (
              <div
                key={dayGroup.date}
                className="p-3 bg-[#0B1220] border border-[#263751] rounded-2xl space-y-2 hover:border-[#38BDF8]/30 transition-all"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#17243A]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#EAF2FF]">
                      {formatDisplayDate(dayGroup.date)}
                    </span>
                    {dayGroup.date === todayStr && (
                      <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-1.5 py-0.2 rounded">
                        TODAY
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#EAF2FF]">
                      {dayGroup.isAllSkipped ? (
                        <span className="text-[#FBBF24]">Skipped</span>
                      ) : (
                        formatCurrency(dayGroup.totalAmount, settings.currencySymbol)
                      )}
                    </span>
                    <span className="text-[10px] text-[#71829C] ml-1.5">
                      ({dayGroup.totalTiffins} tiffin{dayGroup.totalTiffins !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Day Meals (Lunch & Dinner grouped) */}
                <div className={`grid gap-2 ${dayGroup.orders.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {dayGroup.orders.map(order => (
                    <div
                      key={order.id}
                      className="p-2 rounded-xl bg-[#111B2E] border border-[#263751]/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                          order.status === 'skipped'
                            ? 'bg-[#FBBF24]/10 text-[#FBBF24]'
                            : order.mealType === 'dinner'
                            ? 'bg-[#818CF8]/15 text-[#818CF8]'
                            : order.mealType === 'lunch'
                            ? 'bg-[#FBBF24]/15 text-[#FBBF24]'
                            : 'bg-[#2563EB]/15 text-[#38BDF8]'
                        }`}>
                          {order.status === 'skipped' ? (
                            <XCircleIcon className="w-3.5 h-3.5" />
                          ) : order.mealType === 'dinner' ? (
                            <MoonIcon className="w-3.5 h-3.5" />
                          ) : order.mealType === 'lunch' ? (
                            <SunIcon className="w-3.5 h-3.5" />
                          ) : (
                            <BookmarkSquareIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-[#EAF2FF] capitalize block truncate">
                            {order.mealType === 'single' ? 'Full Day' : order.mealType}
                          </span>
                          <span className="text-[10px] text-[#71829C] block truncate">
                            {order.status === 'skipped'
                              ? 'Skipped'
                              : `${order.numberOfTiffins} @ ${formatCurrency(order.pricePerTiffin, settings.currencySymbol)}`
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-bold text-[#EAF2FF]">
                          {order.status === 'skipped' ? '₹0' : formatCurrency(order.totalAmount, settings.currencySymbol)}
                        </span>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(order)}
                            aria-label={`Edit ${order.mealType} on ${order.date}`}
                            className="p-1 rounded text-[#71829C] hover:text-[#38BDF8] hover:bg-[#17243A] transition-colors"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order)}
                            aria-label={`Delete ${order.mealType} on ${order.date}`}
                            className="p-1 rounded text-[#71829C] hover:text-[#FB7185] hover:bg-[#17243A] transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      <Modal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        title="Edit Order Record"
        description={editingOrder ? `Updating record for ${formatDisplayDate(editingOrder.date)}` : undefined}
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Quantity of Tiffins"
            type="number"
            min="1"
            value={editQuantity}
            onChange={(e) => setEditQuantity(parseInt(e.target.value, 10) || 1)}
          />

          <Input
            label={`Unit Price (${settings.currencySymbol})`}
            type="number"
            step="0.5"
            min="0"
            value={editPrice}
            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
            helperText="Custom unit price for this record"
          />

          <div className="p-3 bg-[#0B1220] rounded-xl border border-[#263751] flex justify-between items-center text-xs">
            <span className="text-[#A8B7CE]">Recalculated Total:</span>
            <span className="text-base font-bold text-[#38BDF8]">
              {formatCurrency(calculateOrderTotal(editQuantity, editPrice), settings.currencySymbol)}
            </span>
          </div>

          <Input
            label="Notes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Add optional notes..."
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setEditingOrder(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        title="Delete Record"
        description="Are you sure you want to delete this recorded meal? This action cannot be undone."
      >
        <div className="space-y-4 pt-1">
          {orderToDelete && (
            <div className="p-3.5 bg-[#0B1220] rounded-xl border border-[#263751] text-xs space-y-1">
              <div className="font-semibold text-[#EAF2FF]">
                {formatDisplayDate(orderToDelete.date)} ({orderToDelete.mealType})
              </div>
              <div className="text-[#A8B7CE]">
                {orderToDelete.numberOfTiffins} tiffins • {formatCurrency(orderToDelete.totalAmount, settings.currencySymbol)}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setOrderToDelete(null)}
            >
              Keep Record
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={handleConfirmDelete}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
