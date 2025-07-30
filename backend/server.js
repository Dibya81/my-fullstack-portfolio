// Forcing a new deploy on Render
// server.js

// --- Import required modules ---
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client

// --- Initialize Express app ---
const app = express();
// Use the port provided by the hosting environment (like Render), or 3000 for local development
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- PostgreSQL Database Connection ---
// This code securely connects using a connection URL provided by Render.
// It will look for an environment variable called DATABASE_URL.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // This is required for Render's database connections
    }
});

// --- API Routes ---

/**
 * @route   POST /api/contact
 * @desc    Receive contact form submission and save to PostgreSQL
 * @access  Public
 */
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // SQL query to insert the data into the 'contacts' table
    const insertQuery = `
        INSERT INTO contacts (name, email, message)
        VALUES ($1, $2, $3)
        RETURNING id;
    `;

    try {
        // Execute the query with the form data
        const result = await pool.query(insertQuery, [name, email, message]);
        console.log(`--- New contact saved to database with ID: ${result.rows[0].id} ---`);
        res.status(200).json({ message: 'Thank you! Your message has been received.' });
    } catch (error) {
        console.error('Database insertion error:', error);
        res.status(500).json({ message: 'Failed to save message. Please try again later.' });
    }
});

/**
 * @route   GET /api/contacts
 * @desc    Retrieve all contact submissions from the database
 * @access  Private (for you to view)
 */
app.get('/api/contacts', async (req, res) => {
    try {
        // Execute the query to get all contacts, ordered by newest first
        const result = await pool.query('SELECT id, name, email, message, submitted_at FROM contacts ORDER BY submitted_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Failed to retrieve contacts.' });
    }
});


// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
