
'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import styles from './CartBottomBar.module.css';
import { ShoppingBag, ChevronRight } from 'lucide-react';

export const CartBottomBar = () => {
    const { items, total, openCart } = useCart();

    if (items.length === 0) return null;

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className={styles.wrapper}>
            <button className={styles.bar} onClick={openCart}>
                <div className={styles.info}>
                    <div className={styles.iconBadge}>
                        <ShoppingBag size={20} />
                        <span className={styles.badge}>{itemCount}</span>
                    </div>
                    <span className={styles.total}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                    </span>
                </div>

                <div className={styles.action}>
                    <span>Finalizar Pedido</span>
                    <ChevronRight size={20} />
                </div>
            </button>
        </div>
    );
};
