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

const updateSchema = async () => {
    try {
        console.log("Updating database schema...");

        // Add is_available column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_available') THEN 
                    ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT false; 
                END IF;
            END $$;
        `);

        // Add is_onboarded column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_onboarded') THEN 
                    ALTER TABLE users ADD COLUMN is_onboarded BOOLEAN DEFAULT false; 
                END IF;
            END $$;
        `);

        // Add phone column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN 
                    ALTER TABLE users ADD COLUMN phone VARCHAR(20); 
                END IF;
            END $$;
        `);

        // Add address column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN 
                    ALTER TABLE users ADD COLUMN address TEXT; 
                END IF;
            END $$;
        `);


        // Add rating column to bookings if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='rating') THEN 
                    ALTER TABLE bookings ADD COLUMN rating INTEGER; 
                END IF;
            END $$;
        `);

        // Add review column to bookings if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='review') THEN 
                    ALTER TABLE bookings ADD COLUMN review TEXT; 
                END IF;
            END $$;
        `);

        console.log("✅ Schema updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating schema:", err.message);
        process.exit(1);
    }
};

updateSchema();
