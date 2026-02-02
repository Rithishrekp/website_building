
import pool from './config/db.js';
try {
    const res = await pool.query('SELECT * FROM services');
    console.log(JSON.stringify(res.rows, null, 2));
} catch (err) {
    console.error(err);
}
process.exit();
