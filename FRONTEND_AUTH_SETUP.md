# Frontend Supabase Authentication Setup

This guide explains how to set up Supabase authentication in the frontend application.

## Prerequisites

- A Supabase project (follow the setup in `SUPABASE_SETUP.md`)
- Node.js and npm installed

## Environment Setup

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase project credentials in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   You can find these values in your Supabase project dashboard:
   - Go to Project Settings > API
   - Copy the "Project URL" and "anon/public" key

## Authentication Flow

The frontend now uses Supabase authentication with the following features:

### 1. Registration
- New users sign up using their email and password
- Supabase handles email verification (if enabled in your project)
- After registration, users are redirected to login

### 2. Login
- Users authenticate with email and password
- Supabase manages the session with access and refresh tokens
- Session is automatically persisted and refreshed

### 3. Session Management
- The `AuthContext` automatically tracks the user's authentication state
- Session tokens are stored securely by Supabase client
- Protected routes can check `user` from `useAuth()` hook

### 4. Sign Out
- Users can sign out from the header navigation
- Supabase clears the session automatically

## Using Authentication in Components

Import the `useAuth` hook to access authentication state:

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, session, signIn, signUp, signOut, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Protected Routes

To create protected routes, check the `user` state:

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

## API Calls with Authentication

When making authenticated API calls, use the session token:

```tsx
import { supabase } from '../lib/supabaseClient';

async function makeAuthenticatedRequest() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('/api/protected-endpoint', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  
  return response.json();
}
```

## Supabase Configuration

The Supabase client is configured in `src/lib/supabaseClient.ts` with:
- Project URL from `VITE_SUPABASE_URL`
- Anon/public key from `VITE_SUPABASE_ANON_KEY`

These environment variables are prefixed with `VITE_` to be accessible in the Vite-powered frontend.

## Troubleshooting

### Issue: Authentication not working
- Verify that `.env.local` exists and contains valid Supabase credentials
- Check that the Supabase project is not paused
- Verify email confirmation is disabled (or confirm the email) in Supabase settings

### Issue: Session not persisting
- Supabase automatically persists sessions to localStorage
- Check browser console for any errors
- Verify that localStorage is not blocked by browser settings

### Issue: CORS errors
- Supabase automatically handles CORS for your project URL
- If using a custom domain, add it to Supabase project settings

## Migration from Legacy Auth

The legacy custom JWT authentication endpoints (`/api/auth/login`, `/api/auth/signup`) are still available in the backend but are no longer used by the frontend. The frontend now uses Supabase authentication directly.

If you need to support both authentication methods temporarily, you can:
1. Keep the backend endpoints as-is
2. Update the frontend to use Supabase
3. Migrate existing users to Supabase Auth
4. Remove the legacy endpoints once migration is complete

## Next Steps

- Enable email verification in Supabase project settings
- Configure custom email templates for registration/reset password
- Add social authentication providers (Google, GitHub, etc.)
- Implement Row Level Security (RLS) policies in Supabase
