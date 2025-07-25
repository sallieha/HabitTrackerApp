import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useMoodStore } from '../stores/moodStore';

import { format, startOfMonth, endOfMonth, isBefore, isAfter, parseISO, isEqual, isToday as isDateToday, addMonths, subMonths, eachDayOfInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

// Cache for storing previous data to show instantly
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Memoized day cell component for better performance
const DayCell = React.memo(({ 
  date, 
  goals, 
  completions, 
  misses, 
  view, 
  selectedDate, 
  expandedDates, 
  onGoalAction, 
  onToggleExpansion 
}: {
  date: Date;
  goals: any[];
  completions: any[];
  misses: any[];
  view: 'month' | 'week';
  selectedDate: Date | null;
  expandedDates: Set<string>;
  onGoalAction: (goalId: string, date: string, action: 'complete' | 'miss') => void;
  onToggleExpansion: (dateStr: string) => void;
}) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const isToday = isDateToday(date);
  const isSelected = selectedDate && isEqual(date, selectedDate);
  const isExpanded = expandedDates.has(dateStr);

  // Memoize goals for this date to avoid recalculation
  const dayGoals = useMemo(() => {
    const dayOfWeek = format(date, 'EEEE');
    
    return goals.filter(goal => {
      const startDate = parseISO(goal.start_date);
      const endDate = goal.end_date ? parseISO(goal.end_date) : null;
      const isAfterStart = !isBefore(date, startDate);
      const isBeforeEnd = endDate ? !isAfter(date, endDate) : true;
      
      return isAfterStart && isBeforeEnd && goal.frequency.includes(dayOfWeek);
    });
  }, [goals, date]);

  // Memoize goal status checks
  const goalStatuses = useMemo(() => {
    return dayGoals.reduce((acc, goal) => {
      acc[goal.id] = {
        isCompleted: completions.some(c => c.goal_id === goal.id && c.completed_date === dateStr),
        isMissed: misses.some(m => m.goal_id === goal.id && m.missed_date === dateStr)
      };
      return acc;
    }, {} as Record<string, { isCompleted: boolean; isMissed: boolean }>);
  }, [dayGoals, completions, misses, dateStr]);

  const maxGoalsToShow = view === 'month' ? 2 : 3;

  return (
    <div
      className={`
        p-1 md:p-2 rounded-xl transition-all min-h-[60px] md:min-h-[120px]
        ${isSelected ? 'bg-white/10 ring-2 ring-indigo-500' : 'hover:bg-white/5'}
        border border-white/5
        ${view === 'week' ? 'h-full' : 'md:aspect-square'}
      `}
    >
      <div className="flex justify-between items-center mb-0.5 md:mb-2">
        {view === 'week' ? (
          <div className="flex flex-col items-center">
            <span className="text-xs text-white font-medium">
              {format(date, 'EEE')}
            </span>
            <span className={`text-xs md:text-sm font-medium mt-1 ${
              isToday 
                ? 'bg-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-black' 
                : 'text-white'
            }`}>
              {format(date, 'd')}
            </span>
          </div>
        ) : (
          <span className={`text-xs md:text-sm font-medium ${
            isToday 
              ? 'bg-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-black' 
              : 'text-white'
          }`}>
            {format(date, 'd')}
          </span>
        )}
      </div>
      <div className="space-y-0.5 md:space-y-1">
        {dayGoals.map((goal, index) => {
          if (!isExpanded && index >= maxGoalsToShow) return null;
          const status = goalStatuses[goal.id];

          return (
            <div
              key={goal.id}
              className={`
                text-left text-xs p-1 md:p-1.5 rounded-md truncate flex items-center justify-between gap-1
                transition-colors hover:bg-white/10
                ${status.isCompleted ? 'bg-green-500/10 text-green-400' : 
                  status.isMissed ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white'}
              `}
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 flex-shrink-0 rounded-full" style={{ backgroundColor: goal.color }} />
                <span className="truncate text-xs">{goal.title}</span>
              </div>
              <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
                {status.isCompleted && <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-400" />}
                {status.isMissed && <XCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-red-400" />}
                {!status.isCompleted && !status.isMissed && (
                  <>
                    <button
                      onClick={() => onGoalAction(goal.id, dateStr, 'complete')}
                      className="p-0.5 rounded hover:bg-white/10"
                    >
                      <CheckCircle2 className="h-3 w-3 text-gray-400 hover:text-green-400" />
                    </button>
                    <button
                      onClick={() => onGoalAction(goal.id, dateStr, 'miss')}
                      className="p-0.5 rounded hover:bg-white/10"
                    >
                      <XCircle className="h-3 w-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {dayGoals.length > maxGoalsToShow && !isExpanded && (
          <button
            onClick={() => onToggleExpansion(dateStr)}
            className="w-full text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 p-1"
            style={{
              color: '#FFF',
              fontFamily: 'Poppins',
              fontSize: '14.944px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '25.493px',
              letterSpacing: '-0.448px'
            }}
          >
            <ChevronDown className="h-3 w-3" />
            <span>+{dayGoals.length - maxGoalsToShow} more</span>
          </button>
        )}
        {isExpanded && (
          <button
            onClick={() => onToggleExpansion(dateStr)}
            className="w-full text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 p-1"
            style={{
              color: '#FFF',
              fontFamily: 'Poppins',
              fontSize: '14.944px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '25.493px',
              letterSpacing: '-0.448px'
            }}
          >
            <ChevronUp className="h-3 w-3" />
            <span>Show less</span>
          </button>
        )}
      </div>
    </div>
  );
});

DayCell.displayName = 'DayCell';

function CalendarPage() {
  const { goals, completions, misses, fetchGoals, fetchCompletions, fetchMisses, toggleGoalCompletion, markGoalMissed } = useGoalStore();
  const { fetchTodaysMood, fetchMonthMoods } = useMoodStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMissForm, setShowMissForm] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [missFormData, setMissFormData] = useState({ goalId: '', reason: '', improvement_plan: '' });
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false); // Start with false for instant UI
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  // Memoize date calculations to avoid recalculation on every render
  const dateInfo = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const firstDayOffset = firstDayOfMonth.getDay();

    const weekStart = startOfWeek(currentMonth);
    const weekEnd = endOfWeek(currentMonth);
    const daysInView = eachDayOfInterval({ 
      start: view === 'month' ? firstDayOfMonth : weekStart,
      end: view === 'month' ? lastDayOfMonth : weekEnd 
    });

    const start = format(view === 'month' ? startOfMonth(currentMonth) : startOfWeek(currentMonth), 'yyyy-MM-dd');
    const end = format(view === 'month' ? endOfMonth(currentMonth) : endOfWeek(currentMonth), 'yyyy-MM-dd');

    return {
      firstDayOfMonth,
      lastDayOfMonth,
      firstDayOffset,
      weekStart,
      weekEnd,
      daysInView,
      start,
      end
    };
  }, [currentMonth, view]);

  // Get cached data instantly
  const getCachedData = useCallback((key: string) => {
    const cached = dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Cache data for future use
  const setCachedData = useCallback((key: string, data: any) => {
    dataCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Load cached data immediately on mount
  useEffect(() => {
    const cacheKey = `calendar-${dateInfo.start}-${dateInfo.end}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      // Use cached data immediately - no loading screen
      setDataLoaded(true);
      setLoading(false);
    }
  }, [dateInfo.start, dateInfo.end, getCachedData]);

  // Background data loading with aggressive caching
  useEffect(() => {
    if (loadingRef.current) return;
    
    const cacheKey = `calendar-${dateInfo.start}-${dateInfo.end}`;
    const cached = getCachedData(cacheKey);
    
    const loadData = async () => {
      if (!mountedRef.current) return;
      
      loadingRef.current = true;
      
      try {
        // Only show loading if we have no cached data
        if (!cached && !dataLoaded) {
          setLoading(true);
        }
        
        setError(null);

        // Load data in parallel with timeout for faster perceived performance
        const dataPromises = [
          fetchGoals(),
          fetchCompletions(dateInfo.start, dateInfo.end),
          fetchMisses(dateInfo.start, dateInfo.end),
          fetchMonthMoods(dateInfo.start, dateInfo.end),
          fetchTodaysMood()
        ];

        // Race condition: either data loads quickly or we timeout and show cached data
        const results = await Promise.race([
          Promise.allSettled(dataPromises),
          new Promise(resolve => setTimeout(() => resolve('timeout'), 100))
        ]);

        if (!mountedRef.current) return;

        if (results !== 'timeout') {
          // Cache the successful results
          setCachedData(cacheKey, {
            goals,
            completions,
            misses,
            timestamp: Date.now()
          });
          
          setDataLoaded(true);
        }

        // Always hide loading after attempt
        setLoading(false);
        
      } catch (err) {
        if (!mountedRef.current) return;
        
        console.error('Error loading calendar data:', err);
        
        // If we have cached data, use it instead of showing error
        if (cached) {
          setDataLoaded(true);
          setLoading(false);
        } else {
          setError('Failed to load calendar data. Please try again.');
          setLoading(false);
        }
      } finally {
        loadingRef.current = false;
      }
    };

    // Immediate execution for instant UI
    loadData();

  }, [dateInfo.start, dateInfo.end, fetchCompletions, fetchGoals, fetchMisses, fetchMonthMoods, fetchTodaysMood, getCachedData, setCachedData, goals, completions, misses, dataLoaded]);

  // Preload adjacent months/weeks for instant navigation
  useEffect(() => {
    const preloadData = async () => {
      const nextMonth = view === 'month' ? addMonths(currentMonth, 1) : addDays(currentMonth, 7);
      const prevMonth = view === 'month' ? subMonths(currentMonth, 1) : addDays(currentMonth, -7);
      
      for (const month of [nextMonth, prevMonth]) {
        const start = format(view === 'month' ? startOfMonth(month) : startOfWeek(month), 'yyyy-MM-dd');
        const end = format(view === 'month' ? endOfMonth(month) : endOfWeek(month), 'yyyy-MM-dd');
        const cacheKey = `calendar-${start}-${end}`;
        
        if (!getCachedData(cacheKey)) {
          // Preload in background without affecting UI
          Promise.allSettled([
            fetchCompletions(start, end),
            fetchMisses(start, end),
            fetchMonthMoods(start, end)
          ]).then(() => {
            setCachedData(cacheKey, {
              goals,
              completions,
              misses,
              timestamp: Date.now()
            });
          }).catch(() => {
            // Ignore preload errors
          });
        }
      }
    };

    // Preload after initial data is loaded
    if (dataLoaded) {
      setTimeout(preloadData, 500);
    }
  }, [currentMonth, view, dataLoaded, fetchCompletions, fetchMisses, fetchMonthMoods, getCachedData, setCachedData, goals, completions, misses]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown && !(event.target as Element).closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  // Memoize navigation handlers
  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => view === 'month' ? subMonths(prev, 1) : addDays(prev, -7));
  }, [view]);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => view === 'month' ? addMonths(prev, 1) : addDays(prev, 7));
  }, [view]);

  // Memoize goal action handler
  const handleGoalAction = useCallback(async (goalId: string, date: string, action: 'complete' | 'miss') => {
    try {
      setError(null);
      setSelectedDate(new Date(date));
      
      if (action === 'complete') {
        await toggleGoalCompletion(goalId, date);
      } else {
        setMissFormData({ goalId, reason: '', improvement_plan: '' });
        setShowMissForm(true);
      }
    } catch (err) {
      console.error('Error handling goal action:', err);
      setError('Failed to update goal status. Please try again.');
    }
  }, [toggleGoalCompletion]);

  // Memoize toggle expansion handler
  const toggleDateExpansion = useCallback((dateStr: string) => {
    setExpandedDates(prev => {
      const newExpandedDates = new Set(prev);
      if (newExpandedDates.has(dateStr)) {
        newExpandedDates.delete(dateStr);
      } else {
        newExpandedDates.add(dateStr);
      }
      return newExpandedDates;
    });
  }, []);

  const handleMissSubmit = async () => {
    if (selectedDate && missFormData.goalId) {
      try {
        setError(null);
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        await markGoalMissed(
          missFormData.goalId,
          dateStr,
          missFormData.reason,
          missFormData.improvement_plan
        );
        
        // Refresh only the necessary data
        await Promise.allSettled([
          fetchCompletions(dateInfo.start, dateInfo.end),
          fetchMisses(dateInfo.start, dateInfo.end)
        ]);
        
        setShowMissForm(false);
        setMissFormData({ goalId: '', reason: '', improvement_plan: '' });
      } catch (err) {
        console.error('Error submitting miss:', err);
        setError('Failed to mark goal as missed. Please try again.');
      }
    }
  };

  // Memoize view change handler to prevent unnecessary re-renders
  const handleViewChange = useCallback((newView: 'month' | 'week') => {
    if (newView !== view) {
      setView(newView);
      setExpandedDates(new Set()); // Clear expanded dates when changing views
    }
  }, [view]);

  // Show minimal loading only if no data is available at all
  if (loading && !dataLoaded && goals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading calendar...</div>
      </div>
    );
  }

  if (error && !dataLoaded) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 hover:text-red-300 transition-colors"
          style={{
            color: '#FFF',
            fontFamily: 'Poppins',
            fontSize: '14.944px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '25.493px',
            letterSpacing: '-0.448px'
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <h1 className="text-center mr-4" style={{
          color: '#FFF',
          textAlign: 'center',
          fontFamily: 'Poppins',
          fontSize: '22px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '19px'
        }}>Calendar</h1>
        <div className="flex-1 border-t" style={{ borderColor: 'rgba(255, 146, 138, 0.3)' }} />
      </div>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-center" style={{
              color: '#FFF',
              fontFamily: 'Poppins',
              fontSize: '22px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '19px'
            }}>
              {format(currentMonth, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePreviousMonth}
                className="p-1 hover:bg-white/5 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-white/5 rounded-full text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleViewChange('month')}
              className={`flex items-center justify-center transition-colors
                ${view === 'month' ? 'bg-[#3E3EF4] text-white' : 'border border-white/20 bg-black/40 text-white hover:bg-white/10'}
              `}
              style={{
                height: '36px',
                padding: '0 24px',
                borderRadius: '35px',
                minWidth: '100px',
                color: '#FFF',
                fontFamily: 'Poppins',
                fontSize: '14.944px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '25.493px',
                letterSpacing: '-0.448px'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => handleViewChange('week')}
              className={`flex items-center justify-center transition-colors
                ${view === 'week' ? 'bg-[#3E3EF4] text-white' : 'border border-white/20 bg-black/40 text-white hover:bg-white/10'}
              `}
              style={{
                height: '36px',
                padding: '0 24px',
                borderRadius: '35px',
                minWidth: '100px',
                color: '#FFF',
                fontFamily: 'Poppins',
                fontSize: '14.944px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '25.493px',
                letterSpacing: '-0.448px'
              }}
            >
              Weekly
            </button>
          </div>
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="flex items-center justify-center transition-colors border border-white/20 bg-black/40 text-white hover:bg-white/10"
            style={{
              height: '36px',
              padding: '0 24px',
              borderRadius: '35px',
              minWidth: '100px',
              color: '#FFF',
              fontFamily: 'Poppins',
              fontSize: '14.944px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '25.493px',
              letterSpacing: '-0.448px'
            }}
          >
            Export
          </button>
        </div>
      </div>
      <div className="rounded-xl">
        <div className="p-2 md:p-6">
          <div className="grid grid-cols-7 mb-1 md:mb-4">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>
          <div className={`grid grid-cols-7 gap-0.5 md:gap-2 ${view === 'week' ? 'h-[600px]' : ''}`}>
            {view === 'month' && Array.from({ length: dateInfo.firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="md:aspect-square" />
            ))}
            {dateInfo.daysInView.map((date) => (
              <DayCell
                key={format(date, 'yyyy-MM-dd')}
                date={date}
                goals={goals}
                completions={completions}
                misses={misses}
                view={view}
                selectedDate={selectedDate}
                expandedDates={expandedDates}
                onGoalAction={handleGoalAction}
                onToggleExpansion={toggleDateExpansion}
              />
            ))}
          </div>
        </div>
      </div>

      {showMissForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-white mb-4">Why did you miss this goal?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">Reason</label>
                <textarea
                  value={missFormData.reason}
                  onChange={(e) => setMissFormData({ ...missFormData, reason: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-black/20 border-white/10 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="What prevented you from completing this goal?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">How will you improve?</label>
                <textarea
                  value={missFormData.improvement_plan}
                  onChange={(e) => setMissFormData({ ...missFormData, improvement_plan: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-black/20 border-white/10 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="What's your plan to succeed next time?"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMissForm(false)}
                  className="px-4 py-2 border border-white/10 rounded-md shadow-sm text-white hover:bg-white/5"
                  style={{
                    color: '#FFF',
                    fontFamily: 'Poppins',
                    fontSize: '14.944px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '25.493px',
                    letterSpacing: '-0.448px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleMissSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  style={{
                    color: '#FFF',
                    fontFamily: 'Poppins',
                    fontSize: '14.944px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: '25.493px',
                    letterSpacing: '-0.448px'
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;