/**
 * @file components/CalendarView.tsx
 * @description Provides an Outlook-like calendar interface.
 * Merges recipes into specific days based on their `scheduledDate`.
 * Supports Month, Week, and 3-Day views dynamically rendering varying grid columns.
 */

import React, { useState } from 'react';
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  startOfMonth, endOfMonth, isSameMonth, isSameDay,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, ChefHat, CalendarDays, Calendar as CalWeek, CalendarRange, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { generateRecipe } from '../lib/gemini';

type ViewMode = 'month' | 'week' | '3-day';

export const CalendarView: React.FC = () => {
  const { recipes, updateRecipe, setSelectedRecipe, addRecipe } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = window.matchMedia("(max-width: 768px)").matches ? useState<ViewMode>('3-day') : useState<ViewMode>('month');

  const [searchingDate, setSearchingDate] = useState<Date | null>(null);
  const [inlineQuery, setInlineQuery] = useState('');
  const [inlineLoading, setInlineLoading] = useState(false);

  // Generate calendar grid based on mode
  let calendarDays: Date[] = [];
  if (viewMode === 'month') {
    calendarDays = eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate)),
      end: endOfWeek(endOfMonth(currentDate)),
    });
  } else if (viewMode === 'week') {
    calendarDays = eachDayOfInterval({
      start: startOfWeek(currentDate),
      end: endOfWeek(currentDate),
    });
  } else if (viewMode === '3-day') {
    calendarDays = eachDayOfInterval({
      start: currentDate,
      end: addDays(currentDate, 2),
    });
  }

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (viewMode === '3-day') setCurrentDate(addDays(currentDate, 3));
  };

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    if (viewMode === '3-day') setCurrentDate(subDays(currentDate, 3));
  };

  // Determine recipes scheduled on a specific day
  const getRecipesForDay = (day: Date) => {
    return recipes.filter(r => r.scheduledDate && isSameDay(new Date(r.scheduledDate), day));
  };

  const handleInlineSearch = async (e: React.FormEvent, targetDate: Date) => {
    e.preventDefault();
    if (!inlineQuery.trim() || inlineLoading) return;

    setInlineLoading(true);
    try {
      const q = inlineQuery.toLowerCase().trim();
      const existing = recipes.find(r => r.title.toLowerCase().includes(q));

      let recipeToSchedule;
      if (existing) {
        recipeToSchedule = existing;
      } else {
        const generated = await generateRecipe(inlineQuery);
        recipeToSchedule = await addRecipe(generated);
      }

      await updateRecipe({ ...recipeToSchedule, scheduledDate: targetDate.toISOString() });
      setSearchingDate(null);
      setInlineQuery('');
    } catch (err) {
      console.error(err);
      alert("Failed to find or generate recipe.");
    } finally {
      setInlineLoading(false);
    }
  };

  const gridColsClass = viewMode === '3-day' ? 'grid-cols-3' : 'grid-cols-7';

  // Extract subset of days to use as headers (always matching length of grid columns)
  const headerDays = calendarDays.slice(0, viewMode === '3-day' ? 3 : 7);

  return (
    <div className="animate-in fade-in zoom-in duration-500 h-full flex flex-col min-h-full">
      {/* Calendar Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-3xl font-bold text-textPrimary mb-1">Meal Calendar</h2>
          <p className="text-textSecondary">Plan your meals on your exact timeline.</p>
        </div>

        {/* Toggle Controls */}
        <div className="glass-panel p-1.5 rounded-xl flex gap-1 bg-surface border border-secondary/20 shadow-sm w-full md:w-auto overflow-x-auto justify-center">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${viewMode === 'month' ? 'bg-secondary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary hover:bg-black/5'}`}
          >
            <CalendarDays size={16} /> Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${viewMode === 'week' ? 'bg-secondary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary hover:bg-black/5'}`}
          >
            <CalWeek size={16} /> Week
          </button>
          <button
            onClick={() => setViewMode('3-day')}
            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${viewMode === '3-day' ? 'bg-secondary text-white shadow-md' : 'text-textSecondary hover:text-textPrimary hover:bg-black/5'}`}
          >
            <CalendarRange size={16} /> 3-Day
          </button>
        </div>

        <div className="flex items-center gap-4 glass-panel px-4 py-2 flex-shrink-0 w-full md:w-auto justify-between md:justify-end rounded-xl border border-secondary/20 shadow-sm">
          <button onClick={handlePrev} className="p-2 hover:bg-secondary/10 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-textSecondary hover:text-textPrimary" />
          </button>
          <span className="text-lg font-bold min-w-[150px] text-center text-textPrimary">
            {viewMode === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : `${format(calendarDays[0], 'MMM d')} - ${format(calendarDays[calendarDays.length - 1], 'MMM d')}`
            }
          </span>
          <button onClick={handleNext} className="p-2 hover:bg-secondary/10 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-textSecondary hover:text-textPrimary" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 glass-panel rounded-2xl overflow-hidden border border-secondary/20 flex flex-col min-h-[600px] shadow-sm">
        {/* Dynamic Days Header */}
        <div className={`grid border-b border-secondary/20 bg-surface/50 ${gridColsClass}`}>
          {headerDays.map((day, i) => (
            <div key={i} className="py-3 text-center text-sm font-semibold text-textSecondary uppercase tracking-wider">
              {format(day, 'EEE')} {viewMode === '3-day' ? format(day, '(d)') : ''}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className={`grid flex-1 ${gridColsClass}`}>
          {calendarDays.map((day, i) => {
            const dayRecipes = getRecipesForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            // Render non-current month days heavily faded
            const opacityClass = (isCurrentMonth || viewMode !== 'month') ? 'bg-surface' : 'bg-background/40 opacity-70';

            return (
              <div
                key={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const recipeId = e.dataTransfer.getData('text/plain');
                  const recipe = recipes.find(r => r.id === recipeId);
                  if (recipe) {
                    updateRecipe({ ...recipe, scheduledDate: day.toISOString() });
                  }
                }}
                className={`min-h-[140px] flex flex-col p-3 border-b border-r border-secondary/20 transition-colors group relative
                  ${opacityClass}
                  ${isToday ? 'bg-secondary/5' : ''}
                  hover:bg-secondary/10
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all
                    ${isToday ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'text-textSecondary group-hover:text-textPrimary'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[160px] custom-scrollbar flex-1">
                  {dayRecipes.map(r => (
                    <div
                      key={r.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', r.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecipe(r);
                      }}
                      className="text-xs bg-gradient-to-r from-accent/10 to-secondary/10 border border-secondary/30 px-3 py-2 rounded-xl text-textPrimary truncate flex items-center justify-between gap-2 hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow group/pill"
                      title={r.title}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ChefHat size={14} className="shrink-0 text-accent" />
                        <span className="truncate whitespace-normal leading-tight font-medium">{r.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRecipe({ ...r, scheduledDate: undefined });
                        }}
                        className="text-textSecondary hover:text-red-500 opacity-0 group-hover/pill:opacity-100 transition-opacity p-0.5 rounded-md hover:bg-red-500/10 shrink-0"
                        title="Remove from calendar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {searchingDate && isSameDay(searchingDate, day) && (
                  <div className="absolute z-50 bottom-12 left-1/2 -translate-x-1/2 w-[260px]">
                    <form onSubmit={(e) => handleInlineSearch(e, day)} className="bg-surface p-3 rounded-2xl shadow-2xl shadow-black/10 border border-secondary/30 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-secondary">Schedule for {format(day, 'MMM d')}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setSearchingDate(null);
                          }}
                          className="text-textSecondary hover:text-red-500 rounded-full p-1 hover:bg-red-500/10 transition-colors"
                          title="Cancel"
                        >
                          <Trash2 size={12} className="opacity-0 w-0 h-0 absolute hidden" />
                          {/* using an X icon would be functionally ideal but for simplicity we can use text or just close it */}
                          <span className="text-[10px] font-bold uppercase tracking-wider">Close</span>
                        </button>
                      </div>
                      <div className="relative w-full">
                        <input
                          autoFocus
                          type="text"
                          value={inlineQuery}
                          onChange={(e) => setInlineQuery(e.target.value)}
                          placeholder="Search or ask AI..."
                          className="w-full text-sm p-2.5 pr-9 rounded-xl border border-secondary/20 bg-background focus:outline-none focus:border-secondary transition-colors"
                        />
                        <button type="submit" disabled={inlineLoading} className="absolute right-2.5 top-2.5 text-secondary hover:text-accent disabled:opacity-50 transition-colors">
                          {inlineLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {(!searchingDate || !isSameDay(searchingDate, day)) && (
                  <button
                    onClick={() => { setSearchingDate(day); setInlineQuery(''); }}
                    className="mt-auto opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 w-[90%] mx-auto bg-secondary/10 hover:bg-secondary/20 text-secondary rounded py-1.5 transition-all text-xs font-semibold"
                    title="Add recipe"
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
