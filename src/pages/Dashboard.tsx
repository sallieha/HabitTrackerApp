import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMoodStore } from '../stores/moodStore';
import { useGoalStore } from '../stores/goalStore';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MissFormData {
  goalId: string;
  reason: string;
  improvement_plan: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const [showMissForm, setShowMissForm] = useState(false);
  const [selectedMonth] = useState(new Date());
  const [missFormData, setMissFormData] = useState<MissFormData>({ goalId: '', reason: '', improvement_plan: '' });
  const [legendStates, setLegendStates] = useState({
    coffeechats: true,
    series1: true,
    series2: true
  });

  const { 
    fetchTodaysMood, 
    fetchMonthMoods,
    clearError: clearMoodError 
  } = useMoodStore();

  const { 
    fetchGoals, 
    fetchCompletions, 
    fetchMisses, 
    markGoalMissed, 
    clearError: clearGoalError
  } = useGoalStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        clearMoodError();
        clearGoalError();

        const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

        await fetchTodaysMood();

        await Promise.all([
          fetchGoals(),
          fetchCompletions(monthStart, monthEnd),
          fetchMisses(monthStart, monthEnd),
          fetchMonthMoods(monthStart, monthEnd)
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, [selectedMonth, clearGoalError, clearMoodError, fetchCompletions, fetchGoals, fetchMisses, fetchMonthMoods, fetchTodaysMood]);

  const handleMissSubmit = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    await markGoalMissed(
      missFormData.goalId,
      today,
      missFormData.reason,
      missFormData.improvement_plan
    );
    setShowMissForm(false);
    setMissFormData({ goalId: '', reason: '', improvement_plan: '' });
  };

  const toggleLegend = (key: keyof typeof legendStates) => {
    setLegendStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Chart data and options
  const chartData = {
    labels: ['', '', '', '', '', '', '', '', '', '', '', ''],
    datasets: [
      {
        label: 'Prep',
        data: legendStates.series2 ? [232, 55, 70, 146, 95, 202, 30, 251, 219, 32, 30, 212] : [],
        borderColor: '#FF928A',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(255, 146, 138, 0.3)');
          gradient.addColorStop(1, 'rgba(38, 39, 35, 0.1)');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#FF928A',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: '+1',
        hidden: !legendStates.series2,
      },
      {
        label: 'Cases', 
        data: legendStates.series1 ? [148, 199, 52, 182, 115, 266, 167, 136, 223, 187, 82, 197] : [],
        borderColor: '#A296FF',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(137, 121, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(38, 39, 35, 0.1)');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#A296FF',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: '+1',
        hidden: !legendStates.series1,
      },
      {
        label: 'Coffee Chats',
        data: legendStates.coffeechats ? [86, 236, 173, 123, 233, 175, 10, 217, 133, 189, 84, 191] : [],
        borderColor: '#016FD0',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(60, 195, 223, 0.3)');
          gradient.addColorStop(1, 'rgba(38, 39, 35, 0.1)');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#3CC3DF',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: 'origin',
        hidden: !legendStates.coffeechats,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(35, 36, 58, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3CC3DF',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          labelColor: function(context: any) {
            return {
              borderColor: context.dataset.borderColor as string,
              backgroundColor: context.dataset.borderColor as string,
            };
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
        min: 0,
        max: 300,
      },
    },
    elements: {
      line: { 
        borderJoinStyle: 'round' as const, 
        borderCapStyle: 'round' as const,
      },
      point: { 
        hoverRadius: 6,
        hoverBorderWidth: 3,
      },
    },
  };

  // Calendar widget state and logic (sync with Calendar page)
  const [dashboardMonth, setDashboardMonth] = useState(new Date());
  const firstDayOfMonth = startOfMonth(dashboardMonth);
  const lastDayOfMonth = endOfMonth(dashboardMonth);
  const firstDayOffset = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  return (
    <div className="w-full h-full flex flex-col" style={{ 
      height: '780px',
      backgroundImage: 'url(./background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
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
        }}>Dashboard</h1>
        <div className="flex-1 border-t" style={{ borderColor: 'rgba(255, 146, 138, 0.3)' }} />
      </div>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Overall Activity Widget */}
        <div className="bg-gradient-to-br from-[#23243A]/75 to-[#2B2250]/75 rounded-3xl p-6 mb-8 relative overflow-hidden border border-white/10" style={{ minHeight: 370 }}>
          <div className="text-white text-lg font-semibold mb-2" style={{ fontFamily: 'Poppins', fontWeight: 500 }}>Overall Activity</div>
          <div className="w-full h-48 mb-2">
            <Line
              data={{
                labels: ['', '', '', '', '', '', '', '', '', '', '', ''],
                datasets: [
                  {
                    label: 'Prep',
                    data: legendStates.series2 ? [232, 55, 70, 146, 95, 202, 30, 251, 219, 32, 30, 212] : [],
                    borderColor: '#FF928A',
                    backgroundColor: (context: any) => {
                      const chart = context.chart;
                      const {ctx, chartArea} = chart;
                      if (!chartArea) return null;
                      
                      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                      gradient.addColorStop(0, 'rgba(255, 146, 138, 0.3)');
                      gradient.addColorStop(1, 'rgba(38, 39, 35, 0.1)');
                      return gradient;
                    },
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#FF928A',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: '+1',
                    hidden: !legendStates.series2,
                  },
                  {
                    label: 'Cases', 
                    data: legendStates.series1 ? [148, 199, 52, 182, 115, 266, 167, 136, 223, 187, 82, 197] : [],
                    borderColor: '#A296FF',
                    backgroundColor: (context: any) => {
                      const chart = context.chart;
                      const {ctx, chartArea} = chart;
                      if (!chartArea) return null;
                      
                      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                      gradient.addColorStop(0, 'rgba(137, 121, 255, 0.3)');
                      gradient.addColorStop(1, 'rgba(38, 39, 35, 0.1)');
                      return gradient;
                    },
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#A296FF',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: '+1',
                    hidden: !legendStates.series1,
                  },
                  {
                    label: 'Coffee Chats',
                    data: legendStates.coffeechats ? [86, 236, 173, 123, 233, 175, 10, 217, 133, 189, 84, 191] : [],
                    borderColor: '#016FD0',
                    backgroundColor: (context: any) => {
                      const chart = context.chart;
                      const {ctx, chartArea} = chart;
                      if (!chartArea) return null;
                      
                      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                      gradient.addColorStop(0, 'rgba(60, 195, 223, 0.3)');
                      gradient.addColorStop(1, 'rgba(38, 39, 35, 0.1)');
                      return gradient;
                    },
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: '#3CC3DF',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: 'origin',
                    hidden: !legendStates.coffeechats,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: 'index' as const,
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(35, 36, 58, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3CC3DF',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                      labelColor: function(context: any) {
                        return {
                          borderColor: context.dataset.borderColor as string,
                          backgroundColor: context.dataset.borderColor as string,
                        };
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    display: false,
                    grid: { display: false },
                  },
                  y: {
                    display: false,
                    grid: { display: false },
                    min: 0,
                    max: 300,
                  },
                },
                elements: {
                  line: { 
                    borderJoinStyle: 'round' as const, 
                    borderCapStyle: 'round' as const,
                  },
                  point: { 
                    hoverRadius: 6,
                    hoverBorderWidth: 3,
                  },
                },
              }}
            />
          </div>
          <div className="text-white/80 text-base mb-1" style={{ fontFamily: 'Poppins', fontWeight: 400 }}>Coffee Chats</div>
          <div className="text-white text-2b-2" style={{ fontFamily: 'Poppins', fontWeight: 700 }}>6745 min.</div>
          <div className="flex justify-between items-center text-white/50 text-sm mb-2" style={{ fontFamily: 'Poppins' }}>
            <div>Goal</div>
            <div>8000</div>
          </div>
          <div className="flex justify-between items-center text-white/50 text-sm mb-4" style={{ fontFamily: 'Poppins' }}>
            <div>Average</div>
            <div>9500</div>
          </div>
          <div className="flex justify-center gap-8 mt-2">
            <button
              className="relative cursor-pointer hover:scale-110 transition-transform"
              onClick={() => toggleLegend('coffeechats')}
            >
              <div 
                className="w-5 h-5 inline-block rounded-md border"
                style={{ 
                  backgroundColor: 'rgba(60, 195, 223, 0.5)', 
                  borderColor: '#3CC3DF'
                }}
              >
                {legendStates.coffeechats && (
                  <svg className="w-3 h-3 absolute inset-0 m-auto" viewBox="0 0 16 16" fill="none">
                    <path 
                      fillRule="evenodd" 
                      clipRule="evenodd" 
                      d="M13.626 3.276a.75.75 0 0 1 0 1.06L6.739 11.17a.75.75 0 0 1-1.061 0L2.644 8.083a.75.75 0 1 1 1.061-1.061L6.209 9.525l6.356-6.25a.75.75 0 0 1 1.061 0z" 
                      fill="#3CC3DF"
                    />
                  </svg>
                )}
              </div>
            </button>
            <button 
              className="relative cursor-pointer hover:scale-110 transition-transform"
              onClick={() => toggleLegend('series2')}
            >
              <div
                className="w-5 h-5 inline-block rounded-md border opacity-70"
                style={{ 
                  backgroundColor: 'rgba(251, 180, 153, 0.5)', 
                  borderColor: '#FBB499'
                }}
              >
                {legendStates.series2 && (
                  <svg className="w-3 h-3 absolute inset-0 m-auto" viewBox="0 0 16 16" fill="none">
                    <path 
                      fillRule="evenodd" 
                      clipRule="evenodd" 
                      d="M13.626 3.276a.75.75 0 0 1 0 1.06L6.739 11.17a.75.75 0 0 1-1.061 0L2.644 8.083a.75.75 0 1 1 1.061-1.061L6.209 9.525l6.356-6.25a.75.75 0 0 1 1.061 0z" 
                      fill="#FBB499"
                    />
                  </svg>
                )}
              </div>
            </button>
            <button 
              className="relative cursor-pointer hover:scale-110 transition-transform"
              onClick={() => toggleLegend('series1')}
            >
              <div 
                className="w-5 h-5 inline-block rounded-md border opacity-70"
                style={{ 
                  backgroundColor: 'rgba(162, 150, 255, 0.5)', 
                  borderColor: '#A296FF'
                }}
              >
                {legendStates.series1 && (
                  <svg className="w-3 h-3 absolute inset-0 m-auto" viewBox="0 0 16 16" fill="none">
                    <path 
                      fillRule="evenodd" 
                      clipRule="evenodd" 
                      d="M13.626 3.276a.75.75 0 0 1 0 1.06L6.739 11.17a.75.75 0 0 1-1.061 0L2.644 8.083a.75.75 0 1 1 1.061-1.061L6.209 9.525l6.356-6.25a.75.75 0 0 1 1.061 0z" 
                      fill="#A296FF"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="bg-[#3E3EF4] rounded-2xl p-6 mb-8 cursor-pointer transition-all hover:bg-[#3535d6]" onClick={() => navigate('/calendar')}>
          <div className="flex justify-between items-center mb-6">
            <div className="text-white font-semibold text-lg">{format(dashboardMonth, 'MMMM yyyy')}</div>
            <div className="flex gap-4">
              <button className="text-white hover:text-gray-300 transition-colors" onClick={(e) => { e.stopPropagation(); setDashboardMonth(prev => subMonths(prev, 1)); }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 6l-6 6 6 6"/>
                </svg>
              </button>
              <button className="text-white hover:text-gray-300 transition-colors" onClick={(e) => { e.stopPropagation(); setDashboardMonth(prev => addMonths(prev, 1)); }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <div key={day} className="text-center text-white text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>
          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: (firstDayOffset === 0 ? 6 : firstDayOffset - 1) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10"></div>
            ))}
            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const today = new Date();
              const isSelected = date === today.getDate() && dashboardMonth.getMonth() === today.getMonth() && dashboardMonth.getFullYear() === today.getFullYear();
              return (
                <div
                  key={date}
                  className={`h-10 flex items-center justify-center text-sm font-medium ${isSelected ? 'bg-white rounded-full' : 'text-white'}`}
                  style={isSelected ? { color: '#0D0D0D' } : {}}
                >
                  {date}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Time Spent & Streak Widgets */}
        <div className="space-y-6 mb-8">
          {/* Daily Time Spent */}
          <div className="bg-[#181C3A] rounded-2xl p-6 flex flex-col justify-between min-h-[170px]">
            <div>
              <div className="text-white font-semibold text-lg mb-1">Daily Time Spent</div>
              <div className="text-gray-400 text-sm mb-2">Ready for today's Challenges?</div>
            </div>
            <div className="flex items-center justify-between mt-2">
              {/* Circular Progress */}
              <svg width="80" height="80" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" stroke="#23243A" strokeWidth="4" fill="none" />
                <circle cx="20" cy="20" r="16" stroke="#3E3EF4" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset="25" strokeLinecap="round"/>
                <text x="50%" y="54%" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="500">2.75h</text>
              </svg>
              <div className="flex flex-col ml-4">
                <div className="text-gray-400 text-xs">Goal is 3 hours</div>
              </div>
            </div>
          </div>
          {/* Streak */}
          <div className="relative rounded-2xl p-6 flex flex-col justify-between min-h-[170px]" style={{
            background: '#181C3A',
            border: '1px solid transparent',
            backgroundClip: 'padding-box'
          }}>
            <div className="absolute inset-0 rounded-2xl" style={{
              background: 'linear-gradient(to bottom, #3B3B, rgba(2511800.3))',
              zIndex: -1          }}></div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-white font-semibold text-lg">Streak</div>
              <div className="text-gray-300 text-sm">80% completed</div>
            </div>
            <div className="flex items-center mt-2">
              {/* Linear Progress */}
              <div className="flex-1 mr-4">
                <div className="w-full h-3 bg-[#23243A] rounded-full relative">
                  <div className="h-3 bg-[#3E3EF4] rounded-full absolute left-0 top-0" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="flex flex-col text-xs text-gray-400">
                <div>20 days</div>
                <div>1 month</div>
              </div>
            </div>
          </div>
        </div>

        {/* My Goals Section */}
        <div className="mb-[-12px] cursor-pointer transition-all hover:opacity-80 -mx-4 px-4" onClick={() => navigate('/goals')}>
          <div className="flex items-center mb-4">
            <h2 className="text-center mr-4" style={{
              color: '#FFF',
              textAlign: 'center',
              fontFamily: 'Poppins',
              fontSize: '18px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '19px'
            }}>My Goals</h2>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-4">
            {/* First Card - Blue */}
            <div className="relative flex flex-col min-w-[220px] min-h-[220px] w-[220px] h-[220px] px-6 py-6 transition-all cursor-pointer bg-[#3E3EF4] rounded-3xl">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-[#3E3EF4] text-white/80">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </span>
              </div>
              {/* Avatars */}
              <div className="flex items-center space-x-[-12px] mb-[50px]">
                <img
                  src="/Frame 25.svg"
                  alt="avatar1"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-10"
                  style={{ zIndex: 10 }}
                />
                <img
                  src="/Frame 26.svg"
                  alt="avatar2"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-10"
                  style={{ zIndex: 9 }}
                />
              </div>
              {/* Title and time */}
              <div className="mt-6">
                <div className="text-white mb-1" style={{
                  color: '#FFF',
                  fontFamily: 'Poppins',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '29px',
                  letterSpacing: '-0.66'
                }}>Cases</div>
                <div className="text-white/80" style={{
                  color: '#FFF',
                  fontFamily: 'Poppins',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 300,
                  lineHeight: '29px',
                  letterSpacing: '-0.66'
                }}>9:00AM</div>
              </div>
            </div>

            {/* Second Card - Grey */}
            <div className="relative flex flex-col min-w-[220px] min-h-[220px] w-[220px] h-[220px] px-6 py-6 transition-all cursor-pointer bg-[#232323] rounded-3xl">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-[#232323] text-white/80">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </span>
              </div>
              {/* Avatars */}
              <div className="flex items-center space-x-[-12px] mb-[50px]">
                <img
                  src="/Ellipse 1080.svg"
                  alt="avatar1"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-10"
                  style={{ zIndex: 10 }}
                />
                <img
                  src="/Frame 28.svg"
                  alt="avatar2"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-10"
                  style={{ zIndex: 9 }}
                />
              </div>
              {/* Title and time */}
              <div className="mt-6">
                <div className="text-white mb-1" style={{
                  color: '#FFF',
                  fontFamily: 'Poppins',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '29px',
                  letterSpacing: '-0.66'
                }}>Chats</div>
                <div className="text-white/80" style={{
                  color: '#FFF',
                  fontFamily: 'Poppins',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 300,
                  lineHeight: '29px',
                  letterSpacing: '-0.66'
                }}>12:00PM</div>
              </div>
            </div>

            {/* Third Card - Grey */}
            <div className="relative flex flex-col min-w-[220px] min-h-[220px] w-[220px] h-[220px] px-6 py-6 transition-all cursor-pointer bg-[#232323] rounded-3xl">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-[#232323] text-white/80">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M7 7h10v10"/>
                  </svg>
                </span>
              </div>
              {/* Avatars */}
              <div className="flex items-center space-x-[-12px] mb-[50px]">
                <img
                  src="/Frame 28.svg"
                  alt="avatar1"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover z-10"
                  style={{ zIndex: 10 }}
                />
              </div>
              {/* Title and time */}
              <div className="mt-6">
                <div className="text-white mb-1" style={{
                  color: '#FFF',
                  fontFamily: 'Poppins',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '29px',
                  letterSpacing: '-0.66'
                }}>Prep</div>
                <div className="text-white/80" style={{
                  color: '#FFF',
                  fontFamily: 'Poppins',
                  fontSize: '22px',
                  fontStyle: 'normal',
                  fontWeight: 300,
                  lineHeight: '29px',
                  letterSpacing: '-0.66'
                }}>2:30PM</div>
              </div>
            </div>
          </div>
        </div>

        {showMissForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl p-6 max-w-md w-full">
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
                    className="px-4 py-2 border border-white/10 rounded-md shadow-sm text-sm font-medium text-white hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMissSubmit}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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

export default Dashboard;