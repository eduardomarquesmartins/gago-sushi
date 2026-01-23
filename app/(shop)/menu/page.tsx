
import { Header } from "@/components/shop/Header";
import { MenuList } from "@/components/shop/MenuList";
import { getProducts } from "@/lib/api";

export default async function MenuPage() {
    const products = await getProducts();

    return (
        <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Header />
            <div className="container" style={{ paddingTop: '140px', paddingBottom: '4rem' }}>
                <MenuList initialProducts={products} />
            </div>
        </main>
    );
}
