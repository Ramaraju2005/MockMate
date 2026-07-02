import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          setUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to check your login status.');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (requestError) {
        console.error(requestError);
        setError('Could not connect to the backend. Make sure it is running.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed.');
      }

      setUser(null);
    } catch (requestError) {
      console.error(requestError);
      setError('Could not log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
