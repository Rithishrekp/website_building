import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a local file for the database
const dbPath = path.resolve(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
    }
});

// Wrapper to mimic pg's pool.query
export const query = (text, params = []) => {
    return new Promise((resolve, reject) => {
        // Convert Postgres $1, $2 syntax to SQLite ? syntax
        const sqliteQuery = text.replace(/\$\d+/g, '?');

        // Determine if it's a query that returns rows (SELECT or RETURNING)
        const isSelect = /^\s*(SELECT|INSERT|UPDATE|DELETE).*RETURNING/i.test(text) || /^\s*SELECT/i.test(text);

        if (isSelect) {
            db.all(sqliteQuery, params, (err, rows) => {
                if (err) {
                    console.error('Query error:', err.message, sqliteQuery);
                    reject(err);
                } else {
                    resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
                }
            });
        } else {
            // For non-returning INSERT/UPDATE/DELETE
            db.run(sqliteQuery, params, function (err) {
                if (err) {
                    console.error('Query error:', err.message, sqliteQuery);
                    reject(err);
                } else {
                    // 'this' contains lastID and changes
                    resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
                }
            });
        }
    });
};

export default { query };

