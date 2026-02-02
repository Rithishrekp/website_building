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
            // For customers: Get their own bookings
            query = `
                SELECT b.*, s.title as service_name, s.image_url 
                FROM bookings b
                JOIN services s ON b.service_id = s.id
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

export const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed', 'cancelled', 'completed'

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const result = await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(result.rows[0]); // SQLite wrapper checks if returning is supported or faked
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update booking status' });
    }
};

export const getBookingDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT b.*, s.title as service_name, s.price, 
                   u.name as customer_name, u.email as customer_email, u.phone as customer_phone, u.address as customer_address
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
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch booking details' });
    }
};
