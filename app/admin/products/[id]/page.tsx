
import { getProductAction } from "@/lib/actions";
import { NewProductForm } from "@/components/admin/NewProductForm";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;

    // Buscar produto
    const product = await getProductAction(id);

    if (!product) {
        redirect('/admin/products');
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Editar Produto</h1>
            <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <NewProductForm initialData={product} />
            </div>
        </div>
    );
}
