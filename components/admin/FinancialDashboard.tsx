'use client';

import React, { useState } from 'react';
import { DollarSign, ShoppingBag } from 'lucide-react';
import { getFinancialStatsAction } from '@/lib/actions';
import styles from '@/app/admin/dashboard.module.css';

interface StatsData {
    totalRevenue: number;
    totalOrders: number;
    dailyStats: { date: string; total: number }[];
    period: string;
}

interface Props {
    initialStats: StatsData;
}

export default function FinancialDashboard({ initialStats }: Props) {
    const [stats, setStats] = useState<StatsData>(initialStats);
    const [period, setPeriod] = useState(initialStats.period || 'week');
    const [loading, setLoading] = useState(false);

    const handlePeriodChange = async (newPeriod: string) => {
        if (newPeriod === period || loading) return;

        setLoading(true);
        setPeriod(newPeriod);

        try {
            const data = await getFinancialStatsAction(newPeriod as any);
            setStats(data as StatsData);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const periodLabels: Record<string, string> = {
        'day': 'Hoje',
        'week': 'Últimos 7 Dias',
        'month': 'Últimos 30 Dias',
        'year': 'Último Ano'
    };

    return (
        <div>
            <div className={styles.headerRow}>
                <h1 className={styles.title} style={{ marginBottom: 0, fontSize: '1.8rem' }}>Painel Financeiro</h1>

                <div className={styles.filterContainer}>
                    {[
                        { key: 'week', label: 'Semana' },
                        { key: 'month', label: 'Mês' },
                        { key: 'year', label: 'Ano' }
                    ].map(p => (
                        <button
                            key={p.key}
                            onClick={() => handlePeriodChange(p.key)}
                            disabled={loading}
                            className={styles.filterButton}
                            style={{
                                color: period === p.key ? '#fff' : '#888',
                                background: period === p.key ? 'var(--primary)' : 'transparent',
                                cursor: loading ? 'wait' : 'pointer',
                            }}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.statsGrid} style={{ opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ background: '#e0f7fa', color: '#006064' }}>
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Faturamento ({periodLabels[period]})</p>
                        <h3 className={styles.statValue}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
                        </h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ background: '#f3e5f5', color: '#4a148c' }}>
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Pedidos ({periodLabels[period]})</p>
                        <h3 className={styles.statValue}>{stats.totalOrders}</h3>
                    </div>
                </div>
            </div>

            <div className={styles.chartContainer} style={{ opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                <h3>Vendas - {periodLabels[period]}</h3>

                {stats.dailyStats.length === 0 ? (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        Nenhuma venda neste período.
                    </div>
                ) : (
                    <div className={styles.scrollContainer} style={{ height: '200px', alignItems: 'flex-end', marginTop: '20px' }}>
                        {stats.dailyStats.map((day, i) => {
                            const maxDaily = Math.max(...stats.dailyStats.map(d => d.total), 1);
                            const heightPct = maxDaily > 0 ? (day.total / maxDaily) * 100 : 0;

                            return (
                                <div key={i} style={{ flex: 1, minWidth: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div
                                        title={`R$ ${day.total}`}
                                        style={{
                                            width: '100%',
                                            background: 'var(--primary)',
                                            height: `${Math.max(heightPct, 2)}%`,
                                            borderRadius: '4px 4px 0 0',
                                            minHeight: '4px',
                                            transition: 'height 0.5s ease',
                                            opacity: day.total > 0 ? 1 : 0.3
                                        }}></div>
                                    <span style={{ fontSize: '0.65rem', marginTop: '8px', textAlign: 'center', color: '#aaa', whiteSpace: 'nowrap' }}>
                                        {period === 'day' ? day.date.split(':')[0] + 'h' : day.date}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
