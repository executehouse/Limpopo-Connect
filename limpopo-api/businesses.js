require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { query } = require('./db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

app.use(bodyParser.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // if there isn't any token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // if the token is invalid
    }
    req.user = user;
    next();
  });
};

// GET all business listings
app.get('/api/businesses', async (req, res) => {
  try {
    const result = await query('SELECT * FROM listings ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// GET a single business listing by ID
app.get('/api/businesses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM listings WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching business ${id}:`, error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// POST a new business listing (protected)
app.post('/api/businesses', authenticateToken, async (req, res) => {
  const { name, category, description, address, phone, email, website } = req.body;
  const ownerId = req.user.userId; // Get owner ID from authenticated user token

  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required.' });
  }

  try {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO listings (id, name, category, description, address, phone, email, website, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, name, category, description, address, phone, email, website, ownerId]
    );

    res.status(201).json({
      message: 'Business created successfully',
      business: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


app.listen(port, () => {
  console.log(`Business service running on port ${port}`);
});

module.exports = app;