'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shop/Header';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { registerUserAction } from '@/lib/actions';
import { fetchAddressByCep } from '@/lib/viacep';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        const name = formData.get('name') as string;
        const phone = formData.get('phone') as string;
        const email = formData.get('email') as string;
        const neighborhood = formData.get('neighborhood') as string;
        const street = formData.get('street') as string;
        const number = formData.get('number') as string;
        const complement = formData.get('complement') as string;

        const password = formData.get('password') as string;

        const userData = {
            name,
            phone,
            email,
            password,
            address: {
                neighborhood,
                street,
                number,
                complement
            }
        };

        // DEBUG: Verificar se os dados estão sendo capturados
        console.log('Dados do Cadastro:', userData);

        if (!name || !phone || !street) {
            alert('Erro ao capturar dados. Por favor preencha novamente.');
            setIsLoading(false);
            return;
        }

        // Salvar no "Backend" (JSON)
        await registerUserAction(userData);

        // Usar context para login local
        login(userData);

        setTimeout(() => {
            setIsLoading(false);
            router.push('/checkout');
        }, 500);
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value;
        if (cep.replace(/\D/g, '').length === 8) {
            const result = await fetchAddressByCep(cep);

            if (result.success && result.data) {
                // Preencher campos
                const form = document.querySelector('form');
                if (form) {
                    const streetInput = form.querySelector('input[name="street"]') as HTMLInputElement;
                    // const complementInput = form.querySelector('input[name="complement"]') as HTMLInputElement; 

                    if (streetInput) streetInput.value = result.data.logradouro;

                    // Validar cidade
                    if (result.data.localidade !== 'Porto Alegre') {
                        alert(`Atenção: Entregamos apenas em Porto Alegre. Sua cidade identificada foi: ${result.data.localidade}.`);
                    }
                }
            } else {
                if (result.error) alert(result.error);
            }
        }
    };

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
        <main style={{ minHeight: '100vh', background: '#fff', paddingBottom: '4rem' }}>
            <Header />
            <div className="container" style={{ paddingTop: '140px', maxWidth: '500px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Criar Conta</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Preencha seus dados para agilizar seus pedidos.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={labelStyle}>Nome Completo</label>
                        <input name="name" type="text" required style={inputStyle} placeholder="Ex: João Silva" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>CPF <span style={{ fontWeight: 400, color: '#888' }}>(Opcional)</span></label>
                            <input name="cpf" type="text" style={inputStyle} placeholder="000.000.000-00" />
                        </div>
                        <div>
                            <label style={labelStyle}>Telefone / WhatsApp</label>
                            <input name="phone" type="text" required style={inputStyle} placeholder="(00) 00000-0000" />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Email</label>
                        <input name="email" type="email" required style={inputStyle} placeholder="seu@email.com" />
                    </div>

                    <div>
                        <label style={labelStyle}>Senha</label>
                        <input name="password" type="password" required style={inputStyle} minLength={6} />
                    </div>

                    <div style={{ borderTop: '1px solid #eee', margin: '1rem 0', paddingTop: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Endereço de Entrega</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={labelStyle}>Bairro</label>
                            <input name="neighborhood" type="text" required style={inputStyle} placeholder="Ex: Centro" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Rua</label>
                                <input name="street" type="text" required style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Número</label>
                                <input name="number" type="text" required style={inputStyle} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Complemento</label>
                            <input name="complement" type="text" style={inputStyle} placeholder="Apto, Bloco, Referência" />
                        </div>
                    </div>

                    <Button type="submit" size="lg" disabled={isLoading} style={{ marginTop: '1rem' }}>
                        {isLoading ? 'Concluir Cadastro' : 'Criar Conta'}
                    </Button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
                    Já tem conta?{' '}
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Faça Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
