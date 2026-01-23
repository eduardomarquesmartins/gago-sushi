
import Link from 'next/link';
import { logoutAdminAction } from '@/lib/actions';
import { Package, LayoutDashboard, Settings, Users, LogOut, ShoppingBag, PackagePlus } from 'lucide-react';
import styles from './AdminLayout.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.adminWrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <img src="/logogago.jpg" alt="Gago Admin" style={{ width: '100%', maxWidth: '150px', borderRadius: '8px' }} />
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.link}>
                        <LayoutDashboard size={20} /> Painel
                    </Link>
                    <Link href="/admin/products/new" className={styles.link}>
                        <PackagePlus size={20} /> Novo Produto
                    </Link>
                    <Link href="/admin/products" className={styles.link}>
                        <Package size={20} /> Produtos
                    </Link>
                    <Link href="/admin/orders" className={styles.link}>
                        <ShoppingBag size={20} /> Pedidos
                    </Link>
                    <Link href="/admin/customers" className={styles.link}>
                        <Users size={20} /> Clientes
                    </Link>
                    <Link href="/admin/settings" className={styles.link}>
                        <Settings size={20} /> Configurações
                    </Link>

                    <form action={logoutAdminAction} style={{ marginTop: 'auto' }}>
                        <button type="submit" className={styles.link} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444' }}>
                            <LogOut size={20} /> Sair
                        </button>
                    </form>
                </nav>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
