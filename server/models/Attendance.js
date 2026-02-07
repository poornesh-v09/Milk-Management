import mongoose from 'mongoose';

const attendanceEntrySchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    fixedQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    deliveredQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['Delivered', 'Absent']
    },
    pricePerLiter: {
        type: Number,
        required: true,
        min: 0
    },
    deliveryShift: {
        type: [String],
        enum: ['Morning', 'Evening'],
        default: ['Morning']
    }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/  // YYYY-MM-DD format
    },
    deliveryPersonId: {
        type: String,
        required: true,
        ref: 'DeliveryMember',
        index: true
    },
    deliveryPersonName: {
        type: String,
        required: true
    },
    entries: [attendanceEntrySchema],
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound unique index to prevent duplicate attendance entries for same date and delivery person
attendanceSchema.index({ date: 1, deliveryPersonId: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
