
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/shop/Header';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

import { loginAdminAction, loginUserAction } from '@/lib/actions';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const email = formData.get('email') as string; // Input type email, mas admin não é email válido as vezes? Verificar type.
        // O input diz type="email", então "admin" talvez falhe validação de browser.
        // Vou alterar o type para "text" no input abaixo e chamar de "Email ou Usuário".

        if (email === 'admin') {
            const formDataAdmin = new FormData();
            formDataAdmin.append('email', 'admin');
            formDataAdmin.append('password', (form.elements.namedItem('password') as HTMLInputElement).value);

            const result = await loginAdminAction(formDataAdmin);
            if (result.success) {
                router.push('/admin');
                return;
            } else {
                alert("Login de administrador falhou.");
                setIsLoading(false);
                return;
            }
        }

        // Login Cliente Real
        const result = await loginUserAction(formData);

        if (result.success && result.user) {
            login(result.user);
            setIsLoading(false);
            router.push('/checkout');
        } else {
            alert(result.error || "Erro ao entrar. Verifique suas credenciais.");
            setIsLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#fff' }}>
            <Header />
            <div className="container" style={{ paddingTop: '140px', maxWidth: '400px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 700 }}>Entrar</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email ou Usuário</label>
                        <input
                            name="email"
                            type="text"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Senha</label>
                        <input
                            name="password"
                            type="password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <Link href="/forgot-password" style={{ fontSize: '0.875rem', color: '#666', textDecoration: 'underline' }}>
                                Esqueci minha senha
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" size="lg" disabled={isLoading} style={{ marginTop: '1rem' }}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
                    Ainda não tem conta?{' '}
                    <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </main>
    );
}
