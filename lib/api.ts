
import { connectToDatabase, ProductModel } from "@/lib/db";
import { Product } from "@/types";

export async function getProducts(): Promise<Product[]> {
    await connectToDatabase();
    const products = await ProductModel.find({}).lean();

    return products.map((p: any) => ({
        ...p,
        id: p._id ? p._id.toString() : p.id,
        _id: p._id ? p._id.toString() : undefined,
    })) as Product[];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
    await connectToDatabase();
    const query = category === 'all' ? {} : { category };
    const products = await ProductModel.find(query).lean();

    return products.map((p: any) => ({
        ...p,
        id: p._id ? p._id.toString() : p.id,
        _id: p._id ? p._id.toString() : undefined,
    })) as Product[];
}
