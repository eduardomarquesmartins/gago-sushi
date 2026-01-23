'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import styles from './Header.module.css';

export const Header = () => {
    const { openCart, items } = useCart();
    const { isAuthenticated } = useUser();
    const pathname = usePathname();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    const logoSrc = pathname === '/' ? '/logopreta.jpg' : '/logogago.jpg';

    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>

                <Link href="/" className={styles.logo}>
                    <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                        <img src={logoSrc} alt="Gago Sushi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </Link>

                <nav className={styles.nav}>
                    <Link href="/menu" className={styles.link}>Cardápio</Link>
                    {isAuthenticated ? (
                        <Link href="/account" className={styles.link} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={18} /> Minha Conta
                        </Link>
                    ) : (
                        <Link href="/login" className={styles.link}>Entrar</Link>
                    )}
                </nav>

                <div className={styles.actions}>
                    {/* Botões Mobile visíveis apenas em telas pequenas via CSS */}
                    <Link href="/menu" className={styles.mobileAction} aria-label="Cardápio">
                        <Utensils size={20} />
                    </Link>

                    <Link href={isAuthenticated ? "/account" : "/login"} className={styles.mobileAction} aria-label={isAuthenticated ? "Minha Conta" : "Entrar"}>
                        <User size={20} />
                    </Link>

                    <Button variant="ghost" size="sm" className={styles.cartButton} onClick={openCart}>
                        <ShoppingBag size={20} />
                        {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
                    </Button>
                </div>
            </div>
        </header>
    );
};
