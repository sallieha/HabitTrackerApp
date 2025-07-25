import React, { useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LayoutDashboard, Target, Calendar as CalendarIcon, Clock, MessageCircle, Settings, LogOut, Home } from 'lucide-react';

function Layout() {
  const location = useLocation();
  const { signOut } = useAuthStore();
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Scroll behavior when location changes (for mobile navigation)
  useEffect(() => {
    if (mainContentRef.current) {
      if (location.pathname === '/ai-chat') {
        // For AI Chat page, scroll to bottom
        mainContentRef.current.scrollTo({ top: mainContentRef.current.scrollHeight, behavior: 'smooth' });
      } else {
        // For all other pages, scroll to top
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    
    // Additional scroll after a short delay to ensure it works
    const timeoutId = setTimeout(() => {
      if (mainContentRef.current) {
        if (location.pathname === '/ai-chat') {
          mainContentRef.current.scrollTo({ top: mainContentRef.current.scrollHeight, behavior: 'smooth' });
        } else {
          mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

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

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:relative md:flex md:w-16 bg-black/20 backdrop-blur-xl border-r border-white/10 flex-col items-center py-4 z-20 h-full">
          <div className="flex-1 space-y-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full transition-all
                      ${location.pathname === item.href
                        ? 'bg-white/20 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
                    <div className="bg-black/80 backdrop-blur-sm text-white text-sm px-2 py-1 rounded shadow-lg border border-white/10">
                      {item.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative group">
            <button
              onClick={signOut}
              className="flex items-center justify-center w-10 h-10 rounded-full text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
              <div className="bg-black/80 backdrop-blur-sm text-white text-sm px-2 py-1 rounded shadow-lg border border-white/10">
                Sign Out
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div ref={mainContentRef} className="flex-1 overflow-auto pb-20 md:pb-0">
          <main className="p-8">
            <div className="bg-black/20 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Footer Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20">
          <div className="bg-slate-800/95 backdrop-blur-xl border-t border-slate-700/50">
            <div className="flex items-center justify-around px-4 py-3">
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
                    onClick={() => {
                      // Scroll behavior based on destination page
                      if (item.href === '/ai-chat') {
                        // For AI Chat page, scroll to bottom
                        if (mainContentRef.current) {
                          mainContentRef.current.scrollTo({ top: mainContentRef.current.scrollHeight, behavior: 'smooth' });
                        }
                        
                        setTimeout(() => {
                          if (mainContentRef.current) {
                            mainContentRef.current.scrollTo({ top: mainContentRef.current.scrollHeight, behavior: 'smooth' });
                          }
                        }, 150);
                        
                        setTimeout(() => {
                          if (mainContentRef.current) {
                            mainContentRef.current.scrollTo({ top: mainContentRef.current.scrollHeight, behavior: 'smooth' });
                          }
                        }, 300);
                      } else {
                        // For all other pages, scroll to top
                        if (mainContentRef.current) {
                          mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        
                        setTimeout(() => {
                          if (mainContentRef.current) {
                            mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }, 150);
                        
                        setTimeout(() => {
                          if (mainContentRef.current) {
                            mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }, 300);
                      }
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;