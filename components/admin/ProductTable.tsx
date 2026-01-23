
'use client';

import { useState } from 'react';
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Trash2, Edit, Search, Plus } from "lucide-react";
import { deleteProductAction } from "@/lib/actions";
import styles from './AdminResponsive.module.css';

interface ProductTableProps {
    products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter(product => {
        const term = searchTerm.toLowerCase();
        return (
            product.name.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    });

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
            await deleteProductAction(id);
        }
    };

    return (
        <>
            {/* Search Bar */}
            <div className={styles.actionBar}>
                <div className={styles.searchInput}>
                    <Search size={20} color="#888" style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Buscar produto por nome ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#eee',
                            flex: 1,
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <Link href="/admin/products/new">
                    <Button style={{ display: 'none' }}>
                        <Plus size={20} /> Novo Produto
                    </Button>
                </Link>
            </div>

            {/* Mobile View */}
            <div className={styles.mobileCards}>
                {filteredProducts.map(product => (
                    <div key={product.id} className={styles.card}>
                        <div className={styles.cardTitle}>{product.name}</div>
                        <div className={styles.cardRow}>
                            <span className={styles.cardLabel}>Categoria</span>
                            <span style={{
                                background: '#333',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                color: '#eee'
                            }}>
                                {product.category}
                            </span>
                        </div>
                        <div className={styles.cardRow}>
                            <span className={styles.cardLabel}>Preço</span>
                            <span className={styles.cardValue}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                            </span>
                        </div>
                        <div className={styles.cardActions}>
                            <Link href={`/admin/products/${product.id}`}>
                                <Button size="sm" variant="ghost" style={{ color: '#4da6ff' }}>
                                    <Edit size={16} /> Editar
                                </Button>
                            </Link>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} style={{ color: '#ff4444' }}>
                                <Trash2 size={16} /> Excluir
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <table className={styles.desktopTable} style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                        <th style={{ padding: '1rem' }}>Nome</th>
                        <th style={{ padding: '1rem' }}>Categoria</th>
                        <th style={{ padding: '1rem' }}>Preço</th>
                        <th style={{ padding: '1rem' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                            <td style={{ padding: '1rem' }}>{product.name}</td>
                            <td style={{ padding: '1rem' }}>
                                <span style={{
                                    background: '#333',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                }}>
                                    {product.category}
                                </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                            </td>
                            <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <Link href={`/admin/products/${product.id}`}>
                                    <Button size="sm" variant="ghost" style={{ color: '#4da6ff' }}>
                                        <Edit size={16} />
                                    </Button>
                                </Link>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)} style={{ color: '#ff4444' }}>
                                    <Trash2 size={16} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
