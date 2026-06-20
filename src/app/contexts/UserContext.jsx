"use client";
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { getUserInfo } from "@/lib/api/auth";

const UserContext = createContext();

const getTokenExpiry = (token) => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        return payload.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const expiryTimerRef = useRef(null);

    const clearExpiryTimer = () => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
    };

    const logout = (redirectTo = '/', { sessionExpired = false } = {}) => {
        clearExpiryTimer();
        setUser(null);
        setAccessToken(null);
        localStorage.clear();
        const url = sessionExpired ? `${redirectTo}?session_expired=true` : redirectTo;
        window.location.href = url;
    };

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('access_token');

        if (storedUser && storedUser.length > 0) {
            if (!storedToken) {
                logout("/IniciarSesion", { sessionExpired: true });
                return;
            }
            setUser(JSON.parse(storedUser));
            setAccessToken(storedToken);
        }
        setUserLoading(false);
    }, []);

    // Validate token and schedule auto-logout on expiry
    useEffect(() => {
        if (!user) return;

        if (!accessToken) {
            logout("/IniciarSesion", { sessionExpired: true });
            return;
        }

        const userId = user?.id ?? user?.user_id;
        if (!userId) return;

        // Decode JWT and check expiry
        clearExpiryTimer();
        const expiryMs = getTokenExpiry(accessToken);
        if (expiryMs) {
            const msUntilExpiry = expiryMs - Date.now();
            if (msUntilExpiry <= 0) {
                logout("/IniciarSesion", { sessionExpired: true });
                return;
            }
            expiryTimerRef.current = setTimeout(() => logout("/IniciarSesion", { sessionExpired: true }), msUntilExpiry);
        }

        // Also validate with the server immediately
        let isMounted = true;
        const validateToken = async () => {
            try {
                const response = await getUserInfo({ user_id: userId, access_token: accessToken });
                if (!isMounted) return;
                if (response.status === 401 || response.status === 403) {
                    logout("/IniciarSesion", { sessionExpired: true });
                }
            } catch (error) {
                console.error("Error validating access token:", error);
            }
        };
        validateToken();

        // Re-validate when el usuario vuelve a la pestaña después de estar inactivo
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') validateToken();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            clearExpiryTimer();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, accessToken]);

    // Escucha el evento global que dispara apiFetch cuando cualquier llamada recibe 401/403
    useEffect(() => {
        const handleAuthExpired = () => {
            localStorage.clear();
            window.location.href = '/IniciarSesion';
        };
        window.addEventListener('auth:expired', handleAuthExpired);
        return () => window.removeEventListener('auth:expired', handleAuthExpired);
    }, []);

    const setUserData = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const setToken = (token) => {
        setAccessToken(token);
        localStorage.setItem('access_token', token);
    };

    return (
        <UserContext.Provider value={{ user, accessToken, userLoading, setUserData, setToken, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
