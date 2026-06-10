import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useGoalStore } from '../stores/goalStore';
import { useMoodStore } from '../stores/moodStore';

import { format, startOfMonth, endOfMonth, isBefore, isAfter, parseISO, isEqual, isToday as isDateToday, addMonths, subMonths, eachDayOfInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search } from 'lucide-react';

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

const STATIC_GOALS = [
  { id: 'static-cases', title: 'Cases', color: '#FF928A', start_date: '2020-01-01', end_date: null, frequency: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { id: 'static-chats', title: 'Chats', color: '#A296FF', start_date: '2020-01-01', end_date: null, frequency: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { id: 'static-prep',  title: 'Prep',  color: '#3CC3DF', start_date: '2020-01-01', end_date: null, frequency: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
];

function CalendarPage() {
  const { goals, completions, misses, fetchGoals, fetchCompletions, fetchMisses, toggleGoalCompletion, markGoalMissed } = useGoalStore();
  const { fetchTodaysMood, fetchMonthMoods } = useMoodStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMissForm, setShowMissForm] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [missFormData, setMissFormData] = useState({ goalId: '', reason: '', improvement_plan: '' });
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedWeekDay, setSelectedWeekDay] = useState<Date>(() => new Date());

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

    const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
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

  // Reset selected week day when navigating weeks
  useEffect(() => {
    if (view === 'week') {
      const today = new Date();
      const inCurrentWeek = dateInfo.daysInView.some(
        d => format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      );
      setSelectedWeekDay(inCurrentWeek ? today : dateInfo.daysInView[0]);
    }
  }, [dateInfo.start, view]);

  // Memoize view change handler to prevent unnecessary re-renders
  const handleViewChange = useCallback((newView: 'month' | 'week') => {
    if (newView !== view) {
      setView(newView);
      setExpandedDates(new Set()); // Clear expanded dates when changing views
    }
  }, [view]);

  const handleExportIcal = useCallback(() => {
    const dayMap: Record<string, string> = {
      Sunday: 'SU', Monday: 'MO', Tuesday: 'TU', Wednesday: 'WE',
      Thursday: 'TH', Friday: 'FR', Saturday: 'SA'
    };

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HabitTracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    goals.forEach(goal => {
      const byday = goal.frequency.map((d: string) => dayMap[d]).filter(Boolean).join(',');
      if (!byday) return;
      const dtstart = format(parseISO(goal.start_date), 'yyyyMMdd');
      const until = goal.end_date ? `${format(parseISO(goal.end_date), "yyyyMMdd'T'235959Z")}` : '';
      lines.push(
        'BEGIN:VEVENT',
        `UID:habit-${goal.id}@habittracker`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DURATION:PT30M`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byday}${until ? `;UNTIL=${until}` : ''}`,
        `SUMMARY:${goal.title}`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habits.ics';
    a.click();
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  }, [goals]);

  const handleExportGoogleCalendar = useCallback(() => {
    handleExportIcal();
    window.open('https://calendar.google.com/calendar/r/settings/import', '_blank');
    setShowExportDropdown(false);
  }, [handleExportIcal]);

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
    <div className="w-full">
      <div>
        {/* Header */}
        <div className="flex items-center mb-4">
          <h1 className="text-center mr-4" style={{ color: '#FFF', fontFamily: 'Poppins', fontSize: '22px', fontWeight: 500, lineHeight: '19px' }}>Calendar</h1>
          <div className="flex-1 border-t" style={{ borderColor: 'rgba(255, 146, 138, 0.3)' }} />
        </div>

        {/* Top control card */}
        <div className="rounded-[40px] px-6 py-5 mb-4" style={{ background: 'rgba(37,37,34,0.55)', border: '1px solid #3b3b3b' }}>
          <div className="flex items-center justify-between mb-3">
            {/* Month selector */}
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '17px', color: '#fff' }}>
                {format(currentMonth, view === 'month' ? 'MMMM yyyy' : "'Week of' M.d.yyyy")}
              </span>
              <button onClick={handlePreviousMonth} className="text-white/70 hover:text-white transition-colors p-0.5">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={handleNextMonth} className="text-white/70 hover:text-white transition-colors p-0.5">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {/* Search */}
            <button className="text-white/70 hover:text-white transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </div>
          {/* Monthly / Weekly / Export toggle */}
          <div className="flex items-center gap-2">
            {/* Segmented tab control */}
            <div className="flex items-center p-[2px] rounded-[35px]" style={{ backgroundColor: '#414141' }}>
              <button
                onClick={() => { handleViewChange('month'); setShowExportDropdown(false); }}
                className="flex items-center justify-center transition-colors text-white"
                style={{ height: '28px', padding: '0 18px', borderRadius: '26px', fontFamily: 'Poppins', fontSize: '14px', fontWeight: '500', backgroundColor: view === 'month' ? '#3E3EF4' : '#252722' }}
              >
                Monthly
              </button>
              <button
                onClick={() => { handleViewChange('week'); setShowExportDropdown(false); }}
                className="flex items-center justify-center transition-colors text-white"
                style={{ height: '28px', padding: '0 18px', borderRadius: '26px', fontFamily: 'Poppins', fontSize: '14px', fontWeight: '500', backgroundColor: view === 'week' ? '#3E3EF4' : '#252722' }}
              >
                Weekly
              </button>
            </div>
            <div className="relative export-dropdown ml-auto">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className={`flex items-center justify-center transition-colors text-white ${showExportDropdown ? 'bg-[#3E3EF4]' : 'bg-[#252722] hover:bg-white/10'}`}
                style={{ height: '31px', padding: '0 16px', borderRadius: '26px', fontFamily: 'Poppins', fontSize: '14px', fontWeight: '500', letterSpacing: '-0.42px', border: '2px solid #414141' }}
              >
                Export
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50"
                  style={{ background: 'rgba(5,8,20,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
                >
                  <button onClick={handleExportIcal} className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left" style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: '500' }}>
                    <span>🗓</span> iCal
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <button onClick={handleExportGoogleCalendar} className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left" style={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: '500' }}>
                    <span>📅</span> Google Calendar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        {view === 'month' ? (
          <div className="rounded-[24px] px-5 py-6" style={{ background: 'rgba(55,55,55,0.43)', border: '1px solid #0a2861' }}>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-4">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                <div key={day} className="text-center text-white font-medium" style={{ fontFamily: 'Poppins', fontSize: '14.6px' }}>{day}</div>
              ))}
            </div>
            {/* Day number grid */}
            <div className="grid grid-cols-7 gap-y-3">
              {Array.from({ length: dateInfo.firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {dateInfo.daysInView.map((date) => {
                const isToday = isDateToday(date);
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayGoals = [...STATIC_GOALS, ...goals].filter(goal => {
                  const dayOfWeek = format(date, 'EEEE');
                  const startDate = parseISO(goal.start_date);
                  const endDate = goal.end_date ? parseISO(goal.end_date) : null;
                  return !isBefore(date, startDate) && (endDate ? !isAfter(date, endDate) : true) && goal.frequency.includes(dayOfWeek);
                });
                const hasCompletion = completions.some(c => dayGoals.some(g => g.id === c.goal_id) && c.completed_date === dateStr);
                const hasMiss = misses.some(m => dayGoals.some(g => g.id === m.goal_id) && m.missed_date === dateStr);
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-0.5">
                    <span
                      className={`flex items-center justify-center rounded-full font-medium transition-colors ${isToday ? 'bg-white text-[#0d0d0d]' : 'text-white hover:bg-white/10'}`}
                      style={{ width: '34px', height: '34px', fontFamily: 'Poppins', fontSize: '14.6px' }}
                    >
                      {format(date, 'd')}
                    </span>
                    {dayGoals.length > 0 && (
                      <div className="flex" style={{ gap: '-2px', marginTop: '3px' }}>
                        {dayGoals.slice(0, 3).map((g, i) => (
                          <span key={g.id} className="rounded-full" style={{ width: '3px', height: '3px', backgroundColor: hasCompletion ? '#4ade80' : hasMiss ? '#f87171' : g.color || '#ffffff60', marginLeft: i > 0 ? '-1px' : 0, flexShrink: 0 }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {/* Day picker strip */}
            <div className="flex gap-1 mb-4">
              {dateInfo.daysInView.map((date) => {
                const isToday = isDateToday(date);
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedWeekDay, 'yyyy-MM-dd');
                return (
                  <button
                    key={format(date, 'yyyy-MM-dd')}
                    onClick={() => setSelectedWeekDay(date)}
                    className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${
                      isSelected ? 'bg-[#3E3EF4]' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-medium" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.55)', fontFamily: 'Poppins' }}>
                      {format(date, 'EEE').slice(0, 2)}
                    </span>
                    <span
                      className={`text-sm font-medium mt-1 w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday && !isSelected ? 'bg-white text-[#0d0d0d]' : 'text-white'
                      }`}
                      style={{ fontFamily: 'Poppins' }}
                    >
                      {format(date, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected day goals */}
            <div className="rounded-[24px] px-4 py-4" style={{ background: 'rgba(55,55,55,0.43)', border: '1px solid #3b3b3b' }}>
              <p className="text-white/50 text-xs mb-3" style={{ fontFamily: 'Poppins' }}>
                {format(selectedWeekDay, 'EEEE, MMMM d')}
              </p>
              {(() => {
                const dateStr = format(selectedWeekDay, 'yyyy-MM-dd');
                const dayOfWeek = format(selectedWeekDay, 'EEEE');
                const allGoals = [...STATIC_GOALS, ...goals];
                const dayGoals = allGoals.filter(goal => {
                  const startDate = parseISO(goal.start_date);
                  const endDate = goal.end_date ? parseISO(goal.end_date) : null;
                  return !isBefore(selectedWeekDay, startDate) &&
                    (endDate ? !isAfter(selectedWeekDay, endDate) : true) &&
                    goal.frequency.includes(dayOfWeek);
                });

                if (dayGoals.length === 0) {
                  return (
                    <p className="text-white/30 text-sm text-center py-8" style={{ fontFamily: 'Poppins' }}>
                      No goals scheduled
                    </p>
                  );
                }

                return (
                  <div className="space-y-2">
                    {dayGoals.map(goal => {
                      const isCompleted = completions.some(c => c.goal_id === goal.id && c.completed_date === dateStr);
                      const isMissed = misses.some(m => m.goal_id === goal.id && m.missed_date === dateStr);
                      return (
                        <div
                          key={goal.id}
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            isCompleted ? 'bg-green-500/10' : isMissed ? 'bg-red-500/10' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-2.5 h-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: goal.color }} />
                            <span
                              className={`text-sm font-medium truncate ${isCompleted ? 'text-green-400' : isMissed ? 'text-red-400' : 'text-white'}`}
                              style={{ fontFamily: 'Poppins' }}
                            >
                              {goal.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                            {isMissed && <XCircle className="h-4 w-4 text-red-400" />}
                            {!isCompleted && !isMissed && (
                              <>
                                <button
                                  onClick={() => handleGoalAction(goal.id, dateStr, 'complete')}
                                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-gray-400 hover:text-green-400" />
                                </button>
                                <button
                                  onClick={() => handleGoalAction(goal.id, dateStr, 'miss')}
                                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                  <XCircle className="h-4 w-4 text-gray-400 hover:text-red-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

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
    </div>
  );
}

export default CalendarPage;