
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/shop/Header';
import { Button } from '@/components/ui/Button';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { LogOut, Save, User as UserIcon } from 'lucide-react';

export default function AccountPage() {
    const { user, updateUser, logout, isAuthenticated } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const formData = new FormData(e.currentTarget);

        const updatedData = {
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            address: {
                neighborhood: formData.get('neighborhood') as string,
                street: formData.get('street') as string,
                number: formData.get('number') as string,
                complement: formData.get('complement') as string,
            }
        };

        updateUser(updatedData);

        setTimeout(() => {
            setIsLoading(false);
            setMessage('Dados atualizados com sucesso!');
        }, 800);
    };

    if (!user) return null;

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 600
    };

    return (
        <main style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '4rem' }}>
            <Header />
            <div className="container" style={{ paddingTop: '140px', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserIcon /> Minha Conta
                    </h1>
                    <Button variant="outline" onClick={() => { logout(); router.push('/'); }} style={{ borderColor: '#ff4444', color: '#ff4444' }}>
                        <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Sair
                    </Button>
                </div>

                {message && (
                    <div style={{ background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #c3e6cb' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700 }}>Dados Pessoais</h3>

                    <div>
                        <label style={labelStyle}>Nome Completo</label>
                        <input name="name" type="text" defaultValue={user.name} required style={inputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Telefone / WhatsApp</label>
                            <input name="phone" type="text" defaultValue={user.phone} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input name="email" type="email" defaultValue={user.email} required style={inputStyle} />
                        </div>
                    </div>

                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: 'var(--primary)', fontWeight: 700, marginTop: '1rem' }}>Endereço Padrão</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Rua</label>
                            <input name="street" type="text" defaultValue={user.address.street} required style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Número</label>
                            <input name="number" type="text" defaultValue={user.address.number} required style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Bairro</label>
                        <input name="neighborhood" type="text" defaultValue={user.address.neighborhood} required style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Complemento</label>
                        <input name="complement" type="text" defaultValue={user.address.complement} style={inputStyle} />
                    </div>

                    <Button type="submit" size="lg" disabled={isLoading} style={{ marginTop: '1rem' }}>
                        <Save size={20} style={{ marginRight: '0.5rem' }} />
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </form>
            </div>
        </main>
    );
}
