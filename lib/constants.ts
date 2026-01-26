export const DELIVERY_FEES: Record<string, number> = {
    'Belem Velho': 18,
    'Belem Novo': 5,
    'Campo Novo': 12,
    'Chapeu do Sol': 8,
    'Ponta Grossa': 8,
    'Pitinga': 18,
    'Lami': 20,
    'Hipica': 0,
    'Juca Batista': 5,
};

export const NEIGHBORHOODS = Object.keys(DELIVERY_FEES);

export const getDeliveryFee = (neighborhood: string) => {
    // Busca exata agora que temos dropdown
    if (DELIVERY_FEES[neighborhood] !== undefined) return DELIVERY_FEES[neighborhood];
    return null;
};
