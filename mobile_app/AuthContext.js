import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Try to get saved token
        const savedToken = await AsyncStorage.getItem('userToken');
        const savedUser = await AsyncStorage.getItem('userData');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error('Failed to restore authentication state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (userData, userToken) => {
    try {
      // Save token and user data to storage
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setToken(userToken);
    } catch (e) {
      console.error('Failed to save auth data:', e);
      throw e;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call the logout API endpoint
      await fetch('http://10.0.2.2/wesshacks/api/users.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          action: 'logout',
        }),
      });
      
      // Remove token and user data from storage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Update state
      setUser(null);
      setToken(null);
    } catch (e) {
      console.error('Failed to logout:', e);
      
      // Even if API call fails, clear local state
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setToken(null);
    }
  };

  // Register function
  const register = async (userData, userToken) => {
    try {
      // Just log the user in after successful registration
      await login(userData, userToken);
    } catch (e) {
      console.error('Failed to save registration data:', e);
      throw e;
    }
  };

  // Get auth header for API requests
  const getAuthHeader = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Auth context value
  const value = {
    user,
    token,
    isLoading,
    isSignedIn: !!user,
    login,
    logout,
    register,
    getAuthHeader,
  };

  // Provide the auth context to children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;