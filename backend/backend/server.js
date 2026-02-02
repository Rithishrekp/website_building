import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// Base route
app.get('/', (req, res) => {
    res.send({ message: "API is running..." });
});

import pool from './config/db.js';

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connection successful:', res.rows[0].now);
    } catch (err) {
        console.error('Database connection failed:', err);
    }
});
