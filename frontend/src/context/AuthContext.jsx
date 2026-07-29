import { createContext, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { SESSION_KEY } from '../services/api.js';

const AuthContext = createContext(null);

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const saveSession = (nextSession) => {
    setSession(nextSession);

    if (nextSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const login = async (credentials) => {
    const nextSession = await authService.login(credentials);
    saveSession(nextSession);
    return nextSession;
  };

  const register = async (payload) => {
    const nextSession = await authService.register(payload);
    saveSession(nextSession);
    return nextSession;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Stateless JWT logout succeeds locally even if the API is unavailable.
    } finally {
      saveSession(null);
    }
  };

  const updateUser = (user) => {
    saveSession({
      ...session,
      user
    });
  };

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout,
      updateUser
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
