// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ---------- Option: mount local API routers (if your limpopo-api packages export routers)
// Example (uncomment and adjust paths if you want APIs in the same process):
// import authRouter from './limpopo-api/auth/index.js';        // example path
// import businessesRouter from './limpopo-api/businesses/index.js';
// app.use('/api/auth', authRouter);
// app.use('/api/businesses', businessesRouter);

// ---------- Default: proxy /api requests to a separate API host
// Set API_URL environment variable to your API host (https://your-api-host or http://localhost:3001)
const API_URL = process.env.API_URL || 'http://localhost:3001';

app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  logLevel: 'warn'
}));

// Serve static frontend built by Vite (default "dist" folder)
const staticPath = path.join(__dirname, 'dist'); // vite build output
app.use(express.static(staticPath));

// Catch-all: return index.html so client-side routing works
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Limpopo Connect listening on port ${PORT}`);
  console.log(`API proxy target: ${API_URL}`);
});
// Development-only diagnostics endpoint; NEVER expose in production
if (process.env.NODE_ENV !== 'production') {
  app.get('/test-secret', (req, res) => {
    res.send(`DB_USER=${process.env.DB_USER}, DB_PASSWORD=${process.env.DB_PASSWORD ? '**** loaded' : 'NOT loaded'}`);
  });
}
