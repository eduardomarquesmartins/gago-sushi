
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Star } from 'lucide-react';
import styles from './Hero.module.css';

export const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={`container ${styles.content}`}>
                <div className={styles.badge}>
                    <Star size={14} fill="currentColor" />
                    <span>O Melhor Sushi da Região</span>
                </div>

                <div className={styles.logoWrapper}>
                    <img src="/logogago.jpg" alt="Logo Gago Sushi" className={styles.heroLogo} />
                </div>

                <h1 className={styles.title}>
                    <span className="text-gradient">GAGO SUSHI</span>
                </h1>

                <h2 className={styles.subtitle}>
                    SUSHI DE VERDADE
                </h2>

                {/* Descrição removida conforme solicitado */}

                <div className={styles.buttons}>
                    <Link href="/menu">
                        <Button size="lg" rightIcon={<ArrowRight size={20} />} className={styles.pulseButton}>
                            Pedir Agora
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Background Decorativo */}
            <div className={styles.glow}></div>
        </section>
    );
};
