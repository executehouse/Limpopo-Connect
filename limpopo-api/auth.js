const express = require('express');
const bodyParser = require('body-parser');
const { query } = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

app.use(bodyParser.json());

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const result = await query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role',
      [id, name, email, hashedPassword, 'resident']
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') { // unique_violation for email
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
});

module.exports = app;