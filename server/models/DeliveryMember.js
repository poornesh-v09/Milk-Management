import mongoose from 'mongoose';

const deliveryMemberSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    route: { type: String, default: '' },
    shift: { type: String, enum: ['Morning', 'Evening', 'Both'], default: 'Morning' },
    isActive: { type: Boolean, default: true }
});

export const DeliveryMember = mongoose.model('DeliveryMember', deliveryMemberSchema);
