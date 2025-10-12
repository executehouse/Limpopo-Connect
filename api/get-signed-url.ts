/**
 * Vercel Serverless API Route: Generate Signed URLs for Supabase Storage
 * 
 * Purpose: Server-side endpoint to generate time-limited signed URLs for private storage objects
 * Security: Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS (server-side only!)
 * 
 * Usage: GET /api/get-signed-url?key=path/to/object&expiresIn=60
 * Response: { url: "https://...signed-url..." } or { error: "..." }
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Extract query parameters
  const { key, expiresIn } = req.query;

  // Validate required parameter: key
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ 
      error: 'Missing or invalid "key" query parameter. Usage: ?key=path/to/file' 
    });
  }

  // Validate optional parameter: expiresIn (default to 60 seconds)
  const expirySeconds = expiresIn && typeof expiresIn === 'string' 
    ? parseInt(expiresIn, 10) 
    : 60;

  if (isNaN(expirySeconds) || expirySeconds < 1 || expirySeconds > 3600) {
    return res.status(400).json({ 
      error: 'Invalid "expiresIn" parameter. Must be between 1 and 3600 seconds.' 
    });
  }

  // Get Supabase credentials from environment
  // Support both VITE_ prefixed (frontend) and non-prefixed (backend) env vars
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate environment variables
  if (!supabaseUrl) {
    console.error('[get-signed-url] Missing SUPABASE_URL or VITE_SUPABASE_URL');
    return res.status(500).json({ 
      error: 'Server configuration error: Supabase URL not configured' 
    });
  }

  if (!supabaseServiceKey) {
    console.error('[get-signed-url] Missing SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ 
      error: 'Server configuration error: Service role key not configured' 
    });
  }

  try {
    // Create Supabase admin client with service role key
    // ⚠️ This client bypasses RLS - use with caution!
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract bucket name and file path from key
    // Expected format: "bucket-name/path/to/file.ext" or just "path/to/file.ext"
    const pathParts = key.split('/');
    const bucketName = pathParts.length > 1 ? pathParts[0] : 'user-uploads';
    const filePath = pathParts.length > 1 ? pathParts.slice(1).join('/') : key;

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expirySeconds);

    if (error) {
      console.error('[get-signed-url] Supabase error:', error);
      return res.status(400).json({ 
        error: `Failed to generate signed URL: ${error.message}` 
      });
    }

    if (!data || !data.signedUrl) {
      return res.status(500).json({ 
        error: 'No signed URL returned from Supabase' 
      });
    }

    // Return signed URL
    return res.status(200).json({ 
      url: data.signedUrl,
      expiresIn: expirySeconds,
      key: key
    });

  } catch (error) {
    console.error('[get-signed-url] Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error while generating signed URL',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Environment Variables Required:
 * - VITE_SUPABASE_URL or SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (bypasses RLS - keep secret!)
 * 
 * Example Usage:
 * GET /api/get-signed-url?key=avatars/user-123.jpg
 * GET /api/get-signed-url?key=user-uploads/avatars/user-123.jpg&expiresIn=300
 * 
 * Security Notes:
 * - Service role key bypasses ALL Row Level Security policies
 * - Only use this endpoint for authorized requests
 * - Consider adding authentication middleware to verify the requesting user
 * - Never expose SUPABASE_SERVICE_ROLE_KEY to frontend code
 * - If service role key was ever exposed, rotate it immediately in Supabase dashboard
 */
