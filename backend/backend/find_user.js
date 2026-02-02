
import pool from './config/db.js';
const res = await pool.query('SELECT * FROM users WHERE role = \'customer\' LIMIT 1');
console.log(JSON.stringify(res.rows[0]));
process.exit();
