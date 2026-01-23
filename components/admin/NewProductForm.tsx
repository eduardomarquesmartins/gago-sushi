
'use client';

// Formulário para criação de novos produtos

import { createProductAction, updateProductAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product } from "@/types";
import styles from './AdminResponsive.module.css';

interface ProductFormProps {
    initialData?: Product;
}

export function NewProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        const file = formData.get('image') as File;
        // Validação de tamanho apenas se houver arquivo novo
        if (file && file.size > 3 * 1024 * 1024) {
            alert("A imagem é muito grande! Por favor, use uma imagem menor que 3MB.");
            return;
        }

        setIsLoading(true);
        try {
            if (initialData) {
                await updateProductAction(formData);
            } else {
                await createProductAction(formData);
            }
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar produto. Verifique os dados.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {initialData && (
                <>
                    <input type="hidden" name="id" value={initialData.id} />
                    <input type="hidden" name="currentImage" value={initialData.image} />
                </>
            )}

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Nome do Produto</label>
                <input
                    name="name"
                    required
                    defaultValue={initialData?.name}
                    style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                />
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Descrição</label>
                <textarea
                    name="description"
                    rows={3}
                    defaultValue={initialData?.description}
                    style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                />
            </div>

            <div className={styles.formGrid}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Preço Original (R$)</label>
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={initialData?.price}
                        style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Categoria</label>
                    <select
                        name="category"
                        defaultValue={initialData?.category}
                        style={{ width: '100%', padding: '0.75rem', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                    >
                        <option value="combo">Combo</option>
                        <option value="temaki">Temaki</option>
                        <option value="extra">Extras</option>
                        <option value="alacarte">Peças À La Carte</option>
                        <option value="combo_coca">Combo Coca Cola</option>
                        <option value="bebida">Bebida</option>
                    </select>
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Foto do Produto {initialData && '(Deixe vazio para manter a atual)'}</label>
                {initialData?.image && (
                    <div style={{ marginBottom: '0.5rem' }}>
                        <img src={initialData.image} alt="Atual" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    </div>
                )}
                <div style={{ position: 'relative', width: '100%' }}>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#2a2a2a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                    />
                </div>
                {/* Fallback oculto para URL se necessário debugging */}
                <input name="imageUrl" type="hidden" />
            </div>

            <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                        type="checkbox"
                        name="isPromotion"
                        id="promo"
                        defaultChecked={initialData?.isPromotion}
                        style={{ width: '18px', height: '18px' }}
                    />
                    <label htmlFor="promo" style={{ color: '#fff', fontWeight: 'bold' }}>Adicionar à Promoção do Dia</label>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Preço Promocional (Opcional)</label>
                    <input
                        name="promotionalPrice"
                        type="number"
                        step="0.01"
                        placeholder="R$"
                        defaultValue={initialData?.promotionalPrice}
                        style={{ width: '100%', padding: '0.75rem', background: '#1e1e1e', border: '1px solid #444', borderRadius: '8px', color: '#fff' }}
                    />
                </div>
            </div>

            <Button type="submit" isLoading={isLoading} style={{ marginTop: '1rem' }}>
                {initialData ? 'Atualizar Produto' : 'Salvar Produto'}
            </Button>
        </form>
    );
}
