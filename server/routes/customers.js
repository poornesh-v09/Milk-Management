import express from 'express';
import { Customer } from '../models/Customer.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().select('-__v').lean();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new customer
router.post('/', async (req, res) => {
    const customerData = req.body;
    // Generate ID if not provided
    if (!customerData.id) {
        customerData.id = Date.now().toString();
    }

    const customer = new Customer(customerData);
    try {
        const newCustomer = await customer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update customer
router.put('/:id', async (req, res) => {
    try {
        // We search by custom 'id' field, not _id
        const updatedCustomer = await Customer.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
        res.json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
