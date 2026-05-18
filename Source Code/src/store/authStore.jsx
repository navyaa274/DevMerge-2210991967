import { create } from 'zustand';

const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user || user === 'undefined' || user === 'null') {
      localStorage.removeItem('user');
      return null;
    }
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const getTokenFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    localStorage.removeItem('token');
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getUserFromStorage(),
  token: getTokenFromStorage(),

  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
  updateUser: (updatedUser) => set((state) => {
    const newUser = { ...state.user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(newUser));
    return { user: newUser };
  })
}));
