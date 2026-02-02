
import pool from './config/db.js';

const checkUsers = async () => {
    try {
        console.log('Checking users table...');
        const res = await pool.query("SELECT id, name, is_available FROM users WHERE role = 'provider'");
        console.log('Providers:', res.rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
};

checkUsers();
