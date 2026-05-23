"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserInfo } from "@/lib/api/auth";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Check if data exists in localStorage and update state
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');

    if (storedUser && storedUser.length > 0) {
      if (!storedToken) {
        logout("/IniciarSesion");
        return;
      }

      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!accessToken) {
      logout("/IniciarSesion");
      return;
    }

    const userId = user?.id ?? user?.user_id;
    if (!userId) {
      return;
    }

    let isMounted = true;
    const validateToken = async () => {
      try {
        const response = await getUserInfo({ user_id: userId, access_token: accessToken });
        if (!isMounted) {
          return;
        }

        if (response.status === 401 || response.status === 403) {
          logout("/IniciarSesion");
        }
      } catch (error) {
        console.error("Error validating access token:", error);
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [user, accessToken]);

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