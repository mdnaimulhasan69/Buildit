import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPublicProfile } from '../types/index.ts';
import {
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth,
  apiFetch
} from '../lib/api-client.ts';

interface AuthContextType {
  user: UserPublicProfile | null;
  token: string | null;
  isLoading: boolean;
  loginUser: (token: string, user: UserPublicProfile) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPublicProfile | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyExistingAuth() {
      const storedTok = getStoredToken();
      if (!storedTok) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      const res = await apiFetch<{ user: UserPublicProfile }>('/api/auth/me');
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        setToken(storedTok);
      } else {
        clearStoredAuth();
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    }

    verifyExistingAuth();
  }, []);

  const loginUser = (newToken: string, newUser: UserPublicProfile) => {
    setStoredAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logoutUser = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
