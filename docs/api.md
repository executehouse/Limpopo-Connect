# Limpopo Connect API Documentation

## Authentication Endpoints

### Sign Up
**POST** `/auth/sign-up`
```typescript
interface SignUpRequest {
  email: string;
  password: string;
  metadata: {
    first_name: string;
    last_name: string;
    phone?: string;
    role?: 'citizen' | 'business_owner' | 'visitor';
  }
}
```

### Sign In
**POST** `/auth/sign-in`
```typescript
interface SignInRequest {
  email: string;
  password: string;
}
```

### Password Reset
**POST** `/auth/reset-password`
```typescript
interface ResetPasswordRequest {
  email: string;
}
```

## Profiles

### Get Profile
**GET** `/profiles/{id}`
- Requires authentication
- Returns user profile information

### Update Profile
**PATCH** `/profiles/{id}`
```typescript
interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  is_public?: boolean;
}
```

## Error Handling

All API endpoints follow a consistent error format:

```typescript
interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
}
```

Common error codes:
- `AUTH_INVALID_CREDENTIALS`: Invalid email/password combination
- `AUTH_EMAIL_NOT_VERIFIED`: Email verification required
- `PROFILE_NOT_FOUND`: Requested profile does not exist
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

- Authentication endpoints: 20 requests per minute
- Profile endpoints: 60 requests per minute
- Other endpoints: 100 requests per minute

## Security

All endpoints:
- Require HTTPS
- Implement CORS protection
- Use JWT authentication
- Apply rate limiting
- Log security-relevant events

## Environment Variables

Required environment variables for API configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Security

All database access is protected by Row Level Security (RLS) policies:

### Profiles Table
```sql
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## API Client Usage

Example usage of the API client:

```typescript
import { signInWithPassword, signUpWithEmail, SupabaseError } from '@/lib/supabase';

try {
  // Sign in
  const { data: { user }, error } = await signInWithPassword(email, password);
  
  // Handle success
  console.log('Signed in as:', user.email);
} catch (error) {
  if (error instanceof SupabaseError) {
    // Handle specific error cases
    switch (error.code) {
      case 'AUTH_INVALID_CREDENTIALS':
        console.error('Invalid email or password');
        break;
      case 'AUTH_RATE_LIMIT_EXCEEDED':
        console.error('Too many attempts, please try again later');
        break;
      default:
        console.error('An unexpected error occurred:', error.message);
    }
  }
}
```

## Webhook Integration

The API supports webhooks for the following events:
- User signup
- Profile updates
- Business listing changes
- Event creation/updates

To register a webhook, contact the system administrator with:
1. The event type you want to subscribe to
2. The endpoint URL that will receive the webhook
3. A secret key for webhook signature verification

## Testing

For testing the API endpoints, use the provided test suite:

```bash
npm run test:api
```

This will run integration tests against a test database.

## Support

For API support:
- Email: api-support@limpopoconnect.site
- Documentation: https://docs.limpopoconnect.site/api
- Status page: https://status.limpopoconnect.site