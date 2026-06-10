import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGoalStore } from '../stores/goalStore';

import { format } from 'date-fns';



function Goals() {
  const { goals, fetchGoals } = useGoalStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (id: string) => setExpandedCard(prev => prev === id ? null : id);
  
  useEffect(() => {
    const loadData = async () => {
      await fetchGoals();
    };
    loadData();
  }, [fetchGoals]);



  // Date navigation
  const goToPrevDay = () => setSelectedDate((prev: Date) => new Date(prev.getTime() - 86400000));
  const goToNextDay = () => setSelectedDate((prev: Date) => new Date(prev.getTime() + 86400000));
  const dayName = selectedDate.toLocaleDateString(undefined, { weekday: 'long' });
  const dateString = `${selectedDate.getMonth() + 1}.${selectedDate.getDate()}.${selectedDate.getFullYear()}`;

  // Placeholder avatars for demo
  const avatarSets = [
    [
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/44.jpg',
    ],
    [
      'https://randomuser.me/api/portraits/men/45.jpg',
      'https://randomuser.me/api/portraits/women/65.jpg',
      'https://randomuser.me/api/portraits/men/12.jpg',
    ],
    [
      'https://randomuser.me/api/portraits/men/77.jpg',
    ],
  ];

  return (
    <div className="w-full">
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
        }}>My Goals</h1>
        <div className="flex-1 border-t" style={{ borderColor: 'rgba(255, 146, 138, 0.3)' }} />
      </div>

      <div>
        {/* Date Row */}
        <div className="flex items-center justify-between bg-black/30 rounded-2xl px-6 py-4 mb-6">
          <div className="text-white" style={{
            color: '#FFF',
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '19px'
          }}>
            {dayName} - {dateString}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToPrevDay} className="text-white/70 hover:text-white p-1" style={{
              color: '#FFF',
              fontFamily: 'Poppins',
              fontSize: '14.944px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '25.493px',
              letterSpacing: '-0.448px'
            }}>
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={goToNextDay} className="text-white/70 hover:text-white p-1" style={{
              color: '#FFF',
              fontFamily: 'Poppins',
              fontSize: '14.944px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '25.493px',
              letterSpacing: '-0.448px'
            }}>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Goal Cards */}
        <div className="flex flex-col" style={{ gap: '15px' }}>
          {/* Always show the three main goals */}
          <>
            {/* Cases - Blue card */}
            <div className="relative flex flex-col px-6 py-6 transition-all bg-[#3E3EF4] shadow-2xl rounded-[32px]">
              {/* Avatars */}
              <div className="flex items-center space-x-[-12px] mb-2">
                <img src={`${import.meta.env.BASE_URL}Frame 25.svg`} alt="avatar1" className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{ zIndex: 10 }} />
                <img src={`${import.meta.env.BASE_URL}Frame 27.svg`} alt="avatar2" className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{ zIndex: 9 }} />
              </div>
              {/* Arrow / Collapse icon */}
              <div className="absolute top-4 right-4">
                <button onClick={() => toggleCard('cases')} className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-[#3B47F3] text-white/80">
                  {expandedCard === 'cases'
                    ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
                    : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M7 7h10v10"/></svg>
                  }
                </button>
              </div>
              {/* Title and time */}
              <div className="mt-6">
                <div className="text-white mb-1" style={{ fontFamily: 'Poppins', fontSize: '22px', fontWeight: '400', lineHeight: '29px', letterSpacing: '-0.66px' }}>Cases</div>
                <div className="text-white/80" style={{ fontFamily: 'Poppins', fontSize: '22px', fontWeight: '300', lineHeight: '29px', letterSpacing: '-0.66px' }}>9:00AM</div>
              </div>
              {/* Expanded details */}
              {expandedCard === 'cases' && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/80 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Review and work through active cases. Follow up on pending items and update status for each.</p>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Duration</span><span className="text-white">1 hour</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Priority</span><span className="text-white">High</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Frequency</span><span className="text-white">Daily</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {}}
                    className="w-full py-2 rounded-2xl border border-white/30 text-white/80 hover:bg-white/10 transition-colors text-sm"
                    style={{ fontFamily: 'Poppins', fontWeight: '500' }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Chats - Grey card */}
            <div className="relative flex flex-col px-6 py-6 transition-all bg-[#232323] rounded-[32px] mt-2">
              <div className="flex items-center space-x-[-12px] mb-2">
                <img src={`${import.meta.env.BASE_URL}Ellipse 1080.svg`} alt="avatar1" className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{ zIndex: 10 }} />
                <img src={`${import.meta.env.BASE_URL}Frame 28.svg`} alt="avatar2" className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{ zIndex: 9 }} />
                <img src={`${import.meta.env.BASE_URL}Frame 27.svg`} alt="avatar3" className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{ zIndex: 8 }} />
              </div>
              <div className="absolute top-4 right-4">
                <button onClick={() => toggleCard('chats')} className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-[#232323] text-white/80">
                  {expandedCard === 'chats'
                    ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
                    : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M7 7h10v10"/></svg>
                  }
                </button>
              </div>
              <div className="mt-6">
                <div className="text-white mb-1" style={{ fontFamily: 'Poppins', fontSize: '22px', fontWeight: '400', lineHeight: '29px', letterSpacing: '-0.66px' }}>Chats</div>
                <div className="text-white/80" style={{ fontFamily: 'Poppins', fontSize: '22px', fontWeight: '300', lineHeight: '29px', letterSpacing: '-0.66px' }}>12:00PM</div>
              </div>
              {expandedCard === 'chats' && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/80 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Team sync and check-ins. Respond to outstanding messages and align on priorities.</p>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Duration</span><span className="text-white">30 min</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Priority</span><span className="text-white">Medium</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Frequency</span><span className="text-white">Weekdays</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {}}
                    className="w-full py-2 rounded-2xl border border-white/30 text-white/80 hover:bg-white/10 transition-colors text-sm"
                    style={{ fontFamily: 'Poppins', fontWeight: '500' }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Prep - Grey card */}
            <div className="relative flex flex-col px-6 py-6 transition-all bg-[#232323] rounded-[32px] mt-2">
              <div className="flex items-center space-x-[-12px] mb-2">
                <img src={`${import.meta.env.BASE_URL}Frame 28.svg`} alt="avatar1" className="w-8 h-8 rounded-full border-2 border-white object-cover" style={{ zIndex: 10 }} />
              </div>
              <div className="absolute top-4 right-4">
                <button onClick={() => toggleCard('prep')} className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-[#232323] text-white/80">
                  {expandedCard === 'prep'
                    ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
                    : <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M7 7h10v10"/></svg>
                  }
                </button>
              </div>
              <div className="mt-6">
                <div className="text-white mb-1" style={{ fontFamily: 'Poppins', fontSize: '22px', fontWeight: '400', lineHeight: '29px', letterSpacing: '-0.66px' }}>Prep</div>
                <div className="text-white/80" style={{ fontFamily: 'Poppins', fontSize: '22px', fontWeight: '300', lineHeight: '29px', letterSpacing: '-0.66px' }}>2:30PM</div>
              </div>
              {expandedCard === 'prep' && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/80 text-sm mb-3" style={{ fontFamily: 'Poppins' }}>Prepare materials and notes for upcoming sessions. Review goals and plan next steps.</p>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Duration</span><span className="text-white">45 min</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Priority</span><span className="text-white">Medium</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ fontFamily: 'Poppins' }}>
                      <span className="text-white/60">Frequency</span><span className="text-white">Daily</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {}}
                    className="w-full py-2 rounded-2xl border border-white/30 text-white/80 hover:bg-white/10 transition-colors text-sm"
                    style={{ fontFamily: 'Poppins', fontWeight: '500' }}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </>

          {/* Additional goals from store (if any) */}
          {goals.length > 0 && goals.slice(1).map((goal, idx) => {
            const avatars = avatarSets[(idx + 1) % avatarSets.length];
            return (
              <div
                key={goal.id}
                className={`relative flex flex-col min-h-[140px] px-6 py-6 transition-all cursor-pointer bg-[#232323] shadow-lg rounded-[32px]`}
                onClick={() => {}}
              >
                {/* Avatars */}
                <div className="flex items-center space-x-[-12px] mb-2">
                  {avatars.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt="avatar"
                      className="w-8 h-8 rounded-full border-2 border-white object-cover z-10"
                      style={{ zIndex: 10 - i }}
                    />
                  ))}
                </div>
                {/* Arrow icon */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/30 bg-[#232323] text-white/80">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 17L17 7M7 7h10v10"/></svg>
                  </span>
                </div>
                {/* Title and time */}
                <div className="mt-6">
                  <div className="text-white text-xl font-bold mb-1 tracking-wide">{goal.title || 'Cases'}</div>
                  <div className="text-white/80 text-lg font-medium tracking-wide">{goal.start_time ? format(new Date(`1970-01-01T${goal.start_time}`), 'h:mmaaa').replace(':00', '').replace('AM', 'AM').replace('PM', 'PM') : '9:00AM'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Goals;