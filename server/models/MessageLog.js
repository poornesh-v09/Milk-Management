import mongoose from 'mongoose';

const messageLogSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    channel: { type: String, enum: ['SMS', 'WhatsApp'], required: true },
    status: { type: String, enum: ['Pending', 'Sent', 'Failed'], required: true },
    timestamp: { type: Date, default: Date.now }
});

export const MessageLog = mongoose.model('MessageLog', messageLogSchema);
