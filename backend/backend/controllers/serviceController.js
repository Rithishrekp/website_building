import pool from '../config/db.js';

export const getAllServices = async (req, res) => {
    try {
        // Only fetch services where the provider is available and has recently confirmed availability
        const query = `
            SELECT s.*, u.name as provider_name, u.is_available 
            FROM services s 
            JOIN users u ON s.provider_id = u.id 
            WHERE u.is_available = true
        `;
        const services = await pool.query(query);
        res.json(services.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch services' });
    }
};

export const createService = async (req, res) => {
    const { title, description, price, category, imageUrl, providerId } = req.body;

    try {
        const newService = await pool.query(
            'INSERT INTO services (title, description, price, category, image_url, provider_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, price, category, imageUrl, providerId]
        );
        res.status(201).json(newService.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create service' });
    }
};

export const getCategorizedServices = async (req, res) => {
    try {
        const query = `
            SELECT s.*, u.name as provider_name, u.is_available 
            FROM services s 
            JOIN users u ON s.provider_id = u.id 
            WHERE u.is_available = true
        `;
        const result = await pool.query(query);
        const services = result.rows;

        const categorized = services.reduce((acc, service) => {
            const cat = service.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(service);
            return acc;
        }, {});

        res.json(categorized);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch categorized services' });
    }
};

export const getServiceById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT s.*, u.name as provider_name, u.is_available as provider_available,
            (SELECT AVG(rating)::numeric(10,1) FROM bookings b JOIN services s2 ON b.service_id = s2.id WHERE s2.provider_id = u.id AND b.rating IS NOT NULL) as provider_rating
            FROM services s
            JOIN users u ON s.provider_id = u.id
            WHERE s.id = $1::integer
        `;
        const service = await pool.query(query, [id]);
        if (service.rows.length === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch service' });
    }
};
