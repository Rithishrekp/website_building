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

const addSampleServices = async () => {
    try {
        console.log('📦 Adding sample services...\n');

        // First, check if there are any providers
        const providers = await pool.query("SELECT id, name FROM users WHERE role = 'provider'");

        if (providers.rows.length === 0) {
            console.log('⚠️  No providers found in database!');
            console.log('📝 Please create a provider account first:');
            console.log('   1. Go to http://localhost:5173/signup');
            console.log('   2. Select "I provide services"');
            console.log('   3. Create an account');
            console.log('   4. Then run this script again\n');
            process.exit(0);
        }

        console.log(`✅ Found ${providers.rows.length} provider(s):\n`);
        providers.rows.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} (ID: ${p.id})`);
        });

        // Use the first provider for sample services
        const providerId = providers.rows[0].id;
        const providerName = providers.rows[0].name;

        console.log(`\n📝 Adding services for: ${providerName}\n`);

        const services = [
            {
                title: 'AC Repair & Service',
                description: 'Professional AC repair, servicing, and maintenance. Gas refilling, deep cleaning, and installation.',
                price: 499,
                category: 'Home Services',
                image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop'
            },
            {
                title: 'Home Cleaning',
                description: 'Deep cleaning service for your home. Kitchen, bathroom, living room, and bedroom cleaning.',
                price: 799,
                category: 'Home Services',
                image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'
            },
            {
                title: 'Plumbing Service',
                description: 'Expert plumbing services. Pipe repair, leak fixing, tap installation, and drainage cleaning.',
                price: 399,
                category: 'Home Services',
                image_url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop'
            },
            {
                title: 'Electrical Work',
                description: 'Licensed electrician for all electrical work. Wiring, switch installation, and repairs.',
                price: 599,
                category: 'Home Services',
                image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop'
            },
            {
                title: 'Painting Service',
                description: 'Professional painting service for interior and exterior walls. Quality finish guaranteed.',
                price: 2999,
                category: 'Home Services',
                image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop'
            }
        ];

        for (const service of services) {
            const result = await pool.query(
                'INSERT INTO services (provider_id, title, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [providerId, service.title, service.description, service.price, service.category, service.image_url]
            );
            console.log(`   ✅ Added: ${service.title} - ₹${service.price}`);
        }

        console.log(`\n🎉 Successfully added ${services.length} services!`);
        console.log(`\n📝 These services are now available for customers to book.`);
        console.log(`📝 When customers book these services, ${providerName} will see the bookings.\n`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error adding services:', err.message);
        process.exit(1);
    }
};

addSampleServices();
