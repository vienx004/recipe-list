/**
 * @file components/CalendarView.tsx
 * @description Provides an Outlook-like calendar interface.
 * Merges recipes into specific days based on their `scheduledDate`.
 */

import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, ChefHat } from 'lucide-react';
import { useStore } from '../lib/store';

export const CalendarView: React.FC = () => {
  const { recipes } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Determine recipes scheduled on a specific day
  const getRecipesForDay = (day: Date) => {
    return recipes.filter(r => r.scheduledDate && isSameDay(new Date(r.scheduledDate), day));
  };

  return (
    <div className="animate-in fade-in zoom-in duration-500 h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Meal Calendar</h2>
          <p className="text-textSecondary">Plan your meals for the week.</p>
        </div>
        
        <div className="flex items-center gap-4 glass-panel px-4 py-2 rounded-xl">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-textSecondary hover:text-white" />
          </button>
          <span className="text-lg font-bold min-w-[140px] text-center text-primary">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-textSecondary hover:text-white" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden border border-white/10 flex flex-col min-h-[600px]">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-surface/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-textSecondary uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, i) => {
            const dayRecipes = getRecipesForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div 
                key={i} 
                className={`min-h-[120px] p-2 border-b border-r border-white/5 transition-colors group
                  ${isCurrentMonth ? 'bg-background/20' : 'bg-background/50 opacity-50'}
                  ${isToday ? 'bg-primary/5' : ''}
                  hover:bg-surface/50
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-textSecondary'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                  {dayRecipes.map(r => (
                    <div 
                      key={r.id} 
                      className="text-xs bg-gradient-to-r from-accent/20 to-primary/20 border border-white/10 px-2 py-1.5 rounded-lg text-white truncate flex items-center gap-1 group-hover:from-accent/30 group-hover:to-primary/30 transition-all cursor-pointer"
                      title={r.title}
                    >
                      <ChefHat size={12} className="shrink-0 text-accent" />
                      <span className="truncate">{r.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
