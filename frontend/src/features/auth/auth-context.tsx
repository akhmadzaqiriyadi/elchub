'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, logout as logoutApi } from './api';
import type { AuthUser } from './types';
import { authTokenStorageKey, authTokenCookieKey } from './auth-panel.constants';
import { readCookieToken } from './auth-panel.utils';
import { toast } from 'sonner';

type AuthContextValue = {
  user: AuthUser | null;
  token: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  setToken: (token: string) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Hydrate token from storage
  useEffect(() => {
    setIsClient(true);
    const localToken = typeof window !== 'undefined' ? (localStorage.getItem(authTokenStorageKey) ?? '') : '';
    const cookieToken = readCookieToken();
    const restoredToken = localToken || cookieToken;
    if (restoredToken) {
      setTokenState(restoredToken);
    }
  }, []);

  // Query for user data
  const meQuery = useQuery<AuthUser>({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      const response = await getMe(token);
      return response.data.user;
    },
    enabled: Boolean(token) && isClient,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const setToken = (nextToken: string) => {
    setTokenState(nextToken);
    if (nextToken) {
      localStorage.setItem(authTokenStorageKey, nextToken);
      document.cookie = `${authTokenCookieKey}=${encodeURIComponent(nextToken)}; Path=/; Max-Age=900; SameSite=Lax`;
      // Invalidate and refetch user data when token is set
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    } else {
      localStorage.removeItem(authTokenStorageKey);
      document.cookie = `${authTokenCookieKey}=; Path=/; Max-Age=0; SameSite=Lax`;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await logoutApi(token);
      }
      setToken('');
      queryClient.removeQueries({ queryKey: ['auth'] });
      toast.success('Logout berhasil');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout gagal';
      toast.error(message);
    }
  };

  const refreshUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  };

  const value = useMemo(
    () => ({
      user: meQuery.data ?? null,
      token,
      isLoading: meQuery.isFetching,
      isAuthenticated: Boolean(token && meQuery.data),
      logout,
      setToken,
      refreshUser,
    }),
    [meQuery.data, meQuery.isFetching, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
