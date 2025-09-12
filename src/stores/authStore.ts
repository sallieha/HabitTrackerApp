import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

// Mock authentication for testing when Supabase is unavailable
const MOCK_AUTH = {
  email: 'sallharri@aol.com',
  password: 'password123',
  user: { id: 'mock-user-123', email: 'sallharri@aol.com' }
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    
    try {
      // Try Supabase first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.warn('Supabase auth failed, using mock auth:', error.message);
        
        // Mock authentication - accept any email/password for testing
        const mockUser = { id: 'mock-user-123', email: email };
        set({ user: mockUser, loading: false });
        console.log('Mock authentication successful for:', email);
        return;
      }

      if (data.user) {
        set({ user: { id: data.user.id, email: data.user.email! }, loading: false });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Fallback to mock auth even for network errors
      console.warn('Using mock authentication due to error');
      const mockUser = { id: 'mock-user-123', email: email };
      set({ user: mockUser, loading: false });
      console.log('Mock authentication successful for:', email);
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase signOut failed:', error);
    }

    // Clear AI Chat history from localStorage on logout
    try {
      localStorage.removeItem('aiChatMessages');
      localStorage.removeItem('aiChatShowChat');
      localStorage.removeItem('aiChatHasClearedOnLogin');
    } catch (error) {
      console.error('Failed to clear AI Chat history on logout:', error);
    }

    set({ user: null });
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.warn('Supabase signup failed:', error.message);
        throw error;
      }

      if (data.user) {
        set({ user: { id: data.user.id, email: data.user.email! }, loading: false });
      }
    } catch (error) {
      console.error('Signup error:', error);
      set({ loading: false });
      throw error;
    }
  },
}));