import jwt from 'jsonwebtoken';
import { query } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const runVerification = async () => {
    try {
        console.log('🧪 Starting Profile Update Verification...');

        // 1. Get or Create a Test Provider
        console.log('1. Finding a test provider...');
        let users = await query("SELECT * FROM users WHERE role = 'provider' LIMIT 1");

        let userId;
        if (users.rows.length === 0) {
            console.log('   - No provider found, creating one...');
            const result = await query(
                "INSERT INTO users (name, email, password, role) VALUES ('Test Provider', 'test.provider@example.com', 'hashedpass', 'provider') RETURNING id"
            );
            userId = result.rows[0].id;
        } else {
            userId = users.rows[0].id;
            console.log(`   - Found provider with ID: ${userId}`);
        }

        // 2. Generate Token
        console.log('2. Generating Auth Token...');
        const token = jwt.sign({ id: userId, role: 'provider' }, JWT_SECRET, { expiresIn: '1h' });

        // 3. Define Updates
        const updateData = {
            bio: 'This is a verified bio update at ' + new Date().toISOString(),
            phone: '+1 555-0199',
            name: 'Verified Provider Name'
        };

        // 4. Call API
        console.log('3. Calling Update API...');
        const response = await fetch(`${API_URL}/auth/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`API Error: ${data.message}`);
        }

        console.log('   - API Response:', data);

        // 5. Verify Database
        console.log('4. Verifying Database State...');
        const verifyUser = await query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = verifyUser.rows[0];

        let success = true;
        if (user.bio !== updateData.bio) {
            console.error('❌ Bio mismatch!');
            success = false;
        }
        if (user.phone !== updateData.phone) {
            console.error('❌ Phone mismatch!');
            success = false;
        }
        if (user.name !== updateData.name) {
            console.error('❌ Name mismatch!');
            success = false;
        }

        if (success) {
            console.log('✅ Verification Successful! Database matches update data.');
        } else {
            console.error('❌ Verification Failed.');
            process.exit(1);
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Verification Error:', error);
        process.exit(1);
    }
};

runVerification();
