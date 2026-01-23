import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import { CartBottomBar } from "@/components/shop/CartBottomBar";
import { Footer } from "@/components/shop/Footer";
import { getStoreConfigAction } from "@/lib/actions";

export const dynamic = 'force-dynamic';

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const config = await getStoreConfigAction();

    return (
        <UserProvider>
            <CartProvider deliveryFee={config.deliveryFee}>
                {children}
                <CartDrawer />
                <CartBottomBar />

                <WhatsAppButton phoneNumber={config.whatsappNumber} />
                <Footer />
            </CartProvider>
        </UserProvider>
    );
}
