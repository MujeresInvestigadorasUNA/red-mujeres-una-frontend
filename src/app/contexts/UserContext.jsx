"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Check if data exists in localStorage and update state
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedUser.length > 0 && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
  }, []);

  // Function to update user data
  const setUserData = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Function to update the access token
  const setToken = (token) => {
    setAccessToken(token);
    localStorage.setItem('access_token', token);
  };

  // Logout function
  const logout = (redirectTo = '/') => {
    setUser(null);
    setAccessToken(null);
    localStorage.clear();
    window.location.href = redirectTo;
  };

  return (
    <UserContext.Provider value={{ user, accessToken, setUserData, setToken, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the context
export const useUser = () => {
  return useContext(UserContext);
};