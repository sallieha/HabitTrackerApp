import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Lightbulb, Target, Calendar, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const suggestedPrompts = [
  {
    icon: Target,
    text: "Help me create a new habit",
    prompt: "I want to create a new habit. Can you help me set realistic goals and frequency?"
  },
  {
    icon: TrendingUp,
    text: "Analyze my progress",
    prompt: "Can you help me analyze my habit tracking progress and suggest improvements?"
  },
  {
    icon: Calendar,
    text: "Plan my week",
    prompt: "Help me plan an effective weekly schedule for my habits and goals."
  },
  {
    icon: Lightbulb,
    text: "Motivation tips",
    prompt: "I'm struggling to stay motivated with my habits. Can you give me some tips?"
  }
];

function AIChat() {
  const { user } = useAuthStore();
  const prevUserRef = useRef(user);
  const [hasClearedOnLogin, setHasClearedOnLogin] = useState(() => {
    try {
      const saved = localStorage.getItem('aiChatHasClearedOnLogin');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  
  // Initialize state from localStorage if available
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('aiChatMessages');
      return savedMessages ? JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) : [];
    } catch {
      return [];
    }
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [showChat, setShowChat] = useState(() => {
    try {
      const savedShowChat = localStorage.getItem('aiChatShowChat');
      return savedShowChat ? JSON.parse(savedShowChat) : false;
    } catch {
      return false;
    }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aiChatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  }, [messages]);

  // Save showChat state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aiChatShowChat', JSON.stringify(showChat));
    } catch (error) {
      console.error('Failed to save showChat to localStorage:', error);
    }
  }, [showChat]);

  // Clear chat history only when user first logs in (not on every navigation)
  useEffect(() => {
    if (user && !hasClearedOnLogin) {
      // Clear messages and reset chat state
      setMessages([]);
      setShowChat(false);
      setInputValue('');
      setIsTyping(false);
      
      // Mark that we've cleared on this login
      setHasClearedOnLogin(true);
    }
  }, [user, hasClearedOnLogin]);

  // Reset hasClearedOnLogin when user logs out
  useEffect(() => {
    // Check if user logged out (was logged in before, now is null)
    if (prevUserRef.current && !user) {
      // User has logged out, reset the flag
      setHasClearedOnLogin(false);
      setMessages([]);
      setShowChat(false);
      setInputValue('');
      setIsTyping(false);
    }
    
    // Update the previous user reference
    prevUserRef.current = user;
  }, [user]);

  // Save hasClearedOnLogin to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aiChatHasClearedOnLogin', JSON.stringify(hasClearedOnLogin));
    } catch (error) {
      console.error('Failed to save hasClearedOnLogin to localStorage:', error);
    }
  }, [hasClearedOnLogin]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('habit') || lowerMessage.includes('goal')) {
      return "Great question about habits! Building sustainable habits is all about starting small and being consistent. I recommend:\n\n• Start with just 2-3 habits at most\n• Make them specific and measurable\n• Choose a consistent time of day\n• Track your progress daily\n\nWhat specific habit are you looking to build?";
    }
    
    if (lowerMessage.includes('motivation') || lowerMessage.includes('struggle')) {
      return "I understand that staying motivated can be challenging! Here are some strategies that work well:\n\n• Focus on your 'why' - remember your deeper reasons\n• Celebrate small wins along the way\n• Find an accountability partner\n• Track your streak to see visual progress\n• Be kind to yourself when you miss a day\n\nRemember, progress isn't always linear. What's been your biggest challenge so far?";
    }
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('analyze')) {
      return "Analyzing your progress is key to improvement! Here's what I recommend looking at:\n\n• Completion rate over the last 30 days\n• Which days of the week you're most/least successful\n• Patterns around missed days\n• Energy levels and mood correlation\n\nYou can check your analytics in the Dashboard to see these insights. Would you like tips on improving any specific areas?";
    }
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('schedule')) {
      return "Smart planning makes all the difference! Here's how to plan effectively:\n\n• Review your current habits and their frequency\n• Identify your peak energy times\n• Block time for each habit in your calendar\n• Plan for obstacles and have backup plans\n• Leave buffer time between activities\n\nWould you like help planning a specific part of your routine?";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm excited to help you on your habit-building journey. Whether you need help creating new habits, staying motivated, or analyzing your progress, I'm here for you. What would you like to work on today?";
    }
    
    return "That's a great question! I'm here to help you with habit tracking, goal setting, motivation, and progress analysis. Feel free to ask me about:\n\n• Creating effective habits\n• Staying motivated\n• Analyzing your progress\n• Planning your routine\n• Overcoming obstacles\n\nWhat specific area would you like to explore?";
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowChat(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(text),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setShowChat(true);
    handleSendMessage(prompt);
  };

  const handleAddNew = () => {
    setShowChat(true);
    handleSendMessage('I want to add a new goal.');
  };
  const handleEnterManually = () => {
    setShowChat(true);
    handleSendMessage('I want to enter my goals manually.');
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] max-w-md mx-auto px-2 py-6">
      {/* Initial AI message - always shown at top */}
      <div className="flex items-start gap-3 mb-6">
        <div
          className="h-8 w-8 rounded-full shadow-lg flex items-center justify-center mt-1"
          style={{ background: 'linear-gradient(180deg, #FF928A 0%, #0A2861 100%)' }}
        />
        <div className="bg-black/40 text-white rounded-xl px-4 py-3 text-base font-medium shadow border border-white/10 max-w-[80%]" style={{ color: '#FFF', fontFamily: 'Poppins', fontSize: '16px', fontStyle: 'normal', fontWeight: '400', lineHeight: '23.88px' }}>
          What goals would you like to set today?
        </div>
      </div>

      {/* Action buttons - always visible */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleAddNew}
          className="px-6 py-2 rounded-full bg-[#3E3EF4] hover:bg-[#3535d6] text-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          Add New
        </button>
        <button
          onClick={handleEnterManually}
          className="px-6 py-2 rounded-full border border-white/20 bg-black/40 text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          Enter Manually
        </button>
      </div>

      {/* Try asking me about section - always visible */}
      <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
        <div className="mb-3" style={{
          color: '#FFF',
          fontFamily: 'Poppins',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: '400',
          lineHeight: '23.88px'
        }}>Try asking me about:</div>
        <div className="flex flex-col gap-3">
        {suggestedPrompts.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <button
              key={index}
              onClick={() => handleSuggestedPrompt(prompt.prompt)}
                className="flex items-center gap-3 px-4 py-3 bg-black/30 hover:bg-indigo-500/10 rounded-xl border border-white/10 transition-colors text-left"
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
                <Icon className="h-5 w-5 text-indigo-300 flex-shrink-0" />
                <span className="text-white" style={{
                  color: '#FFF',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '23.88px'
                }}>{prompt.text}</span>
            </button>
          );
        })}
      </div>
    </div>

      {/* Chat area */}
      {showChat && (
        <div className="flex flex-col flex-1 min-h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isUser && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="32" 
                    height="32" 
                    viewBox="0 0 98 98" 
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <circle cx="49" cy="49" r="49" fill="url(#paint0_linear_361_5969)"/>
                    <defs>
                      <linearGradient id="paint0_linear_361_5969" x1="49" y1="0" x2="49" y2="98" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#0A2861"/>
                        <stop offset="1" stop-color="#FF928A"/>
                      </linearGradient>
                    </defs>
                  </svg>
                )}
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.isUser
                      ? 'bg-[#3E3EF4] text-white rounded-br-md'
                  : 'text-white rounded-bl-md'
              }`}
              style={{
                backgroundColor: message.isUser ? undefined : 'transparent',
                border: message.isUser ? undefined : '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div className="whitespace-pre-wrap" style={{
                color: '#FFF',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '23.88px'
              }}>
                {message.content}
              </div>
              <div className={`text-xs mt-2 opacity-70 ${message.isUser ? 'text-indigo-100' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.isUser && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 justify-start">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 98 98" 
                  fill="none"
                  className="flex-shrink-0"
                >
                  <circle cx="49" cy="49" r="49" fill="url(#paint0_linear_361_5969)"/>
                  <defs>
                    <linearGradient id="paint0_linear_361_5969" x1="49" y1="0" x2="49" y2="98" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#0A2861"/>
                      <stop offset="1" stop-color="#FF928A"/>
                    </linearGradient>
                  </defs>
                </svg>
            <div className="bg-white/10 text-white p-4 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
        </div>
      )}

      {/* Input bar */}
      {showChat && (
        <div className="mt-auto">
          <form
            className="flex gap-3"
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type message..."
              className="flex-1 outline-none chat-input"
              id="chat-message-input"
              disabled={isTyping}
              style={{
                padding: '8px 16px',
                borderRadius: '35px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                backgroundImage: 'none',
                color: '#FFF',
                fontFamily: 'Poppins',
                fontSize: '13px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: 'normal',
                letterSpacing: '2.05px',
                transition: 'border-color 0.3s ease',
                WebkitBoxShadow: '0 0 0 1000px rgba(0, 0, 0, 0) inset',
                boxShadow: '0 0 0 1000px rgba(0, 0, 0, 0) inset',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#60a5fa'}
              onBlur={(e) => e.target.style.borderColor = '#FFFFFF'}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-full text-white disabled:cursor-not-allowed transition-colors focus:outline-none flex items-center justify-start"
              style={{
                color: '#FFF',
                fontFamily: 'Poppins',
                fontSize: '14.944px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '25.493px',
                letterSpacing: '-0.448px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent'
              }}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AIChat;