require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { requireSupabase, requireSupabaseAdmin } = require('./src/lib/supabaseClient.js');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

app.use(cors());
app.use(bodyParser.json());

// Supabase Auth routes (prefixed)
try {
  const supabaseAuthRouter = require('./supabaseAuthRoutes');
  app.use('/api/auth', supabaseAuthRouter);
} catch (e) {
  console.warn('Supabase auth router load failed:', e.message);
}

// Legacy Signup endpoint (to be deprecated)
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const allowedRoles = ['citizen', 'business_owner', 'visitor'];
  const userRole = role && allowedRoles.includes(role) ? role : 'citizen';

  try {
    const hashedPassword = await argon2.hash(password);
    const id = uuidv4();

    const supabase = requireSupabaseAdmin();
    const { data, error } = await supabase
      .from('users')
      .insert({ id, name, email, password_hash: hashedPassword, role: userRole })
      .select('id, email, name, role')
      .single();
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A user with this email already exists.' });
      }
      throw error;
    }
    res.status(201).json({ message: 'User created successfully', user: data });
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
    const supabase = requireSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isPasswordCorrect = await argon2.verify(user.password_hash, password);

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
      accessToken: token, // For compatibility with frontend expecting accessToken
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


// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // Respond kindly, but don't reveal if the user exists
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    const supabase = requireSupabaseAdmin();
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_reset_token: hashedToken, password_reset_expires: resetExpires })
      .eq('email', email);
    if (updateError) throw updateError;

    // In a real app, you'd email this link. For now, we just confirm.
    // The link would be something like: http://limpopoconnect.site/reset-password?token=${resetToken}
    res.status(200).json({ message: 'Password reset email sent successfully.' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const supabase = requireSupabaseAdmin();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('password_reset_token', hashedToken)
      .gt('password_reset_expires', new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword, password_reset_token: null, password_reset_expires: null })
      .eq('id', user.id);
    if (updateError) throw updateError;

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});


app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
});

module.exports = app;