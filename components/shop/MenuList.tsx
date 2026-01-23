
'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './MenuList.module.css';

interface MenuListProps {
    initialProducts: Product[];
}

const CATEGORIES = [
    { id: 'all', label: 'Todos' },
    { id: 'combo', label: 'Combos' },
    { id: 'combo_coca', label: 'Combo Coca Cola' },
    { id: 'alacarte', label: 'Peças À La carte' },
    { id: 'temaki', label: 'Temakis' },
    { id: 'bebida', label: 'Bebidas' },
    { id: 'extra', label: 'Extras' },
];

export const MenuList: React.FC<MenuListProps> = ({ initialProducts }) => {
    // Função de ordenação: Com foto primeiro
    const sortProducts = (products: Product[]) => {
        return [...products].sort((a, b) => {
            const hasImageA = a.image && a.image !== '/placeholder-sushi.jpg';
            const hasImageB = b.image && b.image !== '/placeholder-sushi.jpg';
            if (hasImageA && !hasImageB) return -1;
            if (!hasImageA && hasImageB) return 1;
            return 0;
        });
    };

    const sortedInitialProducts = sortProducts(initialProducts);

    const [activeCategory, setActiveCategory] = useState('all');
    const { addItem } = useCart();

    // Scroll Logic
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10); // -10 buffer
        }
    };

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    React.useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    // Considera promoção se tiver flag explícita OU preço promocional menor que preço original
    const promotions = sortedInitialProducts.filter(p => p.isPromotion || (p.promotionalPrice && p.promotionalPrice < p.price));

    const regularProducts = activeCategory === 'all'
        ? sortedInitialProducts
        : sortedInitialProducts.filter(p => p.category === activeCategory);

    return (
        <div className={styles.wrapper}>
            {/* Filtros com Scroll Indicators */}
            <div className={styles.filtersContainer}>
                {/* Indicador Esquerdo */}
                <div
                    className={`${styles.scrollIndicator} ${styles.scrollLeft} ${showLeftScroll ? styles.visible : ''}`}
                    aria-hidden="true"
                    onClick={() => handleScroll('left')}
                />

                <div
                    className={styles.filters}
                    ref={scrollRef}
                    onScroll={checkScroll}
                >
                    {CATEGORIES.map(cat => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveCategory(cat.id)}
                            className={styles.filterBtn}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>

                {/* Indicador Direito */}
                <div
                    className={`${styles.scrollIndicator} ${styles.scrollRight} ${showRightScroll ? styles.visible : ''}`}
                    aria-hidden="true"
                    onClick={() => handleScroll('right')}
                />
            </div>

            {/* Seção Promoções */}
            {activeCategory === 'all' && promotions.length > 0 && (
                <section className={styles.promoSection}>
                    <h2 className={styles.sectionTitle}>🔥 Promoções do Dia</h2>
                    <div className={styles.grid}>
                        {promotions.map(product => (
                            <ProductCard key={`promo-${product.id}`} product={product} addItem={addItem} isPromo />
                        ))}
                    </div>
                </section>
            )}

            {/* Visualização: TODOS (Seções) ou CATEGORIA (Grid Única) */}
            {activeCategory === 'all' ? (
                <div className={styles.sectionsWrapper}>

                    {/* 2. Outras Categorias (Combos, Temakis, etc) */}
                    {CATEGORIES.filter(c => c.id !== 'all').map(category => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const categoryProducts = sortedInitialProducts.filter(p => p.category === category.id && !p.isPromotion);

                        const products = sortedInitialProducts.filter(p => p.category === category.id);

                        if (products.length === 0) return null;

                        return (
                            <section key={category.id} className={styles.categorySection}>
                                <h2 className={styles.sectionTitle}>{category.label}</h2>
                                <div className={styles.grid}>
                                    {products.map(product => (
                                        <ProductCard key={product.id} product={product} addItem={addItem} isPromo={product.isPromotion} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            ) : (
                /* Grid de Produtos Filtrada */
                <div className={styles.grid}>
                    {regularProducts.map(product => (
                        <ProductCard key={product.id} product={product} addItem={addItem} isPromo={product.isPromotion} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Componente auxiliar para Card
const ProductCard = ({ product, addItem, isPromo = false }: { product: Product, addItem: any, isPromo?: boolean }) => {
    return (
        <Card hoverEffect className={`${styles.productCard} ${isPromo ? styles.promoCard : ''}`}>
            <div className={styles.imagePlaceholder} style={product.image && product.image !== '/placeholder-sushi.jpg' ? { backgroundImage: `url(${product.image})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundColor: '#fff' } : {}}>
                {(!product.image || product.image === '/placeholder-sushi.jpg') && <span className={styles.emoji}>🍣</span>}
                {isPromo && <span className={styles.promoBadge}>OFERTA</span>}
            </div>

            <div className={styles.info}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{product.name}</h3>
                    <div className={styles.priceWrapper}>
                        {product.promotionalPrice && (
                            <span className={styles.oldPrice}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                            </span>
                        )}
                        <span className={styles.price}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.promotionalPrice || product.price)}
                        </span>
                    </div>
                </div>

                <p className={styles.desc}>{product.description}</p>

                <Button
                    size="sm"
                    className={styles.addBtn}
                    leftIcon={<Plus size={16} />}
                    onClick={() => addItem({
                        ...product,
                        price: product.promotionalPrice || product.price // Adiciona com preço promocional se tiver
                    })}
                >
                    Adicionar
                </Button>
            </div>
        </Card>
    );
}
