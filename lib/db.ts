import mongoose from 'mongoose';

// Configurar mongoose globalmente ANTES de qualquer operação
// Em DEV: falha rápido. Em PROD: tenta por mais tempo.
const isDev = process.env.NODE_ENV === 'development';
mongoose.set('bufferCommands', !isDev);
mongoose.set('bufferTimeoutMS', isDev ? 2000 : 15000);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI não definido - app pode ter problemas ao salvar dados');
}

// Global cached connection for Next.js hot reloading
// @ts-expect-error
let cached = global.mongoose;

if (!cached) {
    // @ts-expect-error
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        // Ajustar configurações baseado no ambiente novamente para garantir
        mongoose.set('bufferCommands', !isDev);
        mongoose.set('bufferTimeoutMS', isDev ? 2000 : 15000);

        const opts = {
            bufferCommands: !isDev, // Em PROD, mantemos buffer para resiliência
            serverSelectionTimeoutMS: isDev ? 2000 : 15000,
            connectTimeoutMS: isDev ? 2000 : 15000,
        };

        const tryConnect = async () => {
            try {
                console.log("🔌 Tentando conectar ao MongoDB Atlas...");
                return await mongoose.connect(MONGODB_URI!, opts);
            } catch (error: any) {
                console.error("❌ Erro ao conectar no Atlas:", error.message);

                // Fallback para local em ambiente de desenvolvimento (qualquer erro)
                if (process.env.NODE_ENV === 'development') {
                    console.warn("⚠️  Ambiente de Desenvolvimento detectado. Tentando fallback para MongoDB Local...");
                    try {
                        const localUri = 'mongodb://127.0.0.1:27017/gago-sushi';
                        return await mongoose.connect(localUri, opts);
                    } catch (localError) {
                        console.error("❌ Falha também no MongoDB Local. Verifique se o MongoDB está rodando.");
                        console.warn("💡 Dica: Para rodar sem banco, adicione USE_IN_MEMORY=true no .env.local");
                        throw error; // Lança o erro original
                    }
                }
                throw error;
            }
        };

        cached.promise = tryConnect().then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error("Conexão falhou,app continuará sem banco");
        // Não lança erro - retorna null
    }

    return cached.conn;
}

// === SCHEMAS ===

// Product Schema
const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping string ID for compatibility
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, default: true },
    image: { type: String, required: true },
    isPromotion: { type: Boolean, default: false },
    promotionalPrice: { type: Number },
}, { timestamps: true });

export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);

// User Schema
const addressSchema = new mongoose.Schema({
    neighborhood: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    complement: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: false, sparse: true }, // Optional email
    phone: { type: String, required: true },
    password: { type: String, required: false }, // Optional for phone users
    address: { type: addressSchema, required: true },
    savedAddresses: [addressSchema],
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

// Config Schema
const configSchema = new mongoose.Schema({
    key: { type: String, default: 'store_config', unique: true }, // Singleton pattern
    whatsappNumber: { type: String, default: '5551999999999' },
    deliveryFee: { type: Number, default: 10 },
    pixKey: { type: String, default: '' },
});

export const ConfigModel = mongoose.models.Config || mongoose.model('Config', configSchema);

// Order Schema
const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    change: { type: String }, // For cash payments
    status: {
        type: String,
        enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERY', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
}, { timestamps: true });

export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);

export { connectToDatabase };
