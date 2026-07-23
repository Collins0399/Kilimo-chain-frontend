import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = api.auth.getCurrentUser();
    const currentToken = api.auth.getToken();
    if (currentUser && currentToken) {
      setUser(currentUser);
      setToken(currentToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    if (data.accessToken) {
      setToken(data.accessToken);
      setUser({
        userId: data.userId,
        fullName: data.fullName,
        role: data.role,
      });
    }
    return data;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
