import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useGoalStore } from './stores/goalStore';
import { useMoodStore } from './stores/moodStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Calendar from './pages/Calendar';
import Progress from './pages/Progress';
import Analytics from './pages/Analytics';
import DailyPlanner from './pages/DailyPlanner';
import AIChat from './pages/AIChat';
import { format, startOfMonth, endOfMonth } from 'date-fns';

function App() {
  const user = useAuthStore(state => state.user);
  const { fetchGoals, fetchCompletions, fetchMisses } = useGoalStore();
  const { fetchMonthMoods, fetchTodaysMood } = useMoodStore();

  // Preload calendar data on app start for instant navigation
  useEffect(() => {
    if (user) {
      const preloadCalendarData = async () => {
        try {
          const currentMonth = new Date();
          const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
          const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

          // Preload current month data in background
          Promise.allSettled([
            fetchGoals(),
            fetchCompletions(start, end),
            fetchMisses(start, end),
            fetchMonthMoods(start, end),
            fetchTodaysMood()
          ]).catch(() => {
            // Ignore preload errors - they'll be handled when user actually visits calendar
          });
        } catch (error) {
          // Ignore preload errors
        }
      };

      // Delay preload to not interfere with initial app loading
      setTimeout(preloadCalendarData, 1000);
    }
  }, [user, fetchGoals, fetchCompletions, fetchMisses, fetchMonthMoods, fetchTodaysMood]);

  const appContent = (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="goals" element={<Goals />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="progress" element={<Progress />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="daily-planner" element={<DailyPlanner />} />
              <Route path="ai-chat" element={<AIChat />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          width: '410px',
          height: '780px',
          border: '2px solid #d1d5db'
        }}
      >
        {appContent}
      </div>
    </div>
  );
}

export default App;