import { getUserAction, updateUserAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import Link from 'next/link';
import { ArrowLeft, Save } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const user = await getUserAction(id);

    if (!user) {
        return <div>Cliente não encontrado</div>;
    }

    async function handleSubmit(formData: FormData) {
        'use server';
        await updateUserAction(formData);
        redirect('/admin/customers');
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <Link href="/admin/customers">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 style={{ fontSize: '2rem' }}>Editar Cliente</h1>
            </div>

            <form action={handleSubmit} style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <input type="hidden" name="id" value={user.id} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>Nome</label>
                        <input
                            name="name"
                            defaultValue={user.name}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>Email</label>
                        <input
                            name="email"
                            defaultValue={user.email}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>Telefone</label>
                        <input
                            name="phone"
                            defaultValue={user.phone}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#aaa' }}>Endereço</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>CEP</label>
                        <input
                            name="zip"
                            defaultValue={user.address.zip}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>Rua</label>
                        <input
                            name="street"
                            defaultValue={user.address.street}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>Número</label>
                        <input
                            name="number"
                            defaultValue={user.address.number}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>Bairro</label>
                        <input
                            name="neighborhood"
                            defaultValue={user.address.neighborhood}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: '#888' }}>Cidade</label>
                        <input
                            name="city"
                            defaultValue={user.address.city}
                            required
                            style={{
                                padding: '0.75rem',
                                background: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '8px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link href="/admin/customers">
                        <Button variant="ghost" type="button">Cancelar</Button>
                    </Link>
                    <Button type="submit" leftIcon={<Save size={20} />}>Salvar Alterações</Button>
                </div>
            </form>
        </div>
    );
}
