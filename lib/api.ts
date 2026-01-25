
import { connectToDatabase, ProductModel } from "@/lib/db";
import { Product } from "@/types";
import mongoose from 'mongoose';

// Dados mock para fallback
const MOCK_PRODUCTS: Product[] = [
    {
        id: 'mock-1',
        name: 'Combo Sushi (Exemplo)',
        description: 'Produto de exemplo (sem banco de dados)',
        price: 45.90,
        category: 'combo',
        available: true,
        image: '/placeholder-sushi.jpg',
        isPromotion: false
    },
    {
        id: 'mock-2',
        name: 'Hot Roll (Exemplo)',
        description: 'Produto de exemplo (sem banco de dados)',
        price: 32.50,
        category: 'roll',
        available: true,
        image: '/placeholder-sushi.jpg',
        isPromotion: true,
        promotionalPrice: 28.90
    }
];

export async function getProducts(): Promise<Product[]> {
    try {
        await connectToDatabase();
        if (mongoose.connection.readyState !== 1) throw new Error("No DB");

        const products = await ProductModel.find({}).lean();

        return products.map((p: any) => ({
            ...p,
            id: p._id ? p._id.toString() : p.id,
            _id: p._id ? p._id.toString() : undefined,
        })) as Product[];
    } catch (error) {
        console.warn('⚠️ API: Usando produtos de exemplo');
        return MOCK_PRODUCTS;
    }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
    try {
        await connectToDatabase();
        if (mongoose.connection.readyState !== 1) throw new Error("No DB");

        const query = category === 'all' ? {} : { category };
        const products = await ProductModel.find(query).lean();

        return products.map((p: any) => ({
            ...p,
            id: p._id ? p._id.toString() : p.id,
            _id: p._id ? p._id.toString() : undefined,
        })) as Product[];
    } catch (error) {
        console.warn('⚠️ API: Usando produtos de exemplo (Category)');
        if (category === 'all') return MOCK_PRODUCTS;
        return MOCK_PRODUCTS.filter(p => p.category === category);
    }
}
