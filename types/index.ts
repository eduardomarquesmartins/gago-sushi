
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'temaki' | 'combo' | 'sashimi' | 'roll' | 'bebida';
    image?: string;
    available: boolean;
    isPromotion?: boolean;
    promotionalPrice?: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Address {
    neighborhood: string;
    street: string;
    number: string;
    complement?: string;
}

export interface User {
    id?: string;
    name: string;
    email: string;
    phone: string;
    address: Address;
    savedAddresses?: Address[];
}

export interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: OrderItem[];
    total: number;
    paymentMethod: string;
    change?: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERY' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';
    createdAt: string;
    updatedAt: string;
}
