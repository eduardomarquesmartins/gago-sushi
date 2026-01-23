
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    total: number;
    subtotal: number;
    deliveryFee: number;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; deliveryFee?: number }> = ({ children, deliveryFee = 0 }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem('cart');
        if (saved) setItems(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isMounted]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const clearCart = () => setItems([]);

    const addItem = (product: Product) => {
        setItems(current => {
            const existing = current.find(item => item.id === product.id);
            if (existing) {
                return current.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...current, { ...product, quantity: 1 }];
        });
        // setIsOpen(true); // Removido para não abrir automaticamente
    };

    const removeItem = (productId: string) => {
        setItems(current => current.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(productId);
            return;
        }
        setItems(current =>
            current.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Só cobra taxa se tiver itens no carrinho
    const total = items.length > 0 ? itemsTotal + deliveryFee : 0;

    return (
        <CartContext.Provider value={{
            items, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart,
            total, subtotal: itemsTotal, deliveryFee
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
