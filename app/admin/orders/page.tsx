import { getOrdersAction } from '@/lib/actions';
import { OrdersTable } from '@/components/admin/OrdersTable';
import styles from './orders.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const orders = await getOrdersAction();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Gerenciar Pedidos</h1>
            <OrdersTable initialOrders={orders} />
        </div>
    );
}
