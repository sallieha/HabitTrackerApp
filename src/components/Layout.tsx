import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LayoutDashboard, Target, Calendar as CalendarIcon, Clock, MessageCircle, Settings, LogOut, Home } from 'lucide-react';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Planner', href: '/planner', icon: Clock },
    { name: 'AI Chat', href: '/ai-chat', icon: MessageCircle },
  ];

  const mobileNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'AI Chat', href: '/ai-chat', icon: MessageCircle },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Settings', href: '#', icon: Settings, isSettings: true },
  ];

  // Keyboard navigation for mobile footer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle arrow keys
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      // Get current page index
      const currentIndex = mobileNavigation.findIndex(item => 
        item.href !== '#' && location.pathname === item.href
      );

      if (currentIndex === -1) return;

      let nextIndex: number;

      if (event.key === 'ArrowLeft') {
        // Navigate to previous page (wrap around to end)
        nextIndex = currentIndex === 0 ? mobileNavigation.length - 2 : currentIndex - 1;
        // Skip Settings button when going backwards
        if (nextIndex === mobileNavigation.length - 1) {
          nextIndex = nextIndex - 1;
        }
      } else {
        // Navigate to next page (wrap around to beginning)
        nextIndex = currentIndex === mobileNavigation.length - 2 ? 0 : currentIndex + 1;
        // Skip Settings button when going forwards
        if (nextIndex === mobileNavigation.length - 1) {
          nextIndex = 0;
        }
      }

      const nextItem = mobileNavigation[nextIndex];
      
      // Don't navigate to Settings via keyboard
      if (nextItem && !nextItem.isSettings) {
        event.preventDefault();
        navigate(nextItem.href);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location.pathname, navigate]);

  // Scroll to top when navigating between pages (except AI Chat)
  useEffect(() => {
    // Don't scroll to top for AI Chat page
    if (location.pathname === '/ai-chat') {
      return;
    }
    
    // Scroll to top for all other pages
    const mainContent = document.querySelector('.flex-1.overflow-y-auto');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return (
    <div className="h-full w-full flex flex-col" style={{
      backgroundImage: 'url(/background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        <main className="p-4 w-full">
          <div className="rounded-xl border border-white/10 p-4 w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Footer Navigation - Sticky at bottom */}
      <div className="sticky bottom-0 z-20 w-full">
        <div className="backdrop-blur-xl border-t border-slate-700/50 w-full" style={{ backgroundColor: 'rgba(40, 47, 85, 0.8)' }}>
          <div className="flex items-center justify-around px-4 py-3 w-full">
            {mobileNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              if (item.isSettings) {
                return (
                  <button
                    key={item.name}
                    onClick={signOut}
                    className="flex items-center justify-center w-12 h-12 rounded-full transition-all text-white hover:bg-blue-500/20"
                  >
                    <Icon className="h-6 w-6" />
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                  style={isActive ? { backgroundColor: '#3E3EF4' } : {}}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;