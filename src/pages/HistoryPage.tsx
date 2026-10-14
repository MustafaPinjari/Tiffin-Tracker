import React, { useState, useMemo } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  XCircleIcon,
  SunIcon,
  MoonIcon,
  InboxIcon,
  BookmarkSquareIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { Button, Input, Modal, Badge } from '../components/ui';
import {
  getTodayDateString,
  formatDisplayDate,
  getMonthKey,
  formatMonthName,
  getWeekBoundaries,
  shiftWeek,
  shiftMonth
} from '../utils/date';
import { formatCurrency, calculateOrderTotal } from '../utils/calculations';
import { exportOrdersToCSV } from '../utils/exportImport';
import { Order, MealType } from '../types';

export const HistoryPage: React.FC = () => {
  const {
    settings,
    getFilteredOrders,
    updateOrder,
    deleteOrder,
    showToast
  } = useApp();

  const todayStr = getTodayDateString();
  const [filterMode, setFilterMode] = useState<'month' | 'week' | 'all' | 'custom'>('month');
  const [anchorDate, setAnchorDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(todayStr.substring(0, 8) + '01');
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing order modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editMealType, setEditMealType] = useState<MealType>('single');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editPrice, setEditPrice] = useState(settings.defaultPrice);
  const [editNotes, setEditNotes] = useState('');

  // Delete modal state
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Compute filtered dataset
  const { orders: filteredOrders, stats: filteredStats } = getFilteredOrders({
    mode: filterMode,
    anchorDate,
    startDate,
    endDate,
    search: searchQuery
  });

  // Space-Optimized: Group orders by date so Lunch and Dinner appear in the same Day Card
  interface DayGroup {
    date: string;
    orders: Order[];
    totalTiffins: number;
    totalAmount: number;
    isAllSkipped: boolean;
  }

  const groupedDays = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const order of filteredOrders) {
      const list = map.get(order.date) || [];
      list.push(order);
      map.set(order.date, list);
    }

    const groups: DayGroup[] = [];
    for (const [date, dayOrders] of map.entries()) {
      const sortedMeals = [...dayOrders].sort((a, b) => {
        if (a.mealType === 'lunch' && b.mealType === 'dinner') return -1;
        if (a.mealType === 'dinner' && b.mealType === 'lunch') return 1;
        return 0;
      });

      const totalTiffins = sortedMeals.reduce(
        (sum, o) => sum + (o.status === 'ordered' ? o.numberOfTiffins : 0),
        0
      );
      const totalAmount = sortedMeals.reduce(
        (sum, o) => sum + (o.status === 'ordered' ? o.totalAmount : 0),
        0
      );
      const isAllSkipped = sortedMeals.length > 0 && sortedMeals.every(o => o.status === 'skipped');

      groups.push({
        date,
        orders: sortedMeals,
        totalTiffins,
        totalAmount,
        isAllSkipped
      });
    }

    return groups.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredOrders]);

  const weekBoundaries = getWeekBoundaries(anchorDate);
  const currentMonthKey = getMonthKey(anchorDate);

  const handlePrevWeek = () => {
    setAnchorDate(shiftWeek(anchorDate, 'prev'));
  };

  const handleNextWeek = () => {
    setAnchorDate(shiftWeek(anchorDate, 'next'));
  };

  const handlePrevMonth = () => {
    setAnchorDate(shiftMonth(anchorDate, 'prev'));
  };

  const handleNextMonth = () => {
    setAnchorDate(shiftMonth(anchorDate, 'next'));
  };

  const handleExportFiltered = () => {
    if (filteredOrders.length === 0) {
      showToast('No records to export in current filter', 'warning');
      return;
    }
    exportOrdersToCSV(filteredOrders, `tiffin-history-${filterMode}.csv`);
    showToast(`Exported ${filteredOrders.length} records to CSV`, 'success');
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setEditDate(order.date);
    setEditMealType(order.mealType);
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
      date: editDate,
      mealType: editMealType,
      numberOfTiffins: editQuantity,
      pricePerTiffin: editPrice,
      notes: editNotes.trim() || undefined
    });

    setEditingOrder(null);
    showToast(`Updated order for ${formatDisplayDate(editDate)}`, 'success');
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    deleteOrder(orderToDelete.id);
    setOrderToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#263751]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EAF2FF] tracking-tight">
            Order History Ledger
          </h1>
          <p className="text-xs text-[#A8B7CE] mt-0.5">
            Audit, filter, edit, and export your historical tiffin expenses
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportFiltered}
          leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Export CSV ({filteredOrders.length})
        </Button>
      </div>

      {/* Filter Card */}
      <div className="bg-[#111B2E] border border-[#263751] rounded-3xl p-5 shadow-xl space-y-4">
        {/* Mode Selector */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#263751]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A8B7CE]">
            <FunnelIcon className="w-4 h-4 text-[#38BDF8]" />
            <span>Time Range:</span>
          </div>

          <div className="flex bg-[#0B1220] p-1 rounded-xl border border-[#263751] text-xs font-semibold">
            {(['month', 'week', 'all', 'custom'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  filterMode === mode
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#A8B7CE] hover:text-[#EAF2FF]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Period Navigator */}
        {filterMode === 'month' && (
          <div className="flex items-center justify-between bg-[#0B1220] p-3 rounded-2xl border border-[#263751]">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-[#A8B7CE] hover:text-white hover:bg-[#17243A] transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-sm font-bold text-[#EAF2FF]">
                {formatMonthName(currentMonthKey)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-[#A8B7CE] hover:text-white hover:bg-[#17243A] transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Weekly Navigator */}
        {filterMode === 'week' && (
          <div className="flex items-center justify-between bg-[#0B1220] p-3 rounded-2xl border border-[#263751]">
            <button
              type="button"
              onClick={handlePrevWeek}
              aria-label="Previous week"
              className="p-1.5 rounded-lg text-[#A8B7CE] hover:text-white hover:bg-[#17243A] transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-center">
              <CalendarIcon className="w-4 h-4 text-[#38BDF8]" />
              <div>
                <span className="text-sm font-bold text-[#EAF2FF] block">
                  {weekBoundaries.display}
                </span>
                <span className="text-[10px] text-[#71829C]">
                  Monday through Sunday cycle
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              aria-label="Next week"
              className="p-1.5 rounded-lg text-[#A8B7CE] hover:text-white hover:bg-[#17243A] transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Custom Range Inputs */}
        {filterMode === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0B1220] p-3 rounded-2xl border border-[#263751]">
            <div>
              <label htmlFor="start-date" className="block text-xs font-semibold text-[#A8B7CE] mb-1">
                From Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#111B2E] border border-[#263751] rounded-xl px-3 py-2 text-xs text-[#EAF2FF] font-semibold"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-xs font-semibold text-[#A8B7CE] mb-1">
                To Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#111B2E] border border-[#263751] rounded-xl px-3 py-2 text-xs text-[#EAF2FF] font-semibold"
              />
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Input
            placeholder="Search transactions by note, meal type, or price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />
        </div>

        {/* Metric Summary Bar for Filtered Selection */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#263751] text-center">
          <div className="bg-[#0B1220] p-3 rounded-2xl border border-[#263751]">
            <span className="text-[11px] font-semibold uppercase text-[#71829C] block">Period Total</span>
            <span className="text-base font-extrabold text-[#38BDF8] block mt-0.5">
              {formatCurrency(filteredStats.totalAmount, settings.currencySymbol)}
            </span>
          </div>
          <div className="bg-[#0B1220] p-3 rounded-2xl border border-[#263751]">
            <span className="text-[11px] font-semibold uppercase text-[#71829C] block">Tiffins</span>
            <span className="text-base font-extrabold text-[#EAF2FF] block mt-0.5">
              {filteredStats.totalTiffins}
            </span>
          </div>
          <div className="bg-[#0B1220] p-3 rounded-2xl border border-[#263751]">
            <span className="text-[11px] font-semibold uppercase text-[#71829C] block">Meals</span>
            <span className="text-base font-extrabold text-[#EAF2FF] block mt-0.5">
              {filteredStats.totalOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Orders List (Grouped by Day for Space Optimization) */}
      <div className="space-y-3.5">
        {groupedDays.length === 0 ? (
          <div className="text-center py-14 rounded-3xl bg-[#111B2E] border border-[#263751] p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#17243A] text-[#71829C] flex items-center justify-center mx-auto mb-3">
              <InboxIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#EAF2FF]">
              No transactions found
            </h3>
            <p className="text-xs text-[#71829C] mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No orders matching "${searchQuery}". Clear your search term.`
                : 'There are no tiffin records logged within this timeframe.'
              }
            </p>
          </div>
        ) : (
          groupedDays.map(dayGroup => (
            <div
              key={dayGroup.date}
              className="bg-[#111B2E] border border-[#263751] hover:border-[#3B82F6]/40 rounded-2xl p-4 sm:p-5 transition-all duration-150 space-y-3"
            >
              {/* Day Card Header (Date + Combined Daily Summary) */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#263751]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#17243A] text-[#38BDF8] border border-[#263751] flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#EAF2FF]">
                        {formatDisplayDate(dayGroup.date, { showYear: true, showDayName: true })}
                      </span>
                      {dayGroup.date === todayStr && (
                        <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 px-1.5 py-0.5 rounded">
                          TODAY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Combined Daily Summary */}
                <div className="text-right">
                  <span className="text-sm sm:text-base font-extrabold text-[#EAF2FF] block tracking-tight">
                    {dayGroup.isAllSkipped ? (
                      <span className="text-[#FBBF24]">Skipped Day</span>
                    ) : (
                      formatCurrency(dayGroup.totalAmount, settings.currencySymbol)
                    )}
                  </span>
                  <span className="text-[10px] text-[#71829C] uppercase tracking-wider block">
                    {dayGroup.totalTiffins > 0 ? `${dayGroup.totalTiffins} Tiffin${dayGroup.totalTiffins > 1 ? 's' : ''}` : '0 Tiffins'}
                    {dayGroup.orders.length > 1 ? ` • ${dayGroup.orders.length} Sessions` : ''}
                  </span>
                </div>
              </div>

              {/* Meals inside this Day (Lunch & Dinner in same card) */}
              <div className={`grid gap-2.5 ${dayGroup.orders.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {dayGroup.orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-[#0B1220] border border-[#263751] rounded-xl p-3 flex items-center justify-between gap-3 hover:border-[#38BDF8]/30 transition-colors"
                  >
                    {/* Meal details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        order.status === 'skipped'
                          ? 'bg-[#FBBF24]/10 text-[#FBBF24]'
                          : order.mealType === 'dinner'
                          ? 'bg-[#818CF8]/15 text-[#818CF8]'
                          : order.mealType === 'lunch'
                          ? 'bg-[#FBBF24]/15 text-[#FBBF24]'
                          : 'bg-[#2563EB]/15 text-[#38BDF8]'
                      }`}>
                        {order.status === 'skipped' ? (
                          <XCircleIcon className="w-4 h-4" />
                        ) : order.mealType === 'dinner' ? (
                          <MoonIcon className="w-4 h-4" />
                        ) : order.mealType === 'lunch' ? (
                          <SunIcon className="w-4 h-4" />
                        ) : (
                          <BookmarkSquareIcon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[#EAF2FF] capitalize">
                            {order.mealType === 'single' ? 'Full Day Meal' : order.mealType}
                          </span>
                          <Badge variant={order.status === 'skipped' ? 'amber' : 'emerald'} size="sm">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-[#71829C] truncate mt-0.5">
                          {order.status === 'skipped' ? (
                            'Marked as skipped'
                          ) : (
                            `${order.numberOfTiffins} tiffin @ ${formatCurrency(order.pricePerTiffin, settings.currencySymbol)}`
                          )}
                          {order.notes && <span className="text-[#A8B7CE] italic"> • "{order.notes}"</span>}
                        </div>
                      </div>
                    </div>

                    {/* Meal price & actions */}
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#EAF2FF] block">
                          {order.status === 'skipped' ? '₹0' : formatCurrency(order.totalAmount, settings.currencySymbol)}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5">
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
          ))
        )}
      </div>

      {/* Edit Order Modal */}
      <Modal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        title="Edit Order Record"
        description="Modify recorded values. Historical totals will recalculate safely."
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Date"
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          {settings.trackingMode === 'detailed' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B7CE] mb-1.5">
                Meal Session
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditMealType('lunch')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    editMealType === 'lunch'
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'bg-[#0B1220] border-[#263751] text-[#A8B7CE] hover:text-white'
                  }`}
                >
                  <SunIcon className="w-4 h-4" />
                  <span>Lunch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditMealType('dinner')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                    editMealType === 'dinner'
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'bg-[#0B1220] border-[#263751] text-[#A8B7CE] hover:text-white'
                  }`}
                >
                  <MoonIcon className="w-4 h-4" />
                  <span>Dinner</span>
                </button>
              </div>
            </div>
          )}

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
            placeholder="Special requests, dish notes..."
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
        title="Confirm Record Deletion"
        description="Are you sure you want to delete this recorded transaction? This action is permanent."
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
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
