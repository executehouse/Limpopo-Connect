import request from 'supertest';
import express from 'express';

// Conditionally run tests only if Supabase env vars are set
const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;

const app = express();
app.use(express.json());

// Mount the router directly
const supabaseRouter = require('../../supabaseAuthRoutes');
app.use('/api/auth', supabaseRouter);

const describeFn = hasSupabase ? describe : describe.skip;

describeFn('Supabase Auth Routes (conditional)', () => {
  test('returns 400 when missing fields on register', async () => {
    const res = await request(app).post('/api/auth/supabase/register').send({ email: 'user@example.com' });
    if (!hasSupabase) {
      expect(res.status).toBe(501);
    } else {
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    }
  });

  test('returns 400 when missing fields on login', async () => {
    const res = await request(app).post('/api/auth/supabase/login').send({ email: 'user@example.com' });
    if (!hasSupabase) {
      expect(res.status).toBe(501);
    } else {
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    }
  });
});