import { getStoreConfigAction } from "@/lib/actions";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettings() {
    const config = await getStoreConfigAction();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Configurações</h1>
            <SettingsForm
                currentWhatsapp={config.whatsappNumber}
                currentDeliveryFee={config.deliveryFee}
                currentPixKey={config.pixKey}
                currentNeighborhoodFees={config.neighborhoodFees || []}
            />
        </div>
    );
}
