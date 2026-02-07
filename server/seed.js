import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer } from './models/Customer.js';
import { DeliveryMember } from './models/DeliveryMember.js';
import { DeliveryRecord } from './models/DeliveryRecord.js';
import { Price } from './models/Price.js';
import { MessageLog } from './models/MessageLog.js';
import { Attendance } from './models/Attendance.js';

dotenv.config();

const initialMembers = [
    { id: 'm1', name: 'Ramesh (Route A)', mobile: '9800011122', route: 'North Extension', isActive: true },
    { id: 'm2', name: 'Suresh (Route B)', mobile: '9800033344', route: 'South Garden', isActive: true }
];

const defaultPrices = [
    { product: 'Milk', price: 58 },
    { product: 'Curd', price: 60 },
    { product: 'Ghee', price: 650 },
    { product: 'Paneer', price: 450 },
    { product: 'ButterMilk', price: 20 }
];

const initialCustomers = [
    {
        id: '1',
        name: 'Rajesh Kumar',
        address: '123, Gandhi Nagar, 2nd Cross',
        mobile: '9876543210',
        subscriptions: [
            { product: 'Milk', quantity: 2 },
            { product: 'Curd', quantity: 1 }
        ],
        joinDate: '2025-12-01',
        isActive: true,
        assignedTo: 'm1'
    },
    {
        id: '2',
        name: 'Priya Sharma',
        address: 'Flat 402, Sunshine Apts',
        mobile: '9123456780',
        subscriptions: [
            { product: 'Milk', quantity: 1 }
        ],
        joinDate: '2026-01-05',
        isActive: true,
        assignedTo: 'm2'
    },
];

const initialAttendance = [
    {
        date: new Date().toISOString().split('T')[0],
        deliveryPersonId: 'm1',
        deliveryPersonName: 'Ramesh (Route A)',
        entries: [
            { customerId: '1', customerName: 'Rajesh Kumar', fixedQuantity: 2, deliveredQuantity: 2, status: 'Delivered', pricePerLiter: 58 }
        ]
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Customer.deleteMany({});
        await DeliveryMember.deleteMany({});
        await DeliveryRecord.deleteMany({});
        await Price.deleteMany({});
        await MessageLog.deleteMany({});
        await Attendance.deleteMany({});
        console.log('Cleared existing data');

        // Insert new data
        await DeliveryMember.insertMany(initialMembers);
        console.log('Inserted Members');

        await Price.insertMany(defaultPrices);
        console.log('Inserted Prices');

        await Customer.insertMany(initialCustomers);
        console.log('Inserted Customers');

        await Attendance.insertMany(initialAttendance);
        console.log('Inserted Attendance');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
