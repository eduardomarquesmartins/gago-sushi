
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import styles from './CartDrawer.module.css';

export const CartDrawer = () => {
    const router = useRouter();
    const { items, isOpen, closeCart, updateQuantity, removeItem, total, subtotal, deliveryFee } = useCart();

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={closeCart} />
            <div className={styles.drawer}>
                <div className={styles.header}>
                    <h2>Seu Pedido</h2>
                    <button onClick={closeCart} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.items}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <Trash2 size={48} />
                            <p>Seu carrinho está vazio</p>
                            <Button variant="ghost" onClick={closeCart}>Voltar ao cardápio</Button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className={styles.item}>
                                <div className={styles.itemImage}>
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span role="img" aria-label="sushi" style={{ fontSize: '1.5rem' }}>🍣</span>
                                    )}
                                </div>
                                <div className={styles.itemInfo}>
                                    <h4>{item.name}</h4>
                                    <span className={styles.price}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                    </span>

                                    <div className={styles.controls}>
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className={styles.qtyBtn}>
                                            <Minus size={12} />
                                        </button>
                                        <span className={styles.qtyValue}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className={styles.qtyBtn}>
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.itemActions}>
                                    <button onClick={() => removeItem(item.id)} className={styles.removeBtn} aria-label="Remover">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Entrega</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deliveryFee)}</span>
                        </div>
                        <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                            <span>Total</span>
                            <span className={styles.totalValue}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </span>
                        </div>
                        <Button size="lg" style={{ width: '100%' }} onClick={() => {
                            closeCart();
                            router.push('/checkout');
                        }}>
                            Finalizar Pedido
                        </Button>
                    </div>
                )}
            </div >
        </>
    );
};
