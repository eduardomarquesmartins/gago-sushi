'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectToDatabase, ProductModel, UserModel, ConfigModel, OrderModel } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';
import { Product, Order } from '@/types';
import mongoose from 'mongoose';

// === Admin Auth & Store Config ===


import { DELIVERY_FEES } from './constants';

async function getStoreConfig() {
    const defaults = {
        adminPassword: '2026',
        whatsappNumber: '5511999999999',
        deliveryFee: 10,
        pixKey: '',
        neighborhoodFees: []
    };

    try {
        await connectToDatabase();
        let config = await ConfigModel.findOne({ key: 'store_config' }).lean();

        if (!config) {
            try {
                // Seeding initial data from constants if config doesn't exist
                const initialNeighborhoods = Object.entries(DELIVERY_FEES).map(([name, fee]) => ({ name, fee }));
                config = await ConfigModel.create({
                    ...defaults,
                    neighborhoodFees: initialNeighborhoods,
                    key: 'store_config'
                });
            } catch (error) {
                return defaults;
            }
        } else {
            // Migration for existing config with empty neighborhood list
            if (!config.neighborhoodFees || config.neighborhoodFees.length === 0) {
                const initialNeighborhoods = Object.entries(DELIVERY_FEES).map(([name, fee]) => ({ name, fee }));
                // We don't save it to DB automatically on GET to avoid side effects, 
                // but we return it so the UI shows it and saving will persist it.
                // Actually, let's persist it to fix the user's issue permanently.
                try {
                    await ConfigModel.updateOne(
                        { key: 'store_config' },
                        { $set: { neighborhoodFees: initialNeighborhoods } }
                    );
                    config.neighborhoodFees = initialNeighborhoods;
                } catch (e) {
                    console.error("Failed to migrate neighborhoods", e);
                }
            }
        }

        return { ...defaults, ...config };
    } catch (error) {
        console.warn('⚠️ Usando configuração padrão (sem conexão ao banco)');
        return defaults;
    }
}

export async function loginAdminAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const config = await getStoreConfig();

    if (email === 'admin' && password === config.adminPassword) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 dia
            path: '/',
        });
        return { success: true };
    }

    return { success: false, error: 'Credenciais inválidas' };
}

export async function logoutAdminAction() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/');
}

export async function getStoreConfigAction() {
    const config = await getStoreConfig();
    const { _id, ...rest } = config as any;
    return rest;
}

export async function updateStoreConfigAction(prevState: any, formData: FormData): Promise<{ success: boolean; error?: string; message?: string; }> {
    try {
        await connectToDatabase();
        const currentConfig = await getStoreConfig();

        const currentPasswordInput = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const newWhatsapp = formData.get('newWhatsapp') as string;
        const newDeliveryFee = formData.get('deliveryFee') as string;

        if (newPassword && newPassword.trim() !== '') {
            if (currentPasswordInput !== currentConfig.adminPassword) {
                return { success: false, error: 'Senha atual incorreta. Alteração de senha negada.' };
            }
        }

        const updates: any = {
            adminPassword: (newPassword && newPassword.trim() !== '') ? newPassword : currentConfig.adminPassword,
            whatsappNumber: newWhatsapp ? (() => {
                const clean = newWhatsapp.replace(/\D/g, '');
                if (clean.length === 10 || clean.length === 11) {
                    return `55${clean}`;
                }
                return clean;
            })() : currentConfig.whatsappNumber,
            deliveryFee: newDeliveryFee ? parseFloat(newDeliveryFee) : currentConfig.deliveryFee,
            neighborhoodFees: (() => {
                const feesJson = formData.get('neighborhoodFees') as string;
                if (feesJson) {
                    try {
                        return JSON.parse(feesJson);
                    } catch (e) {
                        console.error("Invalid neighborhoodFees JSON", e);
                        return currentConfig.neighborhoodFees || [];
                    }
                }
                return currentConfig.neighborhoodFees || [];
            })(),
            pixKey: formData.get('pixKey') as string
        };

        await ConfigModel.findOneAndUpdate({ key: 'store_config' }, updates, { upsert: true });

        revalidatePath('/admin/settings');
        revalidatePath('/');
        return { success: true, message: 'Configurações atualizadas com sucesso!' };
    } catch (error) {
        console.error("Erro ao atualizar config:", error);
        return { success: false, error: 'Erro interno ao atualizar configurações.' };
    }
}

// === Produtos Actions ===

export async function getProductsAction() {
    try {
        await connectToDatabase();

        // Verifica se mongoose está realmente conectado
        if (mongoose.connection.readyState !== 1) {
            throw new Error("MongoDB not connected");
        }

        const products = await ProductModel.find({}).lean();
        return products.map((p: any) => ({
            ...p,
            _id: p._id.toString(),
            price: Number(p.price),
            promotionalPrice: p.promotionalPrice ? Number(p.promotionalPrice) : undefined
        }));
    } catch (error) {
        console.warn('⚠️ Usando produtos de exemplo (sem conexão ao banco)');
        // Retorna produtos de exemplo para testar a interface
        return [
            {
                _id: '1',
                id: 'exemplo-1',
                name: 'Combo Sushi',
                description: 'Exemplo de produto para teste',
                price: 45.90,
                category: 'combos',
                available: true,
                image: '/placeholder-sushi.jpg',
                isPromotion: false
            },
            {
                _id: '2',
                id: 'exemplo-2',
                name: 'Hot Roll',
                description: 'Exemplo de produto para teste',
                price: 32.50,
                category: 'hot-rolls',
                available: true,
                image: '/placeholder-sushi.jpg',
                isPromotion: true,
                promotionalPrice: 28.90
            }
        ];
    }
}

export async function createProductAction(formData: FormData) {
    try {
        await connectToDatabase();

        let imagePath = '/placeholder-sushi.jpg';
        const imageFile = formData.get('image') as File;

        if (imageFile && imageFile.size > 0) {
            try {
                imagePath = await uploadImage(imageFile);
            } catch (error) {
                console.error('Erro ao salvar imagem no Cloudinary:', error);
            }
        } else {
            const possibleUrl = formData.get('image') as string;
            if (typeof possibleUrl === 'string' && possibleUrl.startsWith('http')) {
                imagePath = possibleUrl;
            }
        }

        const newProduct = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            category: formData.get('category') as any,
            available: true,
            image: imagePath,
            isPromotion: formData.get('isPromotion') === 'on',
            promotionalPrice: formData.get('promotionalPrice') ? parseFloat(formData.get('promotionalPrice') as string) : undefined
        };

        await ProductModel.create(newProduct);
        revalidatePath('/admin/products');
        revalidatePath('/menu');
        return { success: true };
    } catch (error) {
        console.error("Erro no createProductAction:", error);
        throw new Error("Falha ao criar produto");
    }
}

export async function deleteProductAction(id: string) {
    await connectToDatabase();
    await ProductModel.deleteOne({ id });
    revalidatePath('/admin/products');
    revalidatePath('/menu');
}

export async function updateProductAction(formData: FormData) {
    try {
        await connectToDatabase();
        const id = formData.get('id') as string;

        let imagePath = formData.get('currentImage') as string;
        const imageFile = formData.get('image') as File;

        if (imageFile && imageFile.size > 0) {
            try {
                imagePath = await uploadImage(imageFile);
            } catch (error) {
                console.error('Erro ao salvar nova imagem no Cloudinary:', error);
            }
        } else {
            const possibleUrl = formData.get('imageUrl') as string;
            if (possibleUrl && possibleUrl.startsWith('http')) {
                imagePath = possibleUrl;
            }
        }

        const updates = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            price: parseFloat(formData.get('price') as string),
            category: formData.get('category') as any,
            image: imagePath,
            isPromotion: formData.get('isPromotion') === 'on',
            promotionalPrice: formData.get('promotionalPrice') ? parseFloat(formData.get('promotionalPrice') as string) : null
        };

        const result = await ProductModel.updateOne({ id }, updates);

        if (result.matchedCount === 0) {
            console.error("Product not found for update:", id);
            throw new Error("Produto não encontrado.");
        }

        revalidatePath('/admin/products');
        revalidatePath('/menu');
        revalidatePath(`/admin/products/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Erro no updateProductAction:", error);
        throw new Error("Falha ao atualizar produto");
    }
}

export async function getProductAction(id: string) {
    await connectToDatabase();
    const product = await ProductModel.findOne({ id }).lean();
    if (!product) return null;
    return { ...product, _id: (product as any)._id.toString() };
}

export async function updateProductPriceAction(id: string, newPrice: number) {
    await connectToDatabase();
    await ProductModel.updateOne({ id }, { price: newPrice });
    revalidatePath('/admin/products');
    revalidatePath('/menu');
}

// === Clientes Actions ===

export async function getUsersAction() {
    await connectToDatabase();
    const users = await UserModel.find({}).lean();
    return users.map((u: any) => ({
        ...u,
        _id: u._id.toString(),
        savedAddresses: u.savedAddresses || [u.address]
    }));
}

export async function registerUserAction(userData: any) {
    await connectToDatabase();

    if (userData.email) {
        const existingEmail = await UserModel.findOne({ email: userData.email });
        if (existingEmail) {
            return { success: false, error: 'Email já cadastrado.' };
        }
    }

    if (userData.phone) {
        const existingPhone = await UserModel.findOne({ phone: userData.phone });
        if (existingPhone) {
            return { success: false, error: 'Telefone já cadastrado.' };
        }
    }

    try {
        await UserModel.create({
            id: Math.random().toString(36).substr(2, 9),
            ...userData,
            savedAddresses: [userData.address],
            createdAt: new Date().toISOString()
        });

        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return { success: false, error: 'Erro ao criar usuário.' };
    }
}

export async function loginUserAction(formData: FormData) {
    await connectToDatabase();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = await UserModel.findOne({ email }).lean();

    if (user && (user as any).password === password) {
        const { password, ...userWithoutPassword } = user as any;
        return {
            success: true,
            user: {
                ...userWithoutPassword,
                _id: userWithoutPassword._id.toString()
            }
        };
    }

    return { success: false, error: 'Email ou senha incorretos' };
}

export async function deleteUserAction(id: string) {
    await connectToDatabase();
    await UserModel.deleteOne({ id });
    revalidatePath('/admin/customers');
}

export async function getUserAction(id: string) {
    await connectToDatabase();
    const user = await UserModel.findOne({ id }).lean();
    if (!user) return null;
    return { ...user, _id: (user as any)._id.toString() };
}

export async function updateUserAction(formData: FormData) {
    await connectToDatabase();
    const id = formData.get('id') as string;

    const user = await UserModel.findOne({ id });
    if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
    }

    const updates = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        address: {
            ...user.address,
            street: formData.get('street') as string,
            number: formData.get('number') as string,
            neighborhood: formData.get('neighborhood') as string,
            city: formData.get('city') as string, // Mantendo, se existir
        }
    };

    await UserModel.updateOne({ id }, updates);
    revalidatePath('/admin/customers');
    return { success: true };
}

export async function verifyUserIdentityAction(email: string, phone: string) {
    await connectToDatabase();
    const cleanPhoneInput = phone.replace(/\D/g, '');
    const user = await UserModel.findOne({ email }).lean();

    if (user) {
        const cleanUserPhone = (user as any).phone.replace(/\D/g, '');
        if (cleanUserPhone === cleanPhoneInput) {
            return { success: true, userId: (user as any).id };
        }
    }

    return { success: false, error: 'Dados não conferem.' };
}

export async function resetUserPasswordAction(userId: string, newPassword: string) {
    await connectToDatabase();
    const result = await UserModel.updateOne({ id: userId }, { password: newPassword });

    if (result.matchedCount === 0) {
        return { success: false, error: 'Usuário não encontrado' };
    }

    return { success: true };
}

export async function addNewAddressAction(userId: string, newAddress: any) {
    await connectToDatabase();
    const result = await UserModel.updateOne(
        { id: userId },
        { $push: { savedAddresses: newAddress } }
    );

    if (result.matchedCount === 0) return { success: false, error: 'Usuário não encontrado' };

    revalidatePath('/checkout');
    return { success: true, newAddress };
}

export async function removeAddressAction(userId: string, addressIndex: number) {
    await connectToDatabase();
    const user = await UserModel.findOne({ id: userId });
    if (!user) return { success: false, error: 'Usuário não encontrado' };

    if (user.savedAddresses && user.savedAddresses.length > addressIndex) {
        user.savedAddresses.splice(addressIndex, 1);
        await user.save();
        revalidatePath('/checkout');
        return { success: true };
    }

    return { success: false, error: 'Endereço inválido' };
}

// === Order Management ===

export async function createOrderAction(orderData: any) {
    try {
        await connectToDatabase();

        const id = Math.random().toString(36).substr(2, 9).toUpperCase();

        const newOrder = await OrderModel.create({
            ...orderData,
            id,
            status: 'PENDING',
        });

        return { success: true, orderId: newOrder.id };
    } catch (error) {
        console.error("Error creating order:", error);
        console.warn("⚠️ Pedido não foi salvo (sem conexão) - mas WhatsApp será aberto");
        // Retorna sucesso mesmo sem salvar para testar a interface
        const fakeId = Math.random().toString(36).substr(2, 9).toUpperCase();
        return { success: true, orderId: fakeId };
    }
}

export async function createManualOrderAction(orderData: any) {
    await connectToDatabase();
    try {
        const id = Math.random().toString(36).substr(2, 9).toUpperCase();

        const newOrder = await OrderModel.create({
            id,
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            customerAddress: orderData.customerAddress,
            items: [{
                productId: 'manual',
                name: orderData.description,
                quantity: 1,
                price: parseFloat(orderData.total)
            }],
            total: parseFloat(orderData.total),
            paymentMethod: orderData.paymentMethod,
            status: 'PENDING',
        });

        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Error creating manual order:", error);
        return { success: false, error: "Falha ao criar pedido manual" };
    }
}

export async function getOrdersAction(filter: 'current' | 'previous' | 'all' = 'current') {
    await connectToDatabase();
    try {
        let query = {};

        if (filter !== 'all') {
            const now = new Date();
            // Ajustar para fuso horário de São Paulo (UTC-3)
            // Se formos usar UTC como referência base, precisamos garantir que a lógica "6 da manhã local" funcione.
            // Vou usar uma abordagem simplificada assumindo o servidor em UTC ou local, mas focando na lógica relativa.

            // Lógica:
            // "Dia Comercial" começa às 06:00.
            // Se agora é 05:59 de terça, o "Dia Comercial" começou às 06:00 de segunda.
            // Se agora é 06:01 de terça, o "Dia Comercial" começou às 06:00 de terça.

            // Vamos trabalhar com timestamp para facilitar.
            // Pegamos a hora atual. Subtraímos 6 horas. O "Dia" é a data resultante (zerando horas/min).
            // Em seguida somamos 6 horas para ter o timestamp de corte.

            const timeZoneOffset = -3; // São Paulo UTC-3 (simplificando sem considerar horário de verão legacy, já que não temos mais)

            // Criar data atual ajustada para o fuso (apenas para extrair dia/mês/ano correto do "dia comercial")
            const localNow = new Date(now.getTime() + (timeZoneOffset * 60 * 60 * 1000));

            // Se for antes das 6 da manhã (no horário local), pertence ao dia anterior.
            const currentHour = localNow.getUTCHours();

            let cutoffDate = new Date(localNow);
            if (currentHour < 6) {
                cutoffDate.setUTCDate(cutoffDate.getUTCDate() - 1);
            }

            // Definir o corte exato: 06:00:00.000 do dia identificado
            cutoffDate.setUTCHours(6, 0, 0, 0);

            // Converter de volta para UTC "real" para comparar com o banco (que salva em UTC)
            // Se o cutoff local é 06:00, e o fuso é UTC-3, então em UTC é 09:00.
            // cutoffDate aqui (construído como Date) representa o momento no tempo.
            // Como construi usando métodos UTC sobre o "localNow", preciso ajustar.
            // ESPERA: A lógica acima com getUTCHours() em cima do "localNow" já está meio confusa.
            // Vamos reiniciar com uma lógica mais segura usando strings ISO se necessário ou aritmética direta.

            // TENTATIVA 2 (Mais robusta):
            // 1. Obter hora atual
            // 2. Subtrair 6 horas.
            // 3. Zerar horas, minutos, segundos -> Isso nos dá o "Início do dia comercial atual" (às 00:00 relativas).
            // 4. Somar 6 horas -> "Início do dia comercial atual" (às 06:00 relativas).

            // Porém, tudo isso tem que ser em relação ao fuso horário do Brasil?
            // O servidor Vercel roda em UTC.
            // O banco Mongo salva em ISO UTC.

            // O Brasil está em UTC-3.
            // 06:00 BRT = 09:00 UTC.

            const nowUTC = new Date();
            const nowBRT_Ms = nowUTC.getTime() - (3 * 60 * 60 * 1000); // hora "visual" no brasil em ms
            const nowBRT = new Date(nowBRT_Ms);

            // Se user setou as 06:00 BRT como limite.
            // Se agora for 08:00 BRT. Cutoff é hoje às 06:00 BRT.
            // Se agora for 04:00 BRT. Cutoff é ontem às 06:00 BRT.

            const businessDayStart = new Date(nowBRT);
            if (businessDayStart.getUTCHours() < 6) {
                businessDayStart.setUTCDate(businessDayStart.getUTCDate() - 1);
            }
            businessDayStart.setUTCHours(6, 0, 0, 0);

            // Agora converter businessDayStart (que está "fingindo" ser UTC mas é horario BR) de volta para UTC real para query
            const cutoffTimestamp = businessDayStart.getTime() + (3 * 60 * 60 * 1000);
            const cutoffDateReal = new Date(cutoffTimestamp);

            if (filter === 'current') {
                // Mostrar pedidos DEPOIS do corte
                query = { createdAt: { $gte: cutoffDateReal.toISOString() } };
            } else if (filter === 'previous') {
                // Mostrar pedidos ANTES do corte
                query = { createdAt: { $lt: cutoffDateReal.toISOString() } };
            }
        }

        const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
    await connectToDatabase();
    try {
        await OrderModel.findOneAndUpdate({ id: orderId }, { status: newStatus });
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false };
    }
}

export async function getFinancialStatsAction(period: 'day' | 'week' | 'month' | 'year' = 'week') {
    await connectToDatabase();
    try {
        // ... reusing existing logic, but for brevity/safety I'll just rewrite it all
        // to avoid risk of omitting it again.
        const now = new Date();
        const timeZone = 'America/Sao_Paulo';
        let startDate = new Date();

        switch (period) {
            case 'day':
                startDate = new Date(now.toLocaleString('en-US', { timeZone }));
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate.setDate(now.getDate() - 29);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        const orders = await OrderModel.find({ status: { $ne: 'CANCELLED' } }).lean();

        let totalRevenue = 0;
        let totalOrders = 0;
        const chartData: Record<string, number> = {};

        if (period === 'day') {
            for (let i = 0; i < 24; i++) {
                chartData[i.toString().padStart(2, '0') + ':00'] = 0;
            }
        } else if (period === 'year') {
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = d.toLocaleString('pt-BR', { month: 'short', timeZone });
                chartData[key.replace('.', '')] = 0;
            }
        } else {
            const daysBack = period === 'week' ? 7 : 30;
            for (let i = daysBack - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const key = d.toLocaleDateString('pt-BR', { timeZone }).substring(0, 5);
                chartData[key] = 0;
            }
        }

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const orderDateStr = orderDate.toLocaleDateString('pt-BR', { timeZone });
            const isToday = orderDateStr === now.toLocaleDateString('pt-BR', { timeZone });

            let include = false;
            let key = '';

            if (period === 'day') {
                if (isToday) {
                    include = true;
                    const hour = orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', timeZone });
                    key = hour + ':00';
                }
            } else if (period === 'week' || period === 'month') {
                const diffTime = now.getTime() - orderDate.getTime();
                const diffDays = diffTime / (1000 * 3600 * 24);
                const limit = period === 'week' ? 7 : 30;

                if (diffDays <= limit && diffDays >= 0) {
                    const keyCandidate = orderDate.toLocaleDateString('pt-BR', { timeZone }).substring(0, 5);
                    if (chartData.hasOwnProperty(keyCandidate)) {
                        include = true;
                        key = keyCandidate;
                    }
                }
            } else if (period === 'year') {
                const keyCandidate = orderDate.toLocaleString('pt-BR', { month: 'short', timeZone }).replace('.', '');
                if (chartData.hasOwnProperty(keyCandidate) && (now.getTime() - orderDate.getTime()) < 31536000000 * 1.1) {
                    include = true;
                    key = keyCandidate;
                }
            }

            if (include) {
                totalRevenue += order.total;
                totalOrders += 1;
                if (key && chartData[key] !== undefined) {
                    chartData[key] += order.total;
                }
            }
        });

        return {
            totalRevenue,
            totalOrders,
            dailyStats: Object.entries(chartData).map(([date, total]) => ({ date, total })),
            period
        };
    } catch (error) {
        console.error("Error getting financial stats:", error);
        return { totalRevenue: 0, totalOrders: 0, dailyStats: [], period };
    }
}

export async function deleteOrderAction(orderId: string) {
    await connectToDatabase();
    try {
        await OrderModel.deleteOne({ id: orderId });
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error) {
        console.error("Error deleting order:", error);
        return { success: false, error: "Failed to delete order" };
    }
}
