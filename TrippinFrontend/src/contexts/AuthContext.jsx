import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('trippin_token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Validate existing token on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('trippin_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
        setToken(storedToken);
      } catch {
        localStorage.removeItem('trippin_token');
        localStorage.removeItem('trippin_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    validateToken();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('trippin_token', newToken);
      localStorage.setItem('trippin_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      toast.success('Welcome back!');
      return userData;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data || 'Login failed');
      throw error;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('trippin_token', newToken);
      localStorage.setItem('trippin_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      toast.success('Account created successfully');
      return userData;
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data || 'Registration failed');
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      const response = await api.post('/auth/google', { idToken });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('trippin_token', newToken);
      localStorage.setItem('trippin_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      toast.success('Logged in with Google');
      return userData;
    } catch (error) {
      toast.error('Google login failed');
      throw error;
    }
  }, []);

  const loginWithGitHub = useCallback(async (code) => {
    try {
      const response = await api.post('/auth/github', { code });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('trippin_token', newToken);
      localStorage.setItem('trippin_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      toast.success('Logged in with GitHub');
      return userData;
    } catch (error) {
      toast.error('GitHub login failed');
      throw error;
    }
  }, []);

  const loginWithMicrosoft = useCallback(async (idToken) => {
    try {
      const response = await api.post('/auth/microsoft', { idToken });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('trippin_token', newToken);
      localStorage.setItem('trippin_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      toast.success('Logged in with Microsoft');
      return userData;
    } catch (error) {
      toast.error('Microsoft login failed');
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('trippin_token');
    localStorage.removeItem('trippin_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('trippin_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, token, isAuthenticated, isLoading, login, register, logout, updateUser,
      loginWithGoogle, loginWithGitHub, loginWithMicrosoft
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
