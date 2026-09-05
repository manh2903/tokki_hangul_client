import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api/authApi';
import { usersApi } from '@/api/usersApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(false);

  // Fetch latest user profile if token is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const res = await usersApi.getMe();
          const userData = res?.data || res;
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.warn('Failed to load user profile:', err);
        }
      }
    };

    fetchUserProfile();
  }, [token]);

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      const res = await authApi.googleAuth(credential);
      const data = res?.data || res;

      if (data?.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const data = res?.data || res;

      if (data?.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authApi.register(name, email, password);
      const data = res?.data || res;

      if (data?.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout().catch(() => null);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProgress = (gamification) => {
    if (!gamification) return;
    setUser((prev) => {
      const updated = {
        ...prev,
        streakDays: gamification.streakDays !== undefined ? gamification.streakDays : prev?.streakDays || 0,
        longestStreak: gamification.longestStreak !== undefined ? gamification.longestStreak : prev?.longestStreak || 0,
        expPoints: gamification.expPoints !== undefined ? gamification.expPoints : prev?.expPoints || 0,
        carrots: gamification.carrots !== undefined ? gamification.carrots : prev?.carrots || 0,
        totalStudyTimeMin: gamification.totalStudyTimeMin !== undefined ? gamification.totalStudyTimeMin : prev?.totalStudyTimeMin || 0,
      };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        updateProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
