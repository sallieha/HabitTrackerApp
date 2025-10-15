import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { testConnection } from '../lib/supabase';

function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Test connection first
      console.log('Testing Supabase connection...');
      const isConnected = await testConnection();
      
      if (!isConnected) {
        setError('Unable to connect to authentication service. Please check your internet connection.');
        setIsLoading(false);
        return;
      }

      console.log('Attempting to sign in with:', { email, password: '***' });
      await signIn(email, password);
      console.log('Sign in successful, navigating to AI Chat...');
      navigate('/ai-chat');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col" style={{ 
      backgroundImage: 'url(./background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      height: '780px', 
      minHeight: '780px' 
    }}>
      {/* Content area - scrollable */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '128px', paddingBottom: '48px' }}>
        <div className="w-full max-w-md mx-auto flex flex-col items-center" style={{ marginTop: '-20px' }}>
          {/* Gradient Circle */}
          <div
            className="w-28 h-28 rounded-full mb-8"
            style={{ background: 'linear-gradient(180deg, #FF928A 0%, #0A2861 100%)' }}
          />
          {/* Welcome Text */}
          <h1 className="text-2xl text-white text-center mb-2 font-light" style={{ fontWeight: 400 }}>Welcome to <span className="font-light" style={{ fontWeight: 400 }}>HabitTracker!</span></h1>
          <div className="w-2/3 border-t border-white/30 mx-auto mb-4" />
          <div className="text-white text-center mb-8 tracking-wide">Sign up to get started</div>
          {/* Error Message */}
          {error && <div className="w-full text-center text-red-400 mb-2 text-sm">{error}</div>}
          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 items-center">
            <input
              type="text"
              placeholder="SH"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-4/5 rounded-full bg-white/10 text-white placeholder-white/70 px-6 py-3 outline-none border-none text-base font-semibold shadow-sm focus:ring-2 focus:ring-indigo-400 text-center"
              autoComplete="name"
            />
            <input
              type="email"
              placeholder="Niko@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-4/5 rounded-full bg-white/10 text-white placeholder-white/70 px-6 py-3 outline-none border-none text-base font-semibold shadow-sm focus:ring-2 focus:ring-indigo-400 text-center"
              autoComplete="email"
              required
            />
            <input
              type="password"
              placeholder="*************"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-4/5 rounded-full bg-white/10 text-white placeholder-white/70 px-6 py-3 outline-none border-none text-base font-semibold shadow-sm focus:ring-2 focus:ring-indigo-400 text-center"
              autoComplete="current-password"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 px-8 py-3 rounded-full text-white bg-[#3E3EF4] hover:bg-[#3535d6] shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                minWidth: 180, 
                color: '#FFF',
                fontFamily: 'Poppins',
                fontSize: '14.944px',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '25.493px',
                letterSpacing: '-0.448px'
              }}
            >
              {isLoading ? 'Connecting...' : 'Continue'}
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;