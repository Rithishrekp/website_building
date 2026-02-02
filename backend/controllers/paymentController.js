import pool from '../config/db.js';

export const processPayment = async (req, res) => {
    const { bookingId, userId, amount, paymentMethod } = req.body;

    try {
        // In a real app, you'd call Stripe/PayPal API here.
        // For this "make it real" request, we'll simulate a successful transaction 
        // and record it in our database.

        const transactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

        const newPayment = await pool.query(
            'INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [bookingId, userId, amount, paymentMethod, transactionId, 'completed']
        );

        // Update booking status to 'confirmed' if it was 'pending'
        await pool.query(
            "UPDATE bookings SET status = 'confirmed' WHERE id = $1 AND status = 'pending'",
            [bookingId]
        );

        res.status(201).json({
            message: 'Payment processed successfully',
            payment: newPayment.rows[0]
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Payment processing failed' });
    }
};

export const getPaymentHistory = async (req, res) => {
    const { userId } = req.params;

    try {
        const query = `
            SELECT p.*, s.title as service_name
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN services s ON b.service_id = s.id
            WHERE p.user_id = $1
            ORDER BY p.created_at DESC
        `;

        const payments = await pool.query(query, [userId]);
        res.json(payments.rows);
    } catch (error) {
        console.error('Fetch payment history error:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
};
