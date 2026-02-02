
import pool from './config/db.js';

const addServices = async () => {
    try {
        console.log('Adding more services...');

        // 1. Get a provider (we'll use the first one we find, or specifically ID 3 if we want)
        // For simplicity, let's just get the first provider
        const providerRes = await pool.query("SELECT id FROM users WHERE role = 'provider' LIMIT 1");

        if (providerRes.rows.length === 0) {
            console.error('No provider found to assign services to. Please run seedData.js first.');
            process.exit(1);
        }

        const providerId = providerRes.rows[0].id;
        console.log(`Assigning services to provider ID: ${providerId}`);

        const services = [
            {
                title: 'Kitchen Cleaning',
                description: 'Deep cleaning of all kitchen surfaces, appliances, and floors.',
                category: 'Cleaning',
                price: 120,
                image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&h=400&fit=crop'
            },
            {
                title: 'Bathroom Cleaning',
                description: 'Scrubbing and sanitizing of toilets, showers, tubs, and sinks.',
                category: 'Cleaning',
                price: 90,
                image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=400&fit=crop'
            },
            {
                title: 'Plumbing',
                description: 'Leak repairs, pipe installation, and general plumbing maintenance.',
                category: 'Maintenance',
                price: 150,
                image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop'
            }
        ];

        for (const service of services) {
            // Check if service exists
            const existing = await pool.query('SELECT id FROM services WHERE title = $1', [service.title]);
            if (existing.rows.length > 0) {
                console.log(`Service "${service.title}" already exists.`);
                continue;
            }

            await pool.query(
                `INSERT INTO services (provider_id, title, description, category, price, image_url)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [providerId, service.title, service.description, service.category, service.price, service.image_url]
            );
            console.log(`Added service: ${service.title}`);
        }

        console.log('✅ Services added successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error adding services:', error);
        process.exit(1);
    }
};

addServices();
