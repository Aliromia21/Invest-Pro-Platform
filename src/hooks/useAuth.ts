
import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type { User, LoginRequest, SignupRequest } from '../types/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user:', err);
      authService.clearSession();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.signup(data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    loadUser,
  };
}
