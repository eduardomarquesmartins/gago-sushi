
import { getProductsAction } from "@/lib/actions";
import { ProductTable } from "@/components/admin/ProductTable";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
    const products = await getProductsAction();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Produtos</h1>
                <Link href="/admin/products/new">
                    <Button leftIcon={<Plus size={20} />}>Novo Produto</Button>
                </Link>
            </div>

            <div style={{ background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333', padding: '1px' }}>
                <ProductTable products={products} />
            </div>
        </div>
    );
}
