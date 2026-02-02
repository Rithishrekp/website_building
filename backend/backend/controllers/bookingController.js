import pool from '../config/db.js';

export const createBooking = async (req, res) => {
    const { userId, serviceId, date } = req.body;

    try {
        const newBooking = await pool.query(
            'INSERT INTO bookings (user_id, service_id, booking_date) VALUES ($1, $2, $3) RETURNING *',
            [userId, serviceId, date]
        );
        res.status(201).json(newBooking.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create booking' });
    }
};

export const getUserBookings = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.query; // Expect 'provider' or 'customer' in query params

    try {
        let query;
        let params;

        if (role === 'provider') {
            // For providers: Get bookings for services they own
            query = `
                SELECT b.*, s.title as service_name, s.price, u.name as customer_name 
                FROM bookings b
                JOIN services s ON b.service_id = s.id
                JOIN users u ON b.user_id = u.id
                WHERE s.provider_id = $1
                ORDER BY b.booking_date DESC
            `;
            params = [userId];
        } else {
            // For customers: Get their own bookings and the provider name
            query = `
                SELECT b.*, s.title as service_name, s.image_url, s.price, p.name as provider_name
                FROM bookings b
                JOIN services s ON b.service_id = s.id
                JOIN users p ON s.provider_id = p.id
                WHERE b.user_id = $1
                ORDER BY b.booking_date DESC
            `;
            params = [userId];
        }

        const bookings = await pool.query(query, params);
        res.json(bookings.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
};

export const getBookingById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT b.*, s.title as service_name, s.price, s.image_url, 
                   u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users u ON b.user_id = u.id
            WHERE b.id = $1
        `;
        const booking = await pool.query(query, [id]);

        if (booking.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking.rows[0]);
    } catch (error) {
        console.error('Error fetching booking details:', error);
        res.status(500).json({ message: 'Server error fetching booking details' });
    }
};

export const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed', 'completed', 'cancelled'

    try {
        const result = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }


        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server error updating booking status' });
    }
};

export const rateBooking = async (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;

    try {
        const result = await pool.query(
            'UPDATE bookings SET rating = $1, review = $2 WHERE id = $3 RETURNING *',
            [rating, review, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error rating booking:', error);
        res.status(500).json({ message: 'Server error rating booking' });
    }
};
