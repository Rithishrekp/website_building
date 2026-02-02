
import pool from './config/db.js';

const checkServices = async () => {
    try {
        console.log('Checking services table...');
        const res = await pool.query("SELECT * FROM services");
        console.log('Services:', res.rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking services:', error);
        process.exit(1);
    }
};

checkServices();
