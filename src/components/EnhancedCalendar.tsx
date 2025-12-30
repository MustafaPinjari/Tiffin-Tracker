import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { notificationService, TiffinStatus } from '../services/notificationService';
import { useOrders } from '../context/OrderContext';

interface EnhancedCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string;
  onOrderUpdate: (date: string, tiffins: number) => void;
}

interface DragData {
  date: string;
  tiffins: number;
}

export function EnhancedCalendar({ onDateSelect, selectedDate, onOrderUpdate }: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedItem, setDraggedItem] = useState<DragData | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const { getAllOrders } = useOrders();
  
  const [statusHistory, setStatusHistory] = useState<TiffinStatus[]>([]);
  const allOrders = getAllOrders();

  useEffect(() => {
    loadStatusHistory();
  }, []);

  const loadStatusHistory = () => {
    const history: TiffinStatus[] = [];
    const monthStart = startOfWeek(startOfMonth(currentMonth));
    const monthEnd = endOfWeek(endOfMonth(currentMonth));
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const status = notificationService.getTiffinStatus(dateStr);
      const order = allOrders.find(o => o.date === dateStr);
      
      if (status || order) {
        history.push(status || {
          date: dateStr,
          status: order ? 'ordered' : 'pending',
          numberOfTiffins: order?.numberOfTiffins,
          totalAmount: order?.totalAmount,
          timestamp: Date.now(),
          reminderSent: false
        });
      }
    });

    setStatusHistory(history);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getStatusForDate = (date: Date): TiffinStatus | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return statusHistory.find(s => s.date === dateStr) || null;
  };

  const getStatusIcon = (status: TiffinStatus | null) => {
    if (!status) return null;
    
    switch (status.status) {
      case 'ordered':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'skipped':
        return <XCircleIcon className="h-4 w-4 text-red-400" />;
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: TiffinStatus | null, date: Date) => {
    const isSelected = format(date, 'yyyy-MM-dd') === selectedDate;
    const isTodayDate = isToday(date);
    
    if (isSelected) return 'bg-blue-600 border-blue-500';
    if (isTodayDate) return 'bg-blue-500/20 border-blue-500/50';
    
    if (!status) return 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50';
    
    switch (status.status) {
      case 'ordered':
        return 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30';
      case 'skipped':
        return 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30';
      default:
        return 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30';
    }
  };

  const handleDragStart = (date: Date, tiffins: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setDraggedItem({ date: dateStr, tiffins });
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const dateStr = format(date, 'yyyy-MM-dd');
    setHoveredDate(dateStr);
  };

  const handleDragLeave = () => {
    setHoveredDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedItem) return;

    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    if (draggedItem.date !== targetDateStr) {
      // Move the order to the new date
      onOrderUpdate(targetDateStr, draggedItem.tiffins);
      
      // Clear the original date status
      notificationService.clearTiffinStatus(draggedItem.date);
    }

    setDraggedItem(null);
    setHoveredDate(null);
    loadStatusHistory();
  };

  const handleQuickOrder = (date: Date, tiffins: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onOrderUpdate(dateStr, tiffins);
    loadStatusHistory();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  useEffect(() => {
    loadStatusHistory();
  }, [currentMonth, allOrders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('prev')}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('next')}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          </motion.button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        <AnimatePresence>
          {calendarDays.map((date, index) => {
            const status = getStatusForDate(date);
            const dateStr = format(date, 'yyyy-MM-dd');
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isHovered = hoveredDate === dateStr;
            const isDragTarget = draggedItem && draggedItem.date !== dateStr;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className={`
                  relative aspect-square rounded-xl border-2 transition-all cursor-pointer
                  ${getStatusColor(status, date)}
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isHovered && isDragTarget ? 'ring-2 ring-blue-500 scale-105' : ''}
                `}
                onClick={() => onDateSelect(dateStr)}
                onDragOver={(e) => handleDragOver(e, date)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, date)}
              >
                {/* Date Number */}
                <div className="absolute top-1 left-1 text-xs font-medium text-white">
                  {format(date, 'd')}
                </div>

                {/* Status Icon */}
                <div className="absolute top-1 right-1">
                  {getStatusIcon(status)}
                </div>

                {/* Tiffin Count */}
                {status?.numberOfTiffins && (
                  <motion.div
                    draggable
                    onDragStart={() => handleDragStart(date, status.numberOfTiffins!)}
                    className="absolute bottom-1 left-1 right-1 bg-white/10 rounded-md p-1 cursor-move"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-xs text-white text-center font-medium">
                      {status.numberOfTiffins} tiffin{status.numberOfTiffins > 1 ? 's' : ''}
                    </div>
                  </motion.div>
                )}

                {/* Quick Add Button */}
                {!status && isCurrentMonth && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickOrder(date, 1);
                    }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <PlusIcon className="h-6 w-6 text-gray-400" />
                  </motion.button>
                )}

                {/* Drag Overlay */}
                {isHovered && isDragTarget && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-blue-500/20 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-blue-400 text-xs font-medium">Drop here</div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4 text-green-400" />
          <span className="text-gray-400 text-sm">Ordered</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircleIcon className="h-4 w-4 text-red-400" />
          <span className="text-gray-400 text-sm">Skipped</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-yellow-400" />
          <span className="text-gray-400 text-sm">Pending</span>
        </div>
      </div>

      {/* Drag Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: draggedItem ? 1 : 0 }}
        className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
      >
        <p className="text-blue-400 text-sm text-center">
          Drag and drop to move your order to a different date
        </p>
      </motion.div>
    </motion.div>
  );
}