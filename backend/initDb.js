import { query } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const createTablesQuery = `
  -- Users Table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    is_available INTEGER DEFAULT 0, -- Store as 0 (false) or 1 (true)
    is_onboarded INTEGER DEFAULT 0,
    phone VARCHAR(20),
    address TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Services Table (Linked to a Provider)
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Bookings Table
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    booking_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Payments Table
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER REFERENCES bookings(id),
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const initDb = async () => {
  try {
    console.log('Initializing SQLite database...');

    // Split queries by semicolon to run them sequentially (SQLite exec doesn't support multiple stats well in all drivers, but let's try separate calls)
    // Actually our wrapper handles one query. We can pass the whole block to some drivers, 
    // but better split it to be safe or run individually.
    // However, our wrapper does specific regex checks.
    // Let's just run the block. sqlite3's db.exec is what we want for scripts, but our wrapper uses db.all/run.
    // Let's use simpler approach: split by ; and run non-empty chunks.

    const queries = createTablesQuery.split(';').filter(q => q.trim().length > 0);

    for (const q of queries) {
      await query(q);
    }

    console.log("✅ Tables created successfully!");
    console.log("   - Users table created");
    console.log("   - Services table created");
    console.log("   - Bookings table created");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  }
};

initDb();
