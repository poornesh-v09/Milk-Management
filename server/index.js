import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import customerRoutes from './routes/customers.js';
import memberRoutes from './routes/members.js';
import priceRoutes from './routes/prices.js';
import deliveryRoutes from './routes/deliveries.js';
import statsRoutes from './routes/stats.js';
import attendanceRoutes from './routes/attendance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/attendance', attendanceRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Milk Management API is running');
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Atlas Connected Successfully');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to connect to MongoDB Atlas:', error.message);
        process.exit(1); // Exit with failure
    }
};

startServer();
