import { query } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const updateSchema = async () => {
    try {
        console.log('Updating database schema...');

        // Add bio column to users table if it doesn't exist
        try {
            await query('ALTER TABLE users ADD COLUMN bio TEXT');
            console.log('✅ Added bio column to users table');
        } catch (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('ℹ️ bio column already exists');
            } else {
                throw err;
            }
        }

        // Add avatar_url column to users table if it doesn't exist
        try {
            await query('ALTER TABLE users ADD COLUMN avatar_url TEXT');
            console.log('✅ Added avatar_url column to users table');
        } catch (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('ℹ️ avatar_url column already exists');
            } else {
                throw err;
            }
        }

        console.log('✅ Schema update completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating schema:', err);
        process.exit(1);
    }
};

updateSchema();
