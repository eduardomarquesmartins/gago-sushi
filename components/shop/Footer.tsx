'use client';

import React from 'react';
import styles from './Footer.module.css';
import { MapPin, Clock, Phone } from 'lucide-react';

import { usePathname } from 'next/navigation';

export const Footer = () => {
    const pathname = usePathname();

    if (pathname === '/') {
        return null;
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.section}>
                    <h3>Gago Sushi</h3>
                    <p className={styles.address}>
                        <MapPin size={16} />
                        Rua Doutor Antonio Mazzaferro Neto, 140 - Hípica<br />
                        Porto Alegre - RS<br />
                        CEP: 91787-196
                    </p>

                    <p className={styles.address} style={{ marginTop: '0.5rem' }}>
                        <Phone size={16} />
                        (51) 99192-8455 | (51) 98412-4638
                    </p>
                </div>

                <div className={styles.section}>
                    <h3>Horários de Funcionamento</h3>
                    <ul className={styles.hours}>
                        <li>
                            <span>Segunda a Domingo:</span> 19:00 às 00:00
                        </li>
                    </ul>
                    <p className={styles.cnpj} style={{ marginTop: '0.5rem' }}>CNPJ: 41.156.169/0001-12</p>
                </div>
            </div>
            <div className={styles.bottom}>
                <p>&copy; {new Date().getFullYear()} Gago Sushi. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
};
