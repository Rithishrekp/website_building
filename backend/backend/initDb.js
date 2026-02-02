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

const createTablesQuery = `
  -- Users Table
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'provider', 'admin'
    is_available BOOLEAN DEFAULT false, -- For providers: indicates if they're currently available
    is_onboarded BOOLEAN DEFAULT false, -- For providers: indicates if they completed onboarding
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Services Table (Linked to a Provider)
  CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Bookings Table
  CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_id INTEGER REFERENCES services(id),
    booking_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const initDb = async () => {
  try {
    console.log(`Connecting to database: ${process.env.DB_NAME}...`);
    // Connect to the default postgres database first to check/create the target database
    const rootPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: 'postgres',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    try {
      const res = await rootPool.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
      if (res.rowCount === 0) {
        console.log(`Database '${process.env.DB_NAME}' does not exist. Creating it...`);
        await rootPool.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
        console.log(`Database '${process.env.DB_NAME}' created.`);
      }
    } catch (e) {
      console.log("Could not check/create database (might already exist or permission denied). Proceeding...");
    }
    await rootPool.end();

    // Now connect to the actual database
    await pool.query(createTablesQuery);
    console.log("✅ Tables created successfully!");
    console.log("   - Users table created");
    console.log("   - Services table created (with provider_id)");
    console.log("   - Bookings table created");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error initializing database:", err.message);
    process.exit(1);
  }
};

initDb();
