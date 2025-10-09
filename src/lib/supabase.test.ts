import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

describe('Supabase Connection', () => {
  let supabase: ReturnType<typeof createClient> | null = null;

  beforeAll(() => {
    // Only initialize if credentials are provided
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  });

  it('should have environment variables configured', () => {
    expect(SUPABASE_URL).toBeDefined();
    expect(SUPABASE_ANON_KEY).toBeDefined();
    expect(SUPABASE_URL).toContain('supabase.co');
    expect(SUPABASE_URL).toMatch(/^https:\/\//);
  });

  it('should create a Supabase client successfully', () => {
    expect(supabase).not.toBeNull();
    expect(supabase).toBeDefined();
  });

  it('should connect to Supabase auth service', async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase.auth.getSession();
    
    // Either no error, or error is about no session (which is fine)
    if (error) {
      expect(error.message).toMatch(/session/i);
    } else {
      // Success - no error
      expect(error).toBeNull();
    }
  });

  it('should be able to query the profiles table', async () => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // The query should not fail completely
    // It's okay if there are no rows, but the table should exist
    if (error) {
      // If there's an error, it shouldn't be a connection error
      expect(error.message).not.toMatch(/connection/i);
      expect(error.message).not.toMatch(/network/i);
      expect(error.message).not.toMatch(/timeout/i);
    }
  });

  it('should have valid URL format', () => {
    if (SUPABASE_URL) {
      const url = new URL(SUPABASE_URL);
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toContain('supabase.co');
    }
  });

  it('should have valid anon key format (JWT)', () => {
    if (SUPABASE_ANON_KEY) {
      // JWT tokens have 3 parts separated by dots
      const parts = SUPABASE_ANON_KEY.split('.');
      expect(parts).toHaveLength(3);
      
      // First part should be the header (base64 encoded)
      expect(parts[0]).toMatch(/^eyJ/); // JWT headers typically start with eyJ
    }
  });
});
