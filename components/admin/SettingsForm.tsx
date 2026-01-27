'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateStoreConfigAction } from '@/lib/actions';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Save, Key, Phone, MapPin, Trash2 } from 'lucide-react';
import styles from './AdminResponsive.module.css';

// Interface para o estado do formulário
interface FormState {
    success: boolean;
    error?: string;
    message?: string;
}

const initialState: FormState = {
    success: false,
    error: '',
    message: ''
};

export function SettingsForm(props: { currentWhatsapp: string; currentDeliveryFee?: number; currentPixKey?: string; currentNeighborhoodFees?: { name: string, fee: number }[] }) {
    // @ts-ignore
    const [state, formAction] = useActionState(updateStoreConfigAction, initialState);

    // Estados para Taxas por Bairro
    const [neighborhoodFees, setNeighborhoodFees] = useState<{ name: string; fee: number }[]>(props.currentNeighborhoodFees || []);
    const [newNeighborhoodName, setNewNeighborhoodName] = useState('');
    const [newNeighborhoodFee, setNewNeighborhoodFee] = useState('');

    const handleAddNeighborhood = () => {
        if (!newNeighborhoodName || !newNeighborhoodFee) return;
        setNeighborhoodFees([...neighborhoodFees, { name: newNeighborhoodName, fee: parseFloat(newNeighborhoodFee) }]);
        setNewNeighborhoodName('');
        setNewNeighborhoodFee('');
    };

    const handleUpdateNeighborhoodFee = (index: number, newFeeStr: string) => {
        const updated = [...neighborhoodFees];
        const newFee = parseFloat(newFeeStr);
        if (!isNaN(newFee)) {
            updated[index].fee = newFee;
            setNeighborhoodFees(updated);
        }
    };

    const handleRemoveNeighborhood = (index: number) => {
        const updated = [...neighborhoodFees];
        updated.splice(index, 1);
        setNeighborhoodFees(updated);
    };

    // Estados para inputs controlados
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [whatsapps, setWhatsapps] = useState({
        new: '',
        confirm: ''
    });

    // Estados de visibilidade
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Validação
    const passwordMismatch = passwords.new !== passwords.confirm;
    const isPasswordChange = passwords.new.length > 0;
    const isFormValid = !passwordMismatch && (!isPasswordChange || passwords.current.length > 0);

    // Máscara de Telefone
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'new' | 'confirm') => {
        let value = e.target.value;
        value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); // Coloca parênteses em volta dos dois primeiros dígitos
        value = value.replace(/(\d)(\d{4})$/, "$1-$2"); // Coloca hifem entre o quinto e o quarto dígitos

        setWhatsapps(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form action={formAction} className="settings-form">
            <input type="hidden" name="neighborhoodFees" value={JSON.stringify(neighborhoodFees)} />

            <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>

                {state?.error && (
                    <div style={{ padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', borderRadius: '8px', marginBottom: '1.5rem', color: '#ff4444' }}>
                        {state.error}
                    </div>
                )}

                {state?.success && (
                    <div style={{ padding: '1rem', background: 'rgba(0, 200, 81, 0.1)', border: '1px solid #00c851', borderRadius: '8px', marginBottom: '1.5rem', color: '#00c851' }}>
                        {state.message}
                    </div>
                )}

                {/* === SEÇÃO ENTREGA & WHATSAPP (Geral) === */}
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SettingsParamIcon /> Geral
                </h3>

                <div style={{ marginBottom: '2rem' }}>
                    <div className={styles.formGrid}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>WhatsApp da Loja</label>
                            <input
                                name="newWhatsapp"
                                type="text"
                                placeholder="(51) 99999-9999"
                                value={whatsapps.new || formatPhone(props.currentWhatsapp)}
                                onChange={(e) => handlePhoneChange(e, 'new')}
                                style={inputStyle}
                            />
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                Atual: {formatPhone(props.currentWhatsapp)}
                            </p>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Chave PIX (CPF, Email, Telefone, ou Aleatória)</label>
                            <input
                                name="pixKey"
                                type="text"
                                placeholder="Digite a chave PIX..."
                                defaultValue={props.currentPixKey}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* === SEÇÃO TAXAS POR BAIRRO === */}
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={20} /> Taxas de Entrega por Bairro
                </h3>

                <div style={{ marginBottom: '2rem', background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <input
                                placeholder="Nome do Bairro"
                                value={newNeighborhoodName}
                                onChange={(e) => setNewNeighborhoodName(e.target.value)}
                                style={{ ...inputStyle, background: '#333' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 100px' }}>
                            <input
                                type="number"
                                placeholder="Valor R$"
                                value={newNeighborhoodFee}
                                onChange={(e) => setNewNeighborhoodFee(e.target.value)}
                                style={{ ...inputStyle, background: '#333' }}
                            />
                        </div>
                        <div style={{ flex: '0 0 auto' }}>
                            <Button type="button" onClick={handleAddNeighborhood} size="sm" style={{ height: '42px', width: '100%' }}>
                                Adicionar
                            </Button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {neighborhoodFees.length === 0 && (
                            <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>Nenhum bairro cadastrado. A taxa padrão será usada.</p>
                        )}
                        {neighborhoodFees.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#333', borderRadius: '6px', border: '1px solid #444' }}>
                                <span style={{ color: '#fff', fontWeight: 500 }}>{item.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ color: '#aaa', fontSize: '0.9rem' }}>R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.fee}
                                        onChange={(e) => handleUpdateNeighborhoodFee(index, e.target.value)}
                                        style={{
                                            ...inputStyle,
                                            width: '80px',
                                            padding: '0.25rem 0.5rem',
                                            textAlign: 'right',
                                            background: '#222',
                                            borderColor: '#555'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNeighborhood(index)}
                                        style={{ background: 'rgba(255, 68, 68, 0.1)', border: 'none', color: '#ff4444', padding: '0.25rem', borderRadius: '4px', cursor: 'pointer', marginLeft: '0.5rem' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* === SEÇÃO DE SENHA (Opcional) === */}
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Key size={20} /> Alterar Senha de Admin
                </h3>

                <div className={styles.formGrid} style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="newPassword"
                                type={showNew ? "text" : "password"}
                                placeholder="Deixe em branco para manter"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                style={inputStyle}
                            />
                            <button type="button" onClick={() => setShowNew(!showNew)} style={eyeButtonStyle}>
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Confirmar Nova Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repita a nova senha"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                style={{
                                    ...inputStyle,
                                    borderColor: passwords.confirm && passwords.new !== passwords.confirm ? '#ff4444' : '#444'
                                }}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeButtonStyle}>
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwords.confirm && passwords.new !== passwords.confirm && (
                            <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>As senhas não coincidem</span>
                        )}
                    </div>
                </div>

                {/* Só pede senha atual se estiver trocando a senha */}
                {isPasswordChange && (
                    <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ff9f43' }}>Confirme sua Senha Atual para salvar a nova senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="currentPassword"
                                type={showCurrent ? "text" : "password"}
                                placeholder="Senha atual"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                required={isPasswordChange}
                                style={{ ...inputStyle, borderColor: '#ff9f43' }}
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={eyeButtonStyle}>
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                <SubmitButton disabled={!isFormValid} />
            </div>
        </form>
    );
}

function SettingsParamIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    )
}

function formatPhone(phone: string) {
    if (!phone) return '';
    let value = phone.replace(/\D/g, "");

    // Se tiver country code (12 ou 13 digitos começando com 55), remove visualmente
    if ((value.length === 12 || value.length === 13) && value.startsWith('55')) {
        value = value.substring(2);
    }

    // Formata padrão (XX) XXXXX-XXXX
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");

    return value;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            size="lg"
            style={{ width: '100%', opacity: disabled ? 0.5 : 1 }}
            disabled={pending || disabled}
        >
            {pending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #444',
    background: '#2a2a2a',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s'
};

const eyeButtonStyle = {
    position: 'absolute' as const,
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center'
};
