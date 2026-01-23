
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    hoverEffect = false
}) => {
    return (
        <div className={`${styles.card} ${hoverEffect ? styles.hover : ''} ${className || ''}`}>
            {children}
        </div>
    );
};
