
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';

interface UserContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Carregar usuário ao iniciar
        const savedUser = localStorage.getItem('gago_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Erro ao carregar usuário", e);
                localStorage.removeItem('gago_user');
            }
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('gago_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gago_user');
    };

    const updateUser = (data: Partial<User>) => {
        setUser(current => {
            if (!current) return null;
            const updated = { ...current, ...data };
            localStorage.setItem('gago_user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <UserContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser deve ser usado dentro de um UserProvider');
    }
    return context;
};
