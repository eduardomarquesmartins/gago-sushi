'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './WhatsAppButton.module.css';

export const WhatsAppButton = ({ phoneNumber = "5511999999999" }: { phoneNumber?: string }) => {
    const pathname = usePathname();

    // Não exibir na página inicial (Hero já tem CTA principal)
    if (pathname === '/') {
        return null;
    }

    const message = encodeURIComponent("Olá! Gostaria de fazer um pedido.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
            aria-label="Fale conosco no WhatsApp"
        >
            <MessageCircle size={32} />
        </a>
    );
};
