import express from 'express';
import { Price } from '../models/Price.js';

const router = express.Router();

// Get all prices
router.get('/', async (req, res) => {
    try {
        const prices = await Price.find();
        // Convert array to object for frontend compatibility if needed, 
        // but better to return standard array and map in frontend or keep consistent.
        // Returning array to be standard REST.
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new product
router.post('/add', async (req, res) => {
    try {
        const { product, price } = req.body;
        if (!product || price === undefined) {
            return res.status(400).json({ message: 'Product name and price are required' });
        }

        const newPrice = new Price({ product, price });
        await newPrice.save();
        res.status(201).json(newPrice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product
router.delete('/:product', async (req, res) => {
    try {
        const { product } = req.params;
        const result = await Price.findOneAndDelete({ product });

        if (!result) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update prices (Bulk update)
router.post('/bulk', async (req, res) => {
    try {
        const prices = req.body; // Array of { product, price }

        // Using bulkWrite for efficiency
        const operations = prices.map(p => ({
            updateOne: {
                filter: { product: p.product },
                update: { $set: { price: p.price } },
                upsert: true
            }
        }));

        await Price.bulkWrite(operations);
        const updatedPrices = await Price.find();
        res.json(updatedPrices);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
