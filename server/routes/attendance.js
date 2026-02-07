import express from 'express';
import { Attendance } from '../models/Attendance.js';
import { Customer } from '../models/Customer.js';
import { DeliveryMember } from '../models/DeliveryMember.js';
import { Price } from '../models/Price.js';

const router = express.Router();

// Get attendance sheet template for a delivery person on a specific date
// This fetches all customers assigned to the delivery person with their fixed milk quantities
router.get('/sheet/:deliveryPersonId/:date', async (req, res) => {
    try {
        const { deliveryPersonId, date } = req.params;

        // Get delivery person details
        const deliveryPerson = await DeliveryMember.findOne({ id: deliveryPersonId });
        if (!deliveryPerson) {
            return res.status(404).json({ error: 'Delivery person not found' });
        }

        // Get all customers assigned to this delivery person
        const customers = await Customer.find({
            assignedTo: deliveryPersonId,
            isActive: true
        });

        // Get current milk price
        const milkPrice = await Price.findOne({ product: 'Milk' });
        const pricePerLiter = milkPrice ? milkPrice.price : 58; // Default to ₹58 if not set

        // Build attendance sheet template
        const entries = customers.map(customer => {
            const milkSubscription = customer.subscriptions.find(sub => sub.product === 'Milk');
            const fixedQuantity = milkSubscription ? milkSubscription.quantity : 0;

            return {
                customerId: customer.id,
                customerName: customer.name,
                fixedQuantity,
                deliveredQuantity: fixedQuantity, // Default to fixed quantity
                status: 'Delivered',
                pricePerLiter,
                deliveryShift: customer.deliveryShift || ['Morning']
            };
        });

        res.json({
            date,
            deliveryPersonId,
            deliveryPersonName: deliveryPerson.name,
            entries,
            pricePerLiter
        });
    } catch (error) {
        console.error('Error fetching attendance sheet:', error);
        res.status(500).json({ error: 'Failed to fetch attendance sheet' });
    }
});

// Check if attendance already exists for a specific date and delivery person
router.get('/check/:deliveryPersonId/:date', async (req, res) => {
    try {
        const { deliveryPersonId, date } = req.params;

        const existing = await Attendance.findOne({
            date,
            deliveryPersonId
        });

        res.json({
            exists: !!existing,
            attendance: existing
        });
    } catch (error) {
        console.error('Error checking attendance:', error);
        res.status(500).json({ error: 'Failed to check attendance' });
    }
});

// Submit/Save attendance
router.post('/', async (req, res) => {
    try {
        const { date, deliveryPersonId, deliveryPersonName, entries } = req.body;

        // Validate required fields
        if (!date || !deliveryPersonId || !deliveryPersonName || !entries || !Array.isArray(entries)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for duplicate entry
        const existing = await Attendance.findOne({
            date,
            deliveryPersonId
        });

        if (existing) {
            return res.status(409).json({
                error: 'Attendance already submitted for this date',
                attendance: existing
            });
        }

        // Create new attendance record
        const attendance = new Attendance({
            date,
            deliveryPersonId,
            deliveryPersonName,
            entries,
            submittedAt: new Date()
        });

        await attendance.save();

        res.status(201).json({
            message: 'Attendance saved successfully',
            attendance
        });
    } catch (error) {
        console.error('Error saving attendance:', error);
        if (error.code === 11000) {
            // Duplicate key error
            return res.status(409).json({ error: 'Attendance already submitted for this date' });
        }
        res.status(500).json({ error: 'Failed to save attendance' });
    }
});

// Get delivery person's attendance history with filters
router.get('/history/:deliveryPersonId', async (req, res) => {
    try {
        const { deliveryPersonId } = req.params;
        const { date, month, year, startDate, endDate, customerName } = req.query;

        let query = { deliveryPersonId };

        // Apply date filters
        if (date) {
            query.date = date;
        } else if (year && month) {
            const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
            query.date = { $regex: `^${yearMonth}` };
        } else if (year) {
            query.date = { $regex: `^${year}` };
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        // Fetch records
        const records = await Attendance.find(query).sort({ date: -1 }).lean();

        // Filter entries if customerName is provided
        if (customerName) {
            const regex = new RegExp(customerName, 'i');
            const filteredRecords = records.map(record => {
                const filteredEntries = record.entries.filter(entry =>
                    regex.test(entry.customerName)
                );
                return { ...record, entries: filteredEntries };
            }).filter(record => record.entries.length > 0); // Only return days where customer was present

            return res.json(filteredRecords);
        }

        res.json(records);
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        res.status(500).json({ error: 'Failed to fetch attendance history' });
    }
});

// Admin view - Get all attendance records with filters
router.get('/admin', async (req, res) => {
    try {
        const { date, month, year, deliveryPersonId, startDate, endDate, customerName } = req.query;

        let query = {};

        // Filter by delivery person
        if (deliveryPersonId) {
            query.deliveryPersonId = deliveryPersonId;
        }

        // Apply date filters
        if (date) {
            query.date = date;
        } else if (year && month) {
            const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
            query.date = { $regex: `^${yearMonth}` };
        } else if (year) {
            query.date = { $regex: `^${year}` };
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(query).sort({ date: -1, deliveryPersonId: 1 }).lean();

        if (customerName) {
            const regex = new RegExp(customerName, 'i');
            const filteredRecords = records.map(record => {
                const filteredEntries = record.entries.filter(entry =>
                    regex.test(entry.customerName)
                );
                return { ...record, entries: filteredEntries };
            }).filter(record => record.entries.length > 0);

            return res.json(filteredRecords);
        }

        res.json(records);
    } catch (error) {
        console.error('Error fetching admin attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
});

// Get single attendance record by ID
router.get('/:id', async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance record' });
    }
});

export default router;
