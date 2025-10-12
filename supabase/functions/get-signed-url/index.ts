/**
 * Supabase Edge Function: Generate Signed URLs for Storage Objects
 * 
 * Purpose: Deno-based serverless function to generate time-limited signed URLs
 * Security: Runs with service role privileges (bypasses RLS)
 * Runtime: Deno (not Node.js)
 * 
 * Deploy: supabase functions deploy get-signed-url
 * Usage: POST https://<project-ref>.supabase.co/functions/v1/get-signed-url
 * Body: { "key": "path/to/file.ext", "expiresIn": 60 }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { key, expiresIn } = await req.json();

    // Validate required parameter: key
    if (!key || typeof key !== 'string') {
      return new Response(
        JSON.stringify({ 
          error: 'Missing or invalid "key" parameter. Expected: { "key": "path/to/file" }' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate optional parameter: expiresIn (default to 60 seconds)
    const expirySeconds = typeof expiresIn === 'number' ? expiresIn : 60;

    if (expirySeconds < 1 || expirySeconds > 3600) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid "expiresIn" parameter. Must be between 1 and 3600 seconds.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[get-signed-url] Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Supabase credentials not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase admin client
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
      return new Response(
        JSON.stringify({ 
          error: `Failed to generate signed URL: ${error.message}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!data || !data.signedUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'No signed URL returned from Supabase' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return signed URL
    return new Response(
      JSON.stringify({ 
        url: data.signedUrl,
        expiresIn: expirySeconds,
        key: key
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[get-signed-url] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error while generating signed URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Deployment Instructions:
 * 
 * 1. Install Supabase CLI:
 *    npm install -g supabase
 * 
 * 2. Login to Supabase:
 *    supabase login
 * 
 * 3. Link to your project:
 *    supabase link --project-ref sscsjwaogomktxqhvgxw
 * 
 * 4. Deploy this function:
 *    supabase functions deploy get-signed-url
 * 
 * 5. Test the function:
 *    curl -X POST https://sscsjwaogomktxqhvgxw.supabase.co/functions/v1/get-signed-url \
 *      -H "Authorization: Bearer YOUR_ANON_KEY" \
 *      -H "Content-Type: application/json" \
 *      -d '{"key": "avatars/test.jpg", "expiresIn": 60}'
 * 
 * Environment Variables (set in Supabase Dashboard):
 * - SUPABASE_URL: Automatically provided by Supabase
 * - SUPABASE_SERVICE_ROLE_KEY: Automatically provided by Supabase
 * 
 * Security Notes:
 * - This function runs with service role privileges (bypasses RLS)
 * - Consider adding authentication checks before generating signed URLs
 * - Validate that the requesting user has permission to access the resource
 * - Never expose service role key to frontend code
 */
