import React from 'react';
import { getUsersAction } from "@/lib/actions";
import { CustomerTable } from "@/components/admin/CustomerTable";

export default async function AdminCustomersPage() {
    const users = await getUsersAction();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Clientes ({users.length})</h1>
            </div>

            <CustomerTable users={users} />
        </div>
    );
}
