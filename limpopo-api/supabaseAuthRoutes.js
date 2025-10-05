const express = require('express');
const { supabase, requireSupabase } = require('./src/lib/supabaseClient.js');

const router = express.Router();

function ensureSupabase(req, res) {
  if (!supabase) {
    return res.status(501).json({ error: 'Supabase auth not configured (missing SUPABASE_URL / SUPABASE_ANON_KEY)' });
  }
  return true;
}

// Registration via Supabase Auth
router.post('/supabase/register', async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ user: data.user, message: 'Registration initiated. Check email for confirmation if enabled.' });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error', details: e.message });
  }
});

// Login via Supabase Auth
router.post('/supabase/login', async (req, res) => {
  if (!ensureSupabase(req, res)) return;
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    return res.status(200).json({ user: data.user, session: data.session });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error', details: e.message });
  }
});

// Middleware example for protecting routes with Supabase JWT
async function supabaseAuthMiddleware(req, res, next) {
  if (!supabase) return res.status(501).json({ error: 'Supabase auth not configured' });
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Invalid token' });
  req.supabaseUser = data.user;
  return next();
}

// Example protected route
router.get('/supabase/me', supabaseAuthMiddleware, async (req, res) => {
  return res.json({ user: req.supabaseUser });
});

module.exports = router;
