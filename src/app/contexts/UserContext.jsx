"use client";
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { fetchUserByEmail } from '@/lib/api/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const initializedRef = useRef(false);

    const logout = async (redirectTo = '/', { sessionExpired = false } = {}) => {
        try {
            if (auth) await signOut(auth);
        } catch {}
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('user');
        const url = sessionExpired ? `${redirectTo}?session_expired=true` : redirectTo;
        window.location.href = url;
    };

    useEffect(() => {
        if (!auth) {
            setUserLoading(false);
            return;
        }

        const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                setAccessToken(token);

                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    try {
                        const userData = await fetchUserByEmail(firebaseUser.email);
                        if (userData) {
                            setUser(userData);
                            localStorage.setItem('user', JSON.stringify(userData));
                        }
                    } catch {}
                }
            } else {
                setAccessToken(null);
                if (initializedRef.current && user) {
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }

            if (!initializedRef.current) {
                initializedRef.current = true;
                setUserLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleAuthExpired = () => {
            logout("/IniciarSesion", { sessionExpired: true });
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
