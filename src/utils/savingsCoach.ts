import { Order } from '../types';
import { calculateStatsForOrders, formatCurrency, projectMonthlySpend } from './calculations';
import { getMonthProgress, getMonthKey } from './date';

export interface CoachInsight {
  id: string;
  type: 'info' | 'positive' | 'warning' | 'tip';
  title: string;
  message: string;
  metric?: string;
}

/**
 * Generates deterministic, data-backed insights from actual user orders.
 */
export function generateSavingsInsights(
  allOrders: Order[],
  currencySymbol = '₹',
  monthlyBudget = 0
): CoachInsight[] {
  const insights: CoachInsight[] = [];
  const activeOrders = allOrders.filter(o => o.status === 'ordered');

  if (activeOrders.length === 0) {
    return [
      {
        id: 'no-data',
        type: 'info',
        title: 'Ready to Coach You',
        message: 'Log your first meal to unlock personalized spending trends, cost per meal averages, and budget insights.'
      }
    ];
  }

  // 1. Current Month vs Previous Month comparison
  const now = new Date();
  const currentMonthKey = getMonthKey(now);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = getMonthKey(prevMonthDate);

  const currentMonthOrders = activeOrders.filter(o => o.date.startsWith(currentMonthKey));
  const prevMonthOrders = activeOrders.filter(o => o.date.startsWith(prevMonthKey));

  const currentMonthStats = calculateStatsForOrders(currentMonthOrders);
  const prevMonthStats = calculateStatsForOrders(prevMonthOrders);

  if (currentMonthOrders.length > 0 && prevMonthOrders.length > 0) {
    const diff = currentMonthStats.totalAmount - prevMonthStats.totalAmount;
    if (diff > 0) {
      insights.push({
        id: 'month-comparison-higher',
        type: 'warning',
        title: 'Spending Up vs Last Month',
        message: `Your spending this month is ${formatCurrency(Math.abs(diff), currencySymbol)} higher than last month's full total (${formatCurrency(prevMonthStats.totalAmount, currencySymbol)}).`,
        metric: `+${formatCurrency(diff, currencySymbol)}`
      });
    } else if (diff < 0) {
      insights.push({
        id: 'month-comparison-lower',
        type: 'positive',
        title: 'Lower Spending Pace',
        message: `You've spent ${formatCurrency(Math.abs(diff), currencySymbol)} less so far compared to all of last month. Great budget discipline!`,
        metric: `-${formatCurrency(Math.abs(diff), currencySymbol)}`
      });
    }
  }

  // 2. Average cost per meal
  const overallStats = calculateStatsForOrders(activeOrders);
  if (overallStats.totalOrders > 0) {
    insights.push({
      id: 'avg-cost-per-meal',
      type: 'info',
      title: 'Average Meal Cost',
      message: `Across all ${overallStats.totalOrders} recorded orders, your average expense per meal is ${formatCurrency(overallStats.averagePerMeal, currencySymbol)}.`,
      metric: `${formatCurrency(overallStats.averagePerMeal, currencySymbol)}/meal`
    });
  }

  // 3. Monthly projection and budget pace
  if (currentMonthOrders.length > 0) {
    const { currentDay, totalDays } = getMonthProgress(now.toISOString().split('T')[0]);
    const { projectedTotal } = projectMonthlySpend(currentMonthStats.totalAmount, currentDay, totalDays);

    if (monthlyBudget > 0) {
      if (projectedTotal > monthlyBudget) {
        const overage = projectedTotal - monthlyBudget;
        insights.push({
          id: 'budget-projection-over',
          type: 'warning',
          title: 'Projected Budget Overage',
          message: `At your current pace (${currentDay} days into the month), you are on track to spend ${formatCurrency(projectedTotal, currencySymbol)}, which exceeds your ${formatCurrency(monthlyBudget, currencySymbol)} budget by ${formatCurrency(overage, currencySymbol)}.`,
          metric: formatCurrency(projectedTotal, currencySymbol)
        });
      } else {
        const remaining = monthlyBudget - projectedTotal;
        insights.push({
          id: 'budget-projection-safe',
          type: 'positive',
          title: 'On Track with Budget',
          message: `Your projected month-end spend is ${formatCurrency(projectedTotal, currencySymbol)}, keeping you comfortably within your ${formatCurrency(monthlyBudget, currencySymbol)} budget with ${formatCurrency(remaining, currencySymbol)} to spare.`,
          metric: `Under by ${formatCurrency(remaining, currencySymbol)}`
        });
      }
    } else {
      insights.push({
        id: 'monthly-projection',
        type: 'info',
        title: 'Month-End Projection',
        message: `Based on your logging pace through day ${currentDay}, your estimated total for this month will be approximately ${formatCurrency(projectedTotal, currencySymbol)}.`,
        metric: formatCurrency(projectedTotal, currencySymbol)
      });
    }
  }

  // 4. Most active / expensive weekday analysis
  if (activeOrders.length >= 7) {
    const weekdayAmounts: { [day: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const weekdayCounts: { [day: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    activeOrders.forEach(order => {
      const parts = order.date.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const day = d.getDay();
      weekdayAmounts[day] += order.totalAmount;
      weekdayCounts[day] += 1;
    });

    let highestDay = 1;
    let highestSpend = 0;
    Object.keys(weekdayAmounts).forEach(d => {
      const dayNum = parseInt(d, 10);
      if (weekdayAmounts[dayNum] > highestSpend) {
        highestSpend = weekdayAmounts[dayNum];
        highestDay = dayNum;
      }
    });

    if (highestSpend > 0) {
      insights.push({
        id: 'peak-spending-day',
        type: 'tip',
        title: 'Peak Spending Day',
        message: `${dayNames[highestDay]}s account for your highest overall tiffin spend (${formatCurrency(highestSpend, currencySymbol)} across ${weekdayCounts[highestDay]} orders).`,
        metric: dayNames[highestDay]
      });
    }
  }

  // 5. Skipped meals tracking
  const skippedCount = allOrders.filter(o => o.status === 'skipped').length;
  if (skippedCount > 0) {
    insights.push({
      id: 'skipped-meals-note',
      type: 'info',
      title: 'Skipped Meals Recorded',
      message: `You have logged ${skippedCount} skipped meal${skippedCount > 1 ? 's' : ''}. Tracking skipped meals helps ensure vendors do not bill you for days you didn't receive tiffin.`,
      metric: `${skippedCount} skipped`
    });
  }

  return insights;
}
