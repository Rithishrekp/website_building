import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, role || 'customer']
        );

        const user = newUser.rows[0];

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_available: user.is_available,
            is_onboarded: user.is_onboarded,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server check error' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_available: user.is_available,
                is_onboarded: user.is_onboarded,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Toggle provider availability
export const toggleAvailability = async (req, res) => {
    const { userId } = req.body;

    try {
        // Get current availability status
        const userResult = await pool.query('SELECT is_available FROM users WHERE id = $1 AND role = $2', [userId, 'provider']);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        const currentStatus = userResult.rows[0].is_available;
        const newStatus = !currentStatus;

        // Update availability
        await pool.query('UPDATE users SET is_available = $1 WHERE id = $2', [newStatus, userId]);

        res.json({
            success: true,
            is_available: newStatus,
            message: newStatus ? 'You are now available for bookings' : 'You are now unavailable for bookings'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Complete provider onboarding
export const completeOnboarding = async (req, res) => {
    const { userId, phone, address } = req.body;

    try {
        await pool.query(
            'UPDATE users SET is_onboarded = $1, phone = $2, address = $3 WHERE id = $4 AND role = $5',
            [true, phone, address, userId, 'provider']
        );

        res.json({
            success: true,
            is_onboarded: true,
            message: 'Onboarding completed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
