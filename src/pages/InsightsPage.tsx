import React, { useState } from 'react';
import {
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  BookmarkSquareIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { Badge, Button } from '../components/ui';
import {
  getTodayDateString,
  getMonthKey,
  formatMonthName,
  getMonthProgress,
  parseDateSafe,
  formatDateSafe
} from '../utils/date';
import {
  formatCurrency,
  calculateBudgetStatus,
  projectMonthlySpend,
  calculateStatsForOrders
} from '../utils/calculations';
import { generateSavingsInsights } from '../utils/savingsCoach';
import { NavLink } from 'react-router-dom';

export const InsightsPage: React.FC = () => {
  const { orders, settings } = useApp();
  const todayStr = getTodayDateString();
  const currentMonthKey = getMonthKey(todayStr);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  // Month orders and stats
  const activeOrders = orders.filter(o => o.status === 'ordered');
  const monthOrders = activeOrders.filter(o => o.date.startsWith(selectedMonth));
  const monthStats = calculateStatsForOrders(monthOrders);

  // Previous month stats for comparison
  const monthParts = selectedMonth.split('-');
  const prevMonthDate = new Date(parseInt(monthParts[0], 10), parseInt(monthParts[1], 10) - 2, 1);
  const prevMonthKey = getMonthKey(prevMonthDate);
  const prevMonthOrders = activeOrders.filter(o => o.date.startsWith(prevMonthKey));
  const prevMonthStats = calculateStatsForOrders(prevMonthOrders);

  const spendDifference = monthStats.totalAmount - prevMonthStats.totalAmount;
  const spendDiffPercent = prevMonthStats.totalAmount > 0
    ? Math.round((Math.abs(spendDifference) / prevMonthStats.totalAmount) * 100)
    : 0;

  // Budget calculations
  const budgetStatus = calculateBudgetStatus(
    monthStats.totalAmount,
    settings.monthlyBudget,
    settings.budgetAlertThreshold
  );

  // Projections
  const { currentDay, totalDays } = getMonthProgress(todayStr);
  const { projectedTotal, dailyPace } = projectMonthlySpend(monthStats.totalAmount, currentDay, totalDays);

  // Smart Savings Coach insights
  const coachInsights = generateSavingsInsights(orders, settings.currencySymbol, settings.monthlyBudget);

  // Meal type breakdown
  const lunchOrders = monthOrders.filter(o => o.mealType === 'lunch');
  const dinnerOrders = monthOrders.filter(o => o.mealType === 'dinner');
  const singleOrders = monthOrders.filter(o => o.mealType === 'single');

  // Gamification: Streak calculation
  const uniqueDates = Array.from(new Set(activeOrders.map(o => o.date))).sort().reverse();
  let currentStreak = 0;
  if (uniqueDates.length > 0) {
    let checkDate = parseDateSafe(todayStr);
    if (!uniqueDates.includes(todayStr)) {
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    }
    while (true) {
      const dateStr = formatDateSafe(checkDate);
      if (uniqueDates.includes(dateStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Milestone Badges
  const badges = [
    {
      id: 'first_meal',
      title: 'First Log',
      desc: 'Recorded first tiffin transaction',
      icon: <CheckCircleIcon className="w-5 h-5 text-[#38BDF8]" />,
      unlocked: activeOrders.length >= 1
    },
    {
      id: 'streak_3',
      title: '3-Day Rhythm',
      desc: 'Logged 3 consecutive days',
      icon: <FireIcon className="w-5 h-5 text-[#FBBF24]" />,
      unlocked: currentStreak >= 3
    },
    {
      id: 'streak_7',
      title: '7-Day Champion',
      desc: 'One full week of consistency',
      icon: <FireIcon className="w-5 h-5 text-[#FB7185]" />,
      unlocked: currentStreak >= 7
    },
    {
      id: 'ten_meals',
      title: 'Double Digits',
      desc: 'Recorded 10 total tiffins',
      icon: <TrophyIcon className="w-5 h-5 text-[#34D399]" />,
      unlocked: monthStats.totalTiffins >= 10
    }
  ];

  // Month heatmap computation
  const daysInMonth = new Date(parseInt(monthParts[0], 10), parseInt(monthParts[1], 10), 0).getDate();
  const heatmapDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const dayOrders = orders.filter(o => o.date === dateStr);
    const hasOrdered = dayOrders.some(o => o.status === 'ordered');
    const hasSkipped = dayOrders.some(o => o.status === 'skipped');
    return { dayNum, dateStr, hasOrdered, hasSkipped };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#263751]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#EAF2FF] tracking-tight">
            Spending & Expense Analytics
          </h1>
          <p className="text-xs text-[#A8B7CE] mt-0.5">
            Audit monthly burn rate, budget thresholds, and consistency
          </p>
        </div>

        {/* Month Selector */}
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          aria-label="Select month for analytics"
          className="bg-[#111B2E] border border-[#263751] rounded-xl px-3.5 py-1.5 text-xs font-semibold text-[#EAF2FF] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] self-start sm:self-auto"
        />
      </div>

      {/* Main Month Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#111B2E] border border-[#263751] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#71829C] uppercase block mb-1">
            Total Spend
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#EAF2FF] tracking-tight">
            {formatCurrency(monthStats.totalAmount, settings.currencySymbol)}
          </div>
          <span className="text-[11px] text-[#A8B7CE] block mt-1">
            {formatMonthName(selectedMonth)}
          </span>
        </div>

        <div className="bg-[#111B2E] border border-[#263751] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#71829C] uppercase block mb-1">
            Tiffins Consumed
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8] tracking-tight">
            {monthStats.totalTiffins}
          </div>
          <span className="text-[11px] text-[#A8B7CE] block mt-1">
            Across {monthStats.totalOrders} order{monthStats.totalOrders !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="bg-[#111B2E] border border-[#263751] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#71829C] uppercase block mb-1">
            Avg Per Meal
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#EAF2FF] tracking-tight">
            {formatCurrency(monthStats.averagePerMeal, settings.currencySymbol)}
          </div>
          <span className="text-[11px] text-[#A8B7CE] block mt-1">
            Effective unit expense
          </span>
        </div>

        <div className="bg-[#111B2E] border border-[#263751] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-[#71829C] uppercase block mb-1">
            Daily Burn Pace
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#34D399] tracking-tight">
            {formatCurrency(dailyPace, settings.currencySymbol)}
          </div>
          <span className="text-[11px] text-[#A8B7CE] block mt-1">
            Avg pace through day {currentDay}
          </span>
        </div>
      </div>

      {/* Month Comparison Card */}
      {prevMonthStats.totalOrders > 0 && (
        <div className="bg-[#111B2E] border border-[#263751] rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              spendDifference > 0
                ? 'bg-[#FBBF24]/10 text-[#FBBF24]'
                : 'bg-[#34D399]/10 text-[#34D399]'
            }`}>
              {spendDifference > 0 ? (
                <ArrowTrendingUpIcon className="w-5 h-5" />
              ) : (
                <ArrowTrendingDownIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#EAF2FF]">
                Compared to Prior Month ({formatMonthName(prevMonthKey)})
              </h3>
              <p className="text-[11px] text-[#A8B7CE] mt-0.5">
                Prior month closed at {formatCurrency(prevMonthStats.totalAmount, settings.currencySymbol)} ({prevMonthStats.totalTiffins} tiffins).
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-sm font-extrabold ${spendDifference > 0 ? 'text-[#FBBF24]' : 'text-[#34D399]'}`}>
              {spendDifference > 0 ? `+${formatCurrency(spendDifference, settings.currencySymbol)}` : `-${formatCurrency(Math.abs(spendDifference), settings.currencySymbol)}`}
            </span>
            <span className="text-[10px] text-[#71829C] block uppercase tracking-wider">
              {spendDiffPercent}% {spendDifference > 0 ? 'increase' : 'decrease'}
            </span>
          </div>
        </div>
      )}

      {/* Meal Type Distribution */}
      <div className="bg-[#111B2E] border border-[#263751] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A8B7CE]">
            Meal Distribution Breakdown ({formatMonthName(selectedMonth)})
          </span>
          <span className="text-xs text-[#71829C]">
            {monthOrders.length} total sessions
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0B1220] p-3 rounded-xl border border-[#263751] text-center">
            <div className="w-7 h-7 rounded-lg bg-[#111B2E] text-[#FBBF24] flex items-center justify-center mx-auto mb-1">
              <SunIcon className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#A8B7CE] block font-semibold">Lunch</span>
            <span className="text-sm font-bold text-[#EAF2FF] block mt-0.5">{lunchOrders.length}</span>
            <span className="text-[10px] text-[#71829C]">
              {formatCurrency(lunchOrders.reduce((sum, o) => sum + o.totalAmount, 0), settings.currencySymbol)}
            </span>
          </div>
          <div className="bg-[#0B1220] p-3 rounded-xl border border-[#263751] text-center">
            <div className="w-7 h-7 rounded-lg bg-[#111B2E] text-[#38BDF8] flex items-center justify-center mx-auto mb-1">
              <MoonIcon className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#A8B7CE] block font-semibold">Dinner</span>
            <span className="text-sm font-bold text-[#EAF2FF] block mt-0.5">{dinnerOrders.length}</span>
            <span className="text-[10px] text-[#71829C]">
              {formatCurrency(dinnerOrders.reduce((sum, o) => sum + o.totalAmount, 0), settings.currencySymbol)}
            </span>
          </div>
          <div className="bg-[#0B1220] p-3 rounded-xl border border-[#263751] text-center">
            <div className="w-7 h-7 rounded-lg bg-[#111B2E] text-[#34D399] flex items-center justify-center mx-auto mb-1">
              <BookmarkSquareIcon className="w-4 h-4" />
            </div>
            <span className="text-xs text-[#A8B7CE] block font-semibold">Single Order</span>
            <span className="text-sm font-bold text-[#EAF2FF] block mt-0.5">{singleOrders.length}</span>
            <span className="text-[10px] text-[#71829C]">
              {formatCurrency(singleOrders.reduce((sum, o) => sum + o.totalAmount, 0), settings.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Budget Management Section */}
      <div className="bg-[#111B2E] border border-[#263751] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#263751]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center">
              <BanknotesIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#EAF2FF] tracking-tight">
                Monthly Budget Utilization
              </h2>
              <p className="text-xs text-[#71829C]">
                Track real spending against your target cap
              </p>
            </div>
          </div>

          {settings.monthlyBudget > 0 ? (
            <Badge variant={budgetStatus.isOverBudget ? 'red' : budgetStatus.isNearThreshold ? 'amber' : 'emerald'}>
              {budgetStatus.utilizationPercent}% Used
            </Badge>
          ) : (
            <NavLink to="/settings">
              <Button variant="outline" size="sm">
                Set Budget
              </Button>
            </NavLink>
          )}
        </div>

        {settings.monthlyBudget > 0 ? (
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#0B1220] rounded-full overflow-hidden border border-[#263751] p-0.5">
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

            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              <div className="bg-[#0B1220] p-2.5 rounded-xl border border-[#263751]">
                <span className="text-[11px] text-[#71829C] block">Spent</span>
                <span className="text-sm font-bold text-[#EAF2FF]">
                  {formatCurrency(budgetStatus.spent, settings.currencySymbol)}
                </span>
              </div>
              <div className="bg-[#0B1220] p-2.5 rounded-xl border border-[#263751]">
                <span className="text-[11px] text-[#71829C] block">Remaining</span>
                <span className={`text-sm font-bold ${budgetStatus.isOverBudget ? 'text-[#FB7185]' : 'text-[#34D399]'}`}>
                  {formatCurrency(budgetStatus.remaining, settings.currencySymbol)}
                </span>
              </div>
              <div className="bg-[#0B1220] p-2.5 rounded-xl border border-[#263751]">
                <span className="text-[11px] text-[#71829C] block">Projected Total</span>
                <span className="text-sm font-bold text-[#38BDF8]">
                  {formatCurrency(projectedTotal, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#0B1220] rounded-2xl border border-[#263751] flex items-center justify-between">
            <span className="text-xs text-[#A8B7CE]">No budget limit configured for this month</span>
            <NavLink to="/settings">
              <span className="text-xs font-semibold text-[#38BDF8] hover:underline">Configure →</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Smart Savings Coach Deck */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-[#38BDF8]" />
          <h2 className="text-sm font-bold text-[#EAF2FF] tracking-tight">
            Deterministic Savings Coach
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coachInsights.map(insight => (
            <div
              key={insight.id}
              className="p-4 rounded-2xl bg-[#111B2E] border border-[#263751] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-xs font-bold text-[#EAF2FF]">
                    {insight.title}
                  </h3>
                  {insight.metric && (
                    <Badge variant={insight.type === 'positive' ? 'emerald' : insight.type === 'warning' ? 'amber' : 'blue'} size="sm">
                      {insight.metric}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#A8B7CE] leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamification & Streaks (If enabled) */}
      {settings.gamificationEnabled && (
        <div className="bg-[#111B2E] border border-[#263751] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#263751]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FBBF24]/15 text-[#FBBF24] flex items-center justify-center">
                <TrophyIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#EAF2FF] tracking-tight">
                  Personal Milestones & Activity Map
                </h2>
                <p className="text-xs text-[#71829C]">
                  Consistency streak and logging milestones
                </p>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24] px-3 py-1 rounded-xl font-bold text-xs">
              <FireIcon className="w-4 h-4 text-[#FBBF24]" />
              <span>{currentStreak} Day{currentStreak !== 1 ? 's' : ''} Streak</span>
            </div>
          </div>

          {/* Monthly Heatmap */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#71829C] flex items-center gap-1.5">
                <CalendarDaysIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{formatMonthName(selectedMonth)} Activity Map</span>
              </span>
              <div className="flex items-center gap-3 text-[10px] text-[#71829C]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#2563EB] inline-block" /> Ordered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#FBBF24] inline-block" /> Skipped
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-[#17243A] inline-block" /> None
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 p-3 bg-[#0B1220] rounded-2xl border border-[#263751]">
              {heatmapDays.map(day => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.hasOrdered ? 'Ordered' : day.hasSkipped ? 'Skipped' : 'No record'}`}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold transition-all ${
                    day.hasOrdered
                      ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                      : day.hasSkipped
                      ? 'bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#FBBF24]'
                      : 'bg-[#111B2E] text-[#71829C] border border-[#263751]/40'
                  }`}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          </div>

          {/* Badges Grid */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71829C] block mb-2">
              Milestone Badges
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {badges.map(b => (
                <div
                  key={b.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    b.unlocked
                      ? 'bg-[#17243A] border-[#2563EB]/40 shadow-sm'
                      : 'bg-[#0B1220] border-[#263751]/40 opacity-40'
                  }`}
                >
                  <div className="mb-1.5">{b.icon}</div>
                  <div className="text-xs font-bold text-[#EAF2FF] truncate">
                    {b.title}
                  </div>
                  <div className="text-[10px] text-[#71829C] leading-tight mt-0.5">
                    {b.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
