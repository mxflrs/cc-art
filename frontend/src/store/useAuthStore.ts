import { create } from 'zustand';
import axios from 'axios';

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
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
    delete axios.defaults.headers.common['Authorization'];
  },
}));
