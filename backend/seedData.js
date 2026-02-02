import { query } from './config/db.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
    try {
        console.log('🌱 Seeding database...');

        // 1. Create Provider
        const passwordHash = await bcrypt.hash('password123', 10);
        let provider = await query('SELECT * FROM users WHERE email = ?', ['provider@example.com']);

        if (provider.rows.length === 0) {
            console.log('Creating provider...');
            provider = await query(
                'INSERT INTO users (name, email, password, role, is_available, is_onboarded) VALUES (?, ?, ?, ?, 1, 1) RETURNING *',
                ['John Provider', 'provider@example.com', passwordHash, 'provider']
            );
            // SQLite wrapper might not handle RETURNING in all cases effectively if it mimics simple sqlite3,
            // but our wrapper tries. If it fails, we fetch.
            if (!provider.rows || provider.rows.length === 0) {
                provider = await query('SELECT * FROM users WHERE email = ?', ['provider@example.com']);
            }
        } else {
            console.log('Provider already exists.');
        }
        const providerId = provider.rows[0].id;

        // 2. Create Service
        let service = await query('SELECT * FROM services WHERE provider_id = ?', [providerId]);
        if (service.rows.length === 0) {
            console.log('Creating service...');
            await query(
                'INSERT INTO services (provider_id, title, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                [providerId, 'Home Cleaning', 'Full house cleaning', 100.00, 'Cleaning', 'https://via.placeholder.com/150']
            );
            service = await query('SELECT * FROM services WHERE provider_id = ?', [providerId]);
        } else {
            console.log('Service already exists.');
        }
        const serviceId = service.rows[0].id;

        // 3. Create Customer
        let customer = await query('SELECT * FROM users WHERE email = ?', ['customer@example.com']);
        if (customer.rows.length === 0) {
            console.log('Creating customer...');
            await query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Jane Customer', 'customer@example.com', passwordHash, 'customer']
            );
            customer = await query('SELECT * FROM users WHERE email = ?', ['customer@example.com']);
        } else {
            console.log('Customer already exists.');
        }
        const customerId = customer.rows[0].id;

        // 4. Create Booking
        const bookings = await query('SELECT * FROM bookings WHERE user_id = ? AND service_id = ?', [customerId, serviceId]);
        if (bookings.rows.length === 0) {
            console.log('Creating booking...');
            const today = new Date().toISOString().split('T')[0];
            await query(
                'INSERT INTO bookings (user_id, service_id, booking_date, status) VALUES (?, ?, ?, ?)',
                [customerId, serviceId, today, 'pending']
            );
        } else {
            console.log('Booking already exists.');
        }

        // 5. Create Payment
        const payments = await query('SELECT * FROM payments WHERE user_id = ?', [customerId]);
        if (payments.rows.length === 0) {
            console.log('Creating sample payment...');
            const existingBookings = await query('SELECT id FROM bookings WHERE user_id = ?', [customerId]);
            if (existingBookings.rows.length > 0) {
                const bookingId = existingBookings.rows[0].id;
                await query(
                    'INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [bookingId, customerId, 105.00, 'Visa •••• 4242', 'TXN_SEED_999', 'completed']
                );
                // Also update that booking to confirmed
                await query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', bookingId]);
            }
        } else {
            console.log('Payment data already exists.');
        }

        console.log('✅ Seeding completed!');
        console.log(`   Provider ID: ${providerId}`);
        console.log(`   Customer ID: ${customerId}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
