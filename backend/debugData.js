
import pool from './config/db.js';
import fs from 'fs';

const debugData = async () => {
    try {
        const services = await pool.query("SELECT * FROM services");
        const users = await pool.query("SELECT * FROM users");

        const data = JSON.stringify({ services: services.rows, users: users.rows }, null, 2);
        fs.writeFileSync('./debug_output.json', data);
        console.log('Data written to debug_output.json');

        process.exit(0);
    } catch (error) {
        console.error('Debug error:', error);
        process.exit(1);
    }
};

debugData();
