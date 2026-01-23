'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shop/Header';
import { verifyUserIdentityAction, resetUserPasswordAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Verificar, 2: Nova Senha
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Verificar Identidade
    const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;

        const result = await verifyUserIdentityAction(email, phone);

        if (result.success && result.userId) {
            setUserId(result.userId);
            setStep(2);
        } else {
            setError(result.error || 'Erro ao verificar dados.');
        }
        setIsLoading(false);
    };

    // Step 2: Redefinir Senha
    const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setIsLoading(false);
            return;
        }

        const result = await resetUserPasswordAction(userId, password);

        if (result.success) {
            alert('Senha redefinida com sucesso!');
            router.push('/login');
        } else {
            setError(result.error || 'Erro ao redefinir senha.');
            setIsLoading(false);
        }
    };

    // Máscara de Telefone (Reutilizada simples)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/\D/g, "");
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
        e.target.value = value;
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
            <div className="container" style={{ paddingTop: '140px', maxWidth: '400px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                    {step === 1 ? 'Recuperar Senha' : 'Nova Senha'}
                </h1>

                {step === 1 && (
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                        Confirme seus dados para continuar.
                    </p>
                )}

                {step === 1 ? (
                    <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Email Cadastrado</label>
                            <input name="email" type="email" required style={inputStyle} placeholder="seu@email.com" />
                        </div>

                        <div>
                            <label style={labelStyle}>Telefone Cadastrado</label>
                            <input
                                name="phone"
                                type="text"
                                required
                                style={inputStyle}
                                placeholder="(11) 99999-9999"
                                maxLength={15}
                                onChange={handlePhoneChange}
                            />
                        </div>

                        {error && <div style={{ color: 'red', fontSize: '0.875rem' }}>{error}</div>}

                        <Button type="submit" size="lg" disabled={isLoading} style={{ marginTop: '1rem' }}>
                            {isLoading ? 'Verificar' : 'Continuar'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} autoComplete="off">
                        {/* Hack para evitar autocomplete do browser */}
                        <input type="password" style={{ display: 'none' }} />

                        <div>
                            <label style={labelStyle}>Nova Senha</label>
                            <input
                                name="password"
                                type="password"
                                required
                                style={inputStyle}
                                minLength={6}
                                placeholder="******"
                                autoComplete="new-password"
                                readOnly
                                onFocus={(e) => e.target.removeAttribute('readonly')}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Confirmar Nova Senha</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                style={inputStyle}
                                minLength={6}
                                placeholder="******"
                                autoComplete="new-password"
                                readOnly
                                onFocus={(e) => e.target.removeAttribute('readonly')}
                            />
                        </div>

                        {error && <div style={{ color: 'red', fontSize: '0.875rem' }}>{error}</div>}

                        <Button type="submit" size="lg" disabled={isLoading} style={{ marginTop: '1rem' }}>
                            {isLoading ? 'Salvando...' : 'Redefinir Senha'}
                        </Button>
                    </form>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
                    <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Voltar para Login
                    </Link>
                </div>
            </div>
        </main>
    );
}
