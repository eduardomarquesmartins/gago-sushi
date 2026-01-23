import Link from "next/link";
import styles from "./dashboard.module.css";
import { PackagePlus, Package, Users, Settings } from "lucide-react";
import { getFinancialStatsAction } from "@/lib/actions";
import FinancialDashboard from "@/components/admin/FinancialDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    // Initial fetch (default 'week') - forcing rebuild
    const initialStats = await getFinancialStatsAction('week');

    return (
        <div className={styles.container}>

            <h2 className={styles.sectionTitle} style={{ marginTop: 0 }}>Acesso Rápido</h2>
            <div className={styles.grid} style={{ marginBottom: '3rem' }}>
                <Link href="/admin/products/new" className={styles.card}>
                    <PackagePlus size={64} className={styles.cardIcon} />
                    <span className={styles.cardTitle}>Novo Produto</span>
                    <p className={styles.cardDesc}>Cadastre novos itens, pratos ou bebidas no cardápio.</p>
                </Link>

                <Link href="/admin/products" className={styles.card}>
                    <Package size={64} className={styles.cardIcon} />
                    <span className={styles.cardTitle}>Produtos</span>
                    <p className={styles.cardDesc}>Gerencie, edite ou remova itens existentes.</p>
                </Link>

                <Link href="/admin/customers" className={styles.card}>
                    <Users size={64} className={styles.cardIcon} />
                    <span className={styles.cardTitle}>Clientes</span>
                    <p className={styles.cardDesc}>Veja a lista de clientes cadastrados na plataforma.</p>
                </Link>

                <Link href="/admin/settings" className={styles.card}>
                    <Settings size={64} className={styles.cardIcon} />
                    <span className={styles.cardTitle}>Configurações</span>
                    <p className={styles.cardDesc}>Altere senha do admin e número do WhatsApp.</p>
                </Link>
            </div>

            <FinancialDashboard initialStats={initialStats} />

        </div>
    );
}
