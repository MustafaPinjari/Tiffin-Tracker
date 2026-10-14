import React, { useState } from 'react';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/calculations';
import { formatDisplayDate, formatDateSafe } from '../../utils/date';

interface SpendingChartProps {
  orders: Order[];
  currencySymbol: string;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ orders, currencySymbol }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate data for the past 7 days
  const today = new Date();
  const daysData = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(today.getTime() - (6 - index) * 24 * 60 * 60 * 1000);
    const dateStr = formatDateSafe(d);
    const dayOrders = orders.filter(o => o.date === dateStr && o.status === 'ordered');
    const amount = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const tiffins = dayOrders.reduce((sum, o) => sum + o.numberOfTiffins, 0);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = index === 6;

    return {
      dateStr,
      dayLabel,
      amount,
      tiffins,
      isToday,
    };
  });

  const maxAmount = Math.max(...daysData.map(d => d.amount), 50);
  const totalWeekSpend = daysData.reduce((sum, d) => sum + d.amount, 0);
  const hasData = daysData.some(d => d.amount > 0);

  return (
    <div className="bg-[#111B2E] border border-[#263751] rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#263751]">
        <div>
          <h2 className="text-sm font-bold text-[#EAF2FF] tracking-tight">
            7-Day Spending Velocity
          </h2>
          <p className="text-xs text-[#71829C] mt-0.5">
            Daily meal expenses over the past week
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#71829C] font-medium block">7-Day Outlay</span>
          <span className="text-base font-extrabold text-[#38BDF8] tracking-tight">
            {formatCurrency(totalWeekSpend, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Visualization Canvas */}
      {!hasData ? (
        <div className="h-40 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#0B1220]/60 border border-[#263751]/60">
          <span className="text-xs font-semibold text-[#A8B7CE]">No orders logged in the past 7 days</span>
          <span className="text-[11px] text-[#71829C] mt-1 max-w-xs">
            Log your daily tiffins to generate automatic velocity trends and expense breakdowns.
          </span>
        </div>
      ) : (
        <div className="relative pt-2">
          {/* Tooltip HUD */}
          <div className="h-6 flex items-center justify-between text-xs text-[#A8B7CE] mb-2 px-1">
            {hoveredIndex !== null ? (
              <span className="text-[#38BDF8] font-semibold animate-fadeIn">
                {daysData[hoveredIndex].dayLabel} ({formatDisplayDate(daysData[hoveredIndex].dateStr)}):{' '}
                <strong className="text-white">
                  {formatCurrency(daysData[hoveredIndex].amount, currencySymbol)}
                </strong>{' '}
                ({daysData[hoveredIndex].tiffins} tiffins)
              </span>
            ) : (
              <span className="text-[11px] text-[#71829C]">
                Hover over bars to inspect daily breakdowns
              </span>
            )}
          </div>

          {/* Bar Chart Area */}
          <div className="grid grid-cols-7 gap-2 items-end h-32 px-1">
            {daysData.map((d, index) => {
              const heightPercent = d.amount > 0 ? Math.max((d.amount / maxAmount) * 100, 10) : 4;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={d.dateStr}
                  className="flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* The Bar */}
                  <div className="w-full max-w-[36px] bg-[#0B1220] rounded-lg p-0.5 flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-md transition-all duration-200 ${
                        d.isToday
                          ? 'bg-gradient-to-t from-[#2563EB] to-[#38BDF8] shadow-md shadow-[#2563EB]/40'
                          : d.amount > 0
                          ? isHovered
                            ? 'bg-[#3B82F6]'
                            : 'bg-[#2563EB]'
                          : 'bg-[#17243A]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[11px] font-semibold transition-colors ${
                      d.isToday
                        ? 'text-[#38BDF8] font-bold'
                        : isHovered
                        ? 'text-[#EAF2FF]'
                        : 'text-[#71829C]'
                    }`}
                  >
                    {d.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
