import mongoose from 'mongoose';

const deliveryItemSchema = new mongoose.Schema({
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['Delivered', 'Absent'], required: true },
    priceCheck: { type: Number, default: 0 }
}, { _id: false });

const deliveryRecordSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    customerId: { type: String, required: true, ref: 'Customer' },
    items: [deliveryItemSchema]
});

// Index for efficient querying by date and customer
deliveryRecordSchema.index({ date: 1, customerId: 1 });
deliveryRecordSchema.index({ customerId: 1 });

export const DeliveryRecord = mongoose.model('DeliveryRecord', deliveryRecordSchema);
