'use client';

import React, { useState } from 'react';
import { User, Phone, MapPin, Search, Trash2, Edit, Plus, X } from "lucide-react";
import { deleteUserAction, registerUserAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import styles from './AdminResponsive.module.css';

interface CustomerTableProps {
    users: any[];
}

export function CustomerTable({ users }: CustomerTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        address: { street: '', number: '', zip: '', neighborhood: '', city: 'Porto Alegre' }
    });

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.phone?.includes(term)
        );
    });

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            await deleteUserAction(id);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        const userData = {
            name: newCustomer.name,
            phone: newCustomer.phone,
            password: '123', // Default password for manual users
            address: newCustomer.address
        };

        const result = await registerUserAction(userData);
        if (result.success) {
            setIsCreateModalOpen(false);
            setNewCustomer({ name: '', phone: '', address: { street: '', number: '', zip: '', neighborhood: '', city: 'Porto Alegre' } });
            window.location.reload();
        } else {
            alert(result.error || 'Erro ao criar cliente');
        }
        setIsCreating(false);
    };

    return (
        <div style={{ background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333', padding: '1px', position: 'relative' }}>

            {/* Modal de Criação */}
            {isCreateModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', zIndex: 999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ background: '#2a2a2a', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid #444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Novo Cliente</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input required placeholder="Nome Completo" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} style={inputStyle} />
                            <input required placeholder="Telefone" value={newCustomer.phone} onChange={e => handlePhoneChange(e, setNewCustomer)} style={inputStyle} />

                            <div style={{ padding: '0.5rem 0', color: '#888', fontSize: '0.9rem' }}>Endereço</div>
                            <input required placeholder="Rua" value={newCustomer.address.street} onChange={e => setNewCustomer({ ...newCustomer, address: { ...newCustomer.address, street: e.target.value } })} style={inputStyle} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input required placeholder="Número" value={newCustomer.address.number} onChange={e => setNewCustomer({ ...newCustomer, address: { ...newCustomer.address, number: e.target.value } })} style={inputStyle} />
                                <input placeholder="Bairro" value={newCustomer.address.neighborhood} onChange={e => setNewCustomer({ ...newCustomer, address: { ...newCustomer.address, neighborhood: e.target.value } })} style={inputStyle} />
                            </div>

                            <Button disabled={isCreating} type="submit" size="lg" style={{ marginTop: '1rem' }}>
                                {isCreating ? 'Salvando...' : 'Salvar Cliente'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Search Bar & Actions */}
            <div className={styles.actionBar}>
                <div className={styles.searchInput}>
                    <Search size={20} color="#888" style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou telefone..."
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
                <Button onClick={() => setIsCreateModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                    <Plus size={20} /> Novo Cliente
                </Button>
            </div>

            {/* Mobile View */}
            <div className={styles.mobileCards}>
                {filteredUsers.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        {users.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
                    </div>
                ) : (
                    filteredUsers.map((user: any, index: number) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={18} color="#eee" /> {user.name}
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>Email</span>
                                <span className={styles.cardValue} style={{ fontSize: '0.9rem' }}>{user.email}</span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>Contato</span>
                                <span className={styles.cardValue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Phone size={14} color="#888" /> {user.phone}
                                </span>
                            </div>
                            <div className={styles.cardRow}>
                                <span className={styles.cardLabel}>Endereço</span>
                                <span className={styles.cardValue} style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                                    {user.address.street}, {user.address.number}
                                </span>
                            </div>
                            <div className={styles.cardActions}>
                                <Link href={`/admin/customers/${user.id}`}>
                                    <Button size="sm" variant="ghost" style={{ color: '#4da6ff' }}>
                                        <Edit size={16} /> Editar
                                    </Button>
                                </Link>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(user.id)} style={{ color: '#ff4444' }}>
                                    <Trash2 size={16} /> Excluir
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View */}
            <table className={styles.desktopTable} style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                        <th style={{ padding: '1rem' }}>Nome</th>
                        <th style={{ padding: '1rem' }}>Contato</th>
                        <th style={{ padding: '1rem' }}>Endereço</th>
                        <th style={{ padding: '1rem' }}>Cadastro</th>
                        <th style={{ padding: '1rem' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                {users.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
                            </td>
                        </tr>
                    ) : (
                        filteredUsers.map((user: any, index: number) => (
                            <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ padding: '0.5rem', background: '#333', borderRadius: '50%' }}>
                                            <User size={16} />
                                        </div>
                                        <strong>{user.name}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#888', paddingLeft: '2.5rem' }}>{user.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Phone size={14} color="#888" />
                                        {user.phone}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <MapPin size={14} color="#888" style={{ marginTop: '3px' }} />
                                        <div>
                                            {user.address.street}, {user.address.number}<br />
                                            <span style={{ color: '#888' }}>{user.address.zip}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <Link href={`/admin/customers/${user.id}`}>
                                        <Button size="sm" variant="ghost" style={{ color: '#4da6ff' }}>
                                            <Edit size={16} />
                                        </Button>
                                    </Link>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(user.id)} style={{ color: '#ff4444' }}>
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    setter((prev: any) => ({ ...prev, phone: value }));
};

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#333',
    color: '#fff',
    outline: 'none'
};
