import express from 'express';
import { Customer } from '../models/Customer.js';
import { DeliveryMember } from '../models/DeliveryMember.js';
import { Attendance } from '../models/Attendance.js';
import { Price } from '../models/Price.js';
import { DeliveryRecord } from '../models/DeliveryRecord.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ isActive: true });
        const totalMembers = await DeliveryMember.countDocuments();
        const totalProducts = await Price.countDocuments(); // Or just hardcoded 5 if prices table varies

        // Monthly Revenue (Current Month)
        const now = new Date();
        const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
        const yearStr = now.getFullYear();
        const prefix = `${yearStr}-${monthStr}`; // YYYY-MM

        // Aggregation to calculate revenue from Attendance
        const result = await Attendance.aggregate([
            {
                $match: {
                    date: { $regex: new RegExp(`^${prefix}`) }
                }
            },
            {
                $unwind: '$entries'
            },
            {
                $match: {
                    'entries.status': 'Delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $multiply: ['$entries.deliveredQuantity', '$entries.pricePerLiter'] }
                    }
                }
            }
        ]);

        const monthlyRevenue = result.length > 0 ? result[0].totalRevenue : 0;

        res.json({
            totalCustomers,
            activeCustomers,
            totalProducts,
            totalMembers,
            monthlyRevenue
        });

    } catch (error) {
        console.error("Dashboard stats error:", error); // Updated error logging
        res.status(500).json({ message: error.message });
    }
});

router.get('/products', async (req, res) => {
    try {
        const { month, year } = req.query;
        const targetMonth = month !== undefined ? parseInt(month) : new Date().getMonth();
        const targetYear = year !== undefined ? parseInt(year) : new Date().getFullYear();

        const mStr = (targetMonth + 1).toString().padStart(2, '0');
        const prefix = `${targetYear}-${mStr}`;

        // 1. Get Daily Quantities (Sum of subscriptions for active customers)
        const dailyStats = await Customer.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$subscriptions' },
            {
                $group: {
                    _id: '$subscriptions.product',
                    dailyQuantity: { $sum: '$subscriptions.quantity' }
                }
            }
        ]);

        // 2. Get Monthly Stats (From DeliveryRecords)
        const monthlyStats = await DeliveryRecord.aggregate([
            {
                $match: {
                    date: { $regex: new RegExp(`^${prefix}`) }
                }
            },
            { $unwind: '$items' },
            {
                $match: {
                    'items.status': 'Delivered'
                }
            },
            {
                $group: {
                    _id: '$items.product',
                    monthlyQuantity: { $sum: '$items.quantity' },
                    monthlyRevenue: {
                        $sum: { $multiply: ['$items.quantity', '$items.priceCheck'] }
                    }
                }
            }
        ]);

        // Map of products we want to ensure are in the result
        const productsList = ['Milk', 'Curd', 'Ghee', 'Paneer'];
        const statsMap = {};

        // Initialize with zeros for all standard products
        productsList.forEach(p => {
            statsMap[p] = {
                product: p,
                dailyQuantity: 0,
                monthlyQuantity: 0,
                monthlyRevenue: 0
            };
        });

        // Add daily quantities
        dailyStats.forEach(stat => {
            if (statsMap[stat._id]) {
                statsMap[stat._id].dailyQuantity = stat.dailyQuantity;
            } else if (productsList.includes(stat._id) || !productsList.length) {
                // In case there are other products not in the list but we want to show them
                statsMap[stat._id] = {
                    product: stat._id,
                    dailyQuantity: stat.dailyQuantity,
                    monthlyQuantity: 0,
                    monthlyRevenue: 0
                };
            }
        });

        // Add monthly stats
        monthlyStats.forEach(stat => {
            if (statsMap[stat._id]) {
                statsMap[stat._id].monthlyQuantity = stat.monthlyQuantity;
                statsMap[stat._id].monthlyRevenue = stat.monthlyRevenue;
            } else if (!productsList.includes(stat._id)) {
                statsMap[stat._id] = {
                    product: stat._id,
                    dailyQuantity: 0,
                    monthlyQuantity: stat.monthlyQuantity,
                    monthlyRevenue: stat.monthlyRevenue
                };
            }
        });

        res.json(Object.values(statsMap));

    } catch (error) {
        console.error("Product stats error:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
