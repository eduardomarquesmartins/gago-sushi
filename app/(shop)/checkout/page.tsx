
'use client';

import React, { useEffect, useState } from 'react';
// Imports mantidos...
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shop/Header';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { MapPin, CreditCard, Banknote, QrCode, Phone as PhoneIcon, User, LogIn, Trash, Plus } from 'lucide-react';
import Link from 'next/link';

import { getStoreConfigAction, addNewAddressAction, removeAddressAction, createOrderAction } from "@/lib/actions";
import { fetchAddressByCep } from "@/lib/viacep";

import { DELIVERY_FEES, NEIGHBORHOODS, getDeliveryFee } from "@/lib/constants";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const { user, isAuthenticated, updateUser } = useUser();

    // States
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [troco, setTroco] = useState('');
    const [guestMode, setGuestMode] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState('5511999999999'); // Fallback inicial
    const [pixKey, setPixKey] = useState('');

    // Address Management States
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // New Address Form States
    const [newNeighborhood, setNewNeighborhood] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [newComplement, setNewComplement] = useState('');

    // Guest Data States
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestNeighborhood, setGuestNeighborhood] = useState('');
    const [guestAddress, setGuestAddress] = useState('');
    const [guestNumber, setGuestNumber] = useState('');
    const [guestComplement, setGuestComplement] = useState('');

    useEffect(() => {
        // Busca o número atualizado do back-end
        getStoreConfigAction().then(config => {
            if (config.whatsappNumber) {
                setWhatsappNumber(config.whatsappNumber);
            }
            if (config.pixKey) {
                setPixKey(config.pixKey);
            }
        });
    }, []);

    useEffect(() => {
        if (items.length === 0) {
            router.push('/menu');
            return;
        }
    }, [items, router]);

    const handleSaveAddress = async () => {
        if (!user || !user.id || !newAddress || !newNumber || !newNeighborhood) {
            alert("Preencha os campos obrigatórios (Bairro, Rua e Número).");
            return;
        }

        setIsSavingAddress(true);
        const addressData = {
            neighborhood: newNeighborhood,
            street: newAddress,
            number: newNumber,
            complement: newComplement
        };

        const result = await addNewAddressAction(user.id, addressData);

        if (result.success) {
            const currentList = user.savedAddresses || [user.address];
            const newList = [...currentList, addressData];

            updateUser({ savedAddresses: newList });
            setIsAddingAddress(false);
            setNewNeighborhood(''); setNewAddress(''); setNewNumber(''); setNewComplement('');
            setSelectedAddressIndex(newList.length - 1); // Seleciona o novo
        } else {
            alert("Erro ao salvar endereço.");
        }
        setIsSavingAddress(false);
    };

    const handleRemoveAddress = async (index: number) => {
        if (!user || !user.id) return;
        if (!confirm("Tem certeza que deseja remover este endereço?")) return;

        const result = await removeAddressAction(user.id, index);
        if (result.success) {
            const currentList = user.savedAddresses || [user.address];
            const newList = [...currentList];
            newList.splice(index, 1);
            updateUser({ savedAddresses: newList });

            if (selectedAddressIndex >= newList.length) {
                setSelectedAddressIndex(Math.max(0, newList.length - 1));
            }
        } else {
            alert("Erro ao remover endereço.");
        }
    };

    const handleFinish = () => {
        // Dados finais (User ou Guest)
        const finalName = user?.name || guestName;
        const finalPhone = user?.phone || guestPhone;

        // Determinar endereço selecionado
        let finalAddressStr = '';
        let finalComplementStr = '';
        let finalNeighborhoodStr = '';
        let deliveryFee = 0;

        if (user) {
            const addresses = user.savedAddresses || [user.address];
            // Fallback seguro se o índice estiver fora
            const selected = addresses[selectedAddressIndex] || addresses[0] || user.address;

            finalAddressStr = `${selected.street}, ${selected.number}`;
            finalComplementStr = selected.complement || '';
            finalNeighborhoodStr = selected.neighborhood;
        } else {
            finalAddressStr = `${guestAddress}, ${guestNumber}`;
            finalComplementStr = guestComplement;
            finalNeighborhoodStr = guestNeighborhood;
        }

        const fee = getDeliveryFee(finalNeighborhoodStr);
        if (fee === null) {
            // Se não encontrou o bairro na lista, podemos avisar ou cobrar taxa padrão?
            // O usuário pediu especificamente esses valores. Vamos assumir que se não tá na lista, é "A combinar" ou avisar.
            // Para não travar, vamos avisar mas permitir continuar com taxa a combinar (0 ou msg)?
            // O ideal é alertar.
            const proceed = confirm(`O bairro "${finalNeighborhoodStr}" não está na nossa lista de taxas fixas. Deseja prosseguir com taxa a combinar?`);
            if (!proceed) return;
            deliveryFee = 0;
        } else {
            deliveryFee = fee;
        }


        const finalAddress = finalAddressStr;
        const finalComplement = finalComplementStr;
        const finalNeighborhood = finalNeighborhoodStr;

        if (!finalName || !finalPhone || !finalAddress || !finalNeighborhood) {
            alert("Por favor, preencha todos os dados de entrega.");
            return;
        }

        // 1. Salvar Pedido no Banco de Dados
        const orderData = {
            customerName: finalName,
            customerPhone: finalPhone,
            customerAddress: `${finalAddress} - ${finalComplement} - ${finalNeighborhood}`,
            items: items.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: subtotal + deliveryFee,
            paymentMethod: paymentMethod,
            change: paymentMethod === 'dinheiro' ? troco : undefined,
            status: 'PENDING'
        };

        createOrderAction(orderData)
            .then(result => {
                if (result.success) {
                    // 2. Limpar Carrinho
                    clearCart();

                    // 3. Formatar Mensagem WhatsApp
                    const itemsList = items.map(item =>
                        `${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2)})`
                    ).join('\n');

                    // Formatar Mensagem
                    const text = `
🍣 *NOVO PEDIDO - GAGO SUSHI*
🆔 *Pedido:* #${result.orderId}

👤 *Cliente:* ${finalName}
📱 *Telefone:* ${finalPhone}

📍 *ENTREGA*
${finalAddress}
${finalNeighborhood}
${finalComplement ? `Compl: ${finalComplement}` : ''}

🛒 *RESUMO DO PEDIDO*
${itemsList}

💰 *Subtotal:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
🛵 *Entrega:* ${deliveryFee === 0 && getDeliveryFee(finalNeighborhoodStr) !== 0 ? 'A Combinar' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deliveryFee)}
💰 *TOTAL:* ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal + deliveryFee)}
💳 *PAGAMENTO:* ${paymentMethod.toUpperCase()}
${paymentMethod === 'dinheiro' && troco ? `💱 *Troco para:* R$ ${troco}` : ''}

✅ Aguardo confirmação!
`.trim();

                    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');

                    // Redirecionar para home após sucesso
                    router.push('/');
                } else {
                    alert("Erro ao salvar pedido. Tente novamente ou contate-nos.");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Erro inesperado ao processar pedido.");
            });
    };

    // Renderizar formulário de Guest
    const renderGuestForm = () => (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <User size={20} />
                <h3 style={{ fontWeight: 600 }}>Seus Dados</h3>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <input style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Nome Completo" value={guestName} onChange={e => setGuestName(e.target.value)} />
                <input style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Telefone / WhatsApp" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem 0 1rem', color: 'var(--primary)' }}>
                <MapPin size={20} />
                <h3 style={{ fontWeight: 600 }}>Endereço de Entrega</h3>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <input style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Rua" value={guestAddress} onChange={e => setGuestAddress(e.target.value)} />
                    <input style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Número" value={guestNumber} onChange={e => setGuestNumber(e.target.value)} />
                </div>
                <select
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                    value={guestNeighborhood}
                    onChange={e => setGuestNeighborhood(e.target.value)}
                >
                    <option value="">Selecione o Bairro</option>
                    {NEIGHBORHOODS.map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
                <input style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Complemento (Opcional)" value={guestComplement} onChange={e => setGuestComplement(e.target.value)} />
            </div>
        </div>
    );

    // Se não logado e não escolheu modo guest, mostra escolha
    if (!isAuthenticated && !guestMode) {
        return (
            <main style={{ minHeight: '100vh', background: '#f8f9fa' }}>
                <Header />
                <div className="container" style={{ paddingTop: '140px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Como deseja continuar?</h1>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Link href="/register">
                            <Button size="lg" style={{ width: '100%', background: 'linear-gradient(45deg, #FF9900, #F57C00)', border: 'none' }}>
                                <User size={20} style={{ marginRight: '0.5rem' }} />
                                Criar Minha Conta
                            </Button>
                        </Link>

                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 0.5rem' }}>Ganhe agilidade nos próximos pedidos!</p>

                        <Link href="/login?redirect=/checkout">
                            <Button variant="outline" size="lg" style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                                <LogIn size={20} style={{ marginRight: '0.5rem' }} />
                                Já tenho conta
                            </Button>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                            <span style={{ padding: '0 1rem', color: '#999', fontSize: '0.9rem' }}>ou</span>
                            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
                        </div>

                        <Button variant="ghost" size="lg" style={{ width: '100%', border: '1px solid #ddd', color: '#666' }} onClick={() => setGuestMode(true)}>
                            Finalizar sem cadastro
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '100px' }}>
            <Header />
            <div className="container" style={{ paddingTop: '120px', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 700 }}>Finalizar Pedido</h1>

                {isAuthenticated ? (
                    /* Lista de Endereços (Logado) */
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <MapPin size={20} />
                                <h3 style={{ fontWeight: 600 }}>Endereço de Entrega</h3>
                            </div>
                            {!isAddingAddress && (
                                <Button size="sm" variant="ghost" onClick={() => setIsAddingAddress(true)} style={{ gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <Plus size={16} /> Novo
                                </Button>
                            )}
                        </div>

                        {!isAddingAddress ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {(user?.savedAddresses || [user?.address]).map((addr, index) => {
                                    if (!addr) return null;
                                    const isSelected = selectedAddressIndex === index;
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                border: isSelected ? '2px solid var(--primary)' : '1px solid #eee',
                                                borderRadius: '8px',
                                                padding: '1rem',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                background: isSelected ? '#FFF5F0' : '#fff'
                                            }}
                                            onClick={() => setSelectedAddressIndex(index)}
                                        >
                                            <div style={{ paddingRight: '2rem' }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                                    {addr.street}, {addr.number}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    {addr.complement ? `${addr.complement} - ` : ''}
                                                    {addr.neighborhood}
                                                </p>
                                            </div>

                                            {/* Botão de Excluir (Só aparece se tiver mais de 1 endereço ou se não for o último?) 
                                                O ideal é permitir excluir desde que não seja o único? Ou permitir excluir tudo e obrigar a cadastrar?
                                                Vamos permitir excluir.
                                            */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveAddress(index);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    right: '1rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: '#999',
                                                    cursor: 'pointer'
                                                }}
                                                title="Remover endereço"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Form de Novo Endereço */
                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.8rem' }}>Novo Endereço</h4>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                        <input
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            placeholder="Rua"
                                            value={newAddress}
                                            onChange={e => setNewAddress(e.target.value)}
                                        />
                                        <input
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            placeholder="Número"
                                            value={newNumber}
                                            onChange={e => setNewNumber(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}
                                        value={newNeighborhood}
                                        onChange={e => setNewNeighborhood(e.target.value)}
                                    >
                                        <option value="">Selecione o Bairro</option>
                                        {NEIGHBORHOODS.map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                    <input
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                        placeholder="Complemento"
                                        value={newComplement}
                                        onChange={e => setNewComplement(e.target.value)}
                                    />

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <Button
                                            size="lg"
                                            style={{ flex: 1 }}
                                            onClick={handleSaveAddress}
                                            disabled={isSavingAddress}
                                        >
                                            {isSavingAddress ? 'Salvando...' : 'Salvar Endereço'}
                                        </Button>
                                        <Button
                                            size="lg"
                                            variant="ghost"
                                            style={{ border: '1px solid #ddd' }}
                                            onClick={() => setIsAddingAddress(false)}
                                            disabled={isSavingAddress}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Form Visitante */
                    renderGuestForm()
                )}

                {/* Forma de Pagamento (Igual) */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {/* ... (Existing Payment Options) ... */}
                    {/* Vou recriar para garantir que não quebre o block replace */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <CreditCard size={20} />
                        <h3 style={{ fontWeight: 600 }}>Forma de Pagamento</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {/* PIX */}
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1rem', border: `1px solid ${paymentMethod === 'pix' ? 'var(--primary)' : '#eee'}`, borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'pix' ? '#FFF5F0' : '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <input type="radio" name="payment" value="pix" checked={paymentMethod === 'pix'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <QrCode size={18} />
                                    <span>PIX (Chave enviada no WhatsApp)</span>
                                </div>
                            </div>

                            {paymentMethod === 'pix' && pixKey && (
                                <div style={{ marginLeft: '1.8rem', marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
                                    <div style={{ background: '#fff', border: '1px dashed #ccc', padding: '0.8rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>Chave PIX:</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <code style={{ background: '#eee', padding: '0.3rem 0.5rem', borderRadius: '4px', flex: 1, fontSize: '0.9rem' }}>{pixKey}</code>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                style={{ fontSize: '0.75rem', height: 'auto', padding: '0.3rem 0.6rem' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    navigator.clipboard.writeText(pixKey);
                                                    alert('Chave PIX copiada!');
                                                }}
                                            >
                                                Copiar
                                            </Button>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#e67e22', background: '#fff3e0', padding: '0.5rem', borderRadius: '6px', borderLeft: '3px solid #e67e22' }}>
                                        ⚠️ <b>Importante:</b> Envie o comprovante no WhatsApp após finalizar o pedido para confirmar.
                                    </div>
                                </div>
                            )}
                        </label>

                        {/* Crédito */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', border: `1px solid ${paymentMethod === 'credito' ? 'var(--primary)' : '#eee'}`, borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'credito' ? '#FFF5F0' : '#fff' }}>
                            <input type="radio" name="payment" value="credito" checked={paymentMethod === 'credito'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard size={18} />
                                <span>Cartão de Crédito (Trazer maquininha)</span>
                            </div>
                        </label>

                        {/* Débito */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', border: `1px solid ${paymentMethod === 'debito' ? 'var(--primary)' : '#eee'}`, borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'debito' ? '#FFF5F0' : '#fff' }}>
                            <input type="radio" name="payment" value="debito" checked={paymentMethod === 'debito'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard size={18} />
                                <span>Cartão de Débito (Trazer maquininha)</span>
                            </div>
                        </label>

                        {/* Dinheiro */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', border: `1px solid ${paymentMethod === 'dinheiro' ? 'var(--primary)' : '#eee'}`, borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'dinheiro' ? '#FFF5F0' : '#fff' }}>
                            <input type="radio" name="payment" value="dinheiro" checked={paymentMethod === 'dinheiro'} onChange={(e) => setPaymentMethod(e.target.value)} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Banknote size={18} />
                                <span>Dinheiro</span>
                            </div>
                        </label>

                        {paymentMethod === 'dinheiro' && (
                            <div style={{ marginTop: '0.5rem', marginLeft: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Precisa de troco para quanto?</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 50"
                                    value={troco}
                                    onChange={(e) => setTroco(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Total e Enviar */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#666' }}>
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#666' }}>
                            <span>Entrega</span>
                            <span>
                                {(() => {
                                    // Calculate fee for display
                                    const activeNeighbor = isAuthenticated
                                        ? (user?.savedAddresses?.[selectedAddressIndex]?.neighborhood || user?.address?.neighborhood || '')
                                        : guestNeighborhood;
                                    const fee = getDeliveryFee(activeNeighbor);

                                    if (fee === null && activeNeighbor.trim().length > 0) return 'A Combinar';
                                    if (activeNeighbor.trim().length === 0) return 'Selecione o bairro';
                                    return fee === 0 ? 'Grátis' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fee);
                                })()}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                            <span>Total do Pedido</span>
                            <span>
                                {(() => {
                                    const activeNeighbor = isAuthenticated
                                        ? (user?.savedAddresses?.[selectedAddressIndex]?.neighborhood || user?.address?.neighborhood || '')
                                        : guestNeighborhood;
                                    const fee = getDeliveryFee(activeNeighbor) ?? 0;
                                    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal + fee);
                                })()}
                            </span>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        style={{ width: '100%', gap: '0.5rem', height: 'auto', padding: '1rem' }}
                        onClick={handleFinish}
                        leftIcon={<PhoneIcon size={20} />}
                    >
                        Enviar Pedido
                    </Button>
                </div>
            </div>
        </main >
    );
}

