import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true,
        unique: true
    },
    price: { type: Number, required: true, min: 0 }
});

export const Price = mongoose.model('Price', priceSchema);
