import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

const customerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // Keeping manual ID for frontend compatibility
    name: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    subscriptions: [subscriptionSchema],
    joinDate: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    assignedTo: { type: String, ref: 'DeliveryMember', index: true }, // Reference by manual ID, not ObjectId
    deliveryShift: {
        type: [String],
        enum: ['Morning', 'Evening'],
        default: ['Morning'],
        validate: {
            validator: function (arr) {
                return arr && arr.length > 0;
            },
            message: 'At least one delivery shift must be selected'
        },
        index: true
    }
});

export const Customer = mongoose.model('Customer', customerSchema);
