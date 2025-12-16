import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true,
  
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { access_token, user } = response.data;
    
    localStorage.setItem('token', access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    set({ 
      token: access_token, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }, 
      isAuthenticated: true 
    });
  },
  
  register: async (email: string, password: string, firstName?: string, lastName?: string) => {
    await axios.post(`${API_URL}/auth/register`, { 
      email, 
      password, 
      firstName, 
      lastName 
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    set({ token: null, user: null, isAuthenticated: false });
  },
  
  updateUser: (updatedUser) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null
    }));
  },
  
  checkSession: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_URL}/auth/profile`);
      set({ 
        token,
        user: {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        },
        isAuthenticated: true,
        isLoading: false 
      });
    } catch {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Initialize session check
useAuthStore.getState().checkSession();
