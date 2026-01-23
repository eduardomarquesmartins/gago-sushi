
import { NewProductForm } from "@/components/admin/NewProductForm";

export default function NewProductPage() {
    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Novo Produto</h1>
            <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                <NewProductForm />
            </div>
        </div>
    );
}
