import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const clearAllData = async () => {
    try {
        console.log('🗑️  Clearing all data from database...');

        // Delete in correct order (respect foreign keys)
        await pool.query('DELETE FROM bookings');
        console.log('✅ Cleared all bookings');

        await pool.query('DELETE FROM services');
        console.log('✅ Cleared all services');

        await pool.query('DELETE FROM users');
        console.log('✅ Cleared all users');

        console.log('\n🎉 Database is now clean!');
        console.log('📝 You can now create fresh accounts and data.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing database:', err.message);
        process.exit(1);
    }
};

clearAllData();
