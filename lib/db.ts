import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
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
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
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
    zip: { type: String, required: false }, // Made optional
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
