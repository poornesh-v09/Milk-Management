import express from 'express';
import { DeliveryRecord } from '../models/DeliveryRecord.js';

const router = express.Router();

// Get records
// Query params: date, month, year, customerId
router.get('/', async (req, res) => {
    try {
        const { date, month, year, customerId } = req.query;
        let query = {};

        if (date) {
            query.date = date;
        }

        if (customerId) {
            query.customerId = customerId;
        }

        // For monthly reports, we need to filter by date string parsing or stored fields.
        // Since we store date as YYYY-MM-DD string, regex is easiest for month/year if not indexed by separate fields.
        // Optimization: The schema is simple string date.
        if (month !== undefined && year !== undefined) {
            // format: "YYYY-MM"
            const m = (parseInt(month) + 1).toString().padStart(2, '0');
            const prefix = `${year}-${m}`;
            query.date = { $regex: new RegExp(`^${prefix}`) };
        }

        const records = await DeliveryRecord.find(query).lean();
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save single record
router.post('/', async (req, res) => {
    const record = new DeliveryRecord(req.body);
    try {
        const newRecord = await record.save();
        res.status(201).json(newRecord);
    } catch (error) {
        // If duplicate ID, try update? Or frontend should handle PUT?
        // Let's support upsert logic here for simplicity if ID exists
        if (error.code === 11000) {
            // Duplicate key
            const updated = await DeliveryRecord.findOneAndUpdate(
                { id: req.body.id },
                req.body,
                { new: true }
            );
            return res.json(updated);
        }
        res.status(400).json({ message: error.message });
    }
});

// Bulk save (for "Save All" feature)
router.post('/bulk', async (req, res) => {
    try {
        const records = req.body; // Array of records
        const operations = records.map(r => ({
            updateOne: {
                filter: { id: r.id },
                update: { $set: r },
                upsert: true
            }
        }));

        await DeliveryRecord.bulkWrite(operations);
        res.json({ message: 'Records saved successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
