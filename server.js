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
