const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // if you use DB

const app = express();
const port = process.env.PORT || 8080;

// ---- Serve API route example ----
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---- (Optional) DB route example ----
// const pool = new Pool({ /* read from env */ });
// app.get('/api/time', async (req, res) => {
//   const { rows } = await pool.query('SELECT NOW()');
//   res.json(rows[0]);
// });

// ---- Serve React static assets ----
const buildPath = path.join(__dirname, 'build'); // React build output
app.use(express.static(buildPath));

// For SPA client-side routing: return index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => console.log(`Listening on ${port}`));
// server.js — minimal Express server that listens on process.env.PORT
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// serve static files if you have a frontend build in /public or /build
app.use(express.static('public')); // change to 'build' if you built React

app.get('/health', (req, res) => res.send('OK'));
app.get('/', async (req, res) => {
  res.send('Hello from Limpopo Connect Node app!');
});

app.listen(port, () => console.log(`App listening on port ${port}`));
