// Supabase Edge Function: Validate Password Strength
// Purpose: Server-side password validation before user registration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface PasswordValidationResult {
  valid: boolean
  score: number
  feedback: string[]
  errors: string[]
}

/**
 * Validate password strength based on multiple criteria
 */
function validatePassword(password: string): PasswordValidationResult {
  const result: PasswordValidationResult = {
    valid: true,
    score: 0,
    feedback: [],
    errors: []
  }

  // Check minimum length
  if (password.length < 8) {
    result.valid = false
    result.errors.push('Password must be at least 8 characters long')
  } else if (password.length >= 12) {
    result.score += 2
    result.feedback.push('Good length')
  } else {
    result.score += 1
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    result.score += 1
    result.feedback.push('Contains uppercase letters')
  } else {
    result.errors.push('Password should contain at least one uppercase letter')
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    result.score += 1
    result.feedback.push('Contains lowercase letters')
  } else {
    result.errors.push('Password should contain at least one lowercase letter')
  }

  // Check for numbers
  if (/\d/.test(password)) {
    result.score += 1
    result.feedback.push('Contains numbers')
  } else {
    result.errors.push('Password should contain at least one number')
  }

  // Check for special characters
  if (/[!@#$%^&*()_+=\\[\\]{};'|,.<>?-]/.test(password)) {
    result.score += 2
    result.feedback.push('Contains special characters')
  } else {
    result.feedback.push('Consider adding special characters for stronger security')
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    result.valid = false
    result.errors.push('This password is too common. Please choose a more unique password.')
    result.score = 0
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    result.feedback.push('Avoid repeating characters')
    result.score = Math.max(0, result.score - 1)
  }

  // Check for sequential numbers or letters
  if (/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    result.feedback.push('Avoid sequential characters')
    result.score = Math.max(0, result.score - 1)
  }

  // Final validation: require minimum score
  if (result.score < 4) {
    result.valid = false
    if (result.errors.length === 0) {
      result.errors.push('Password is too weak. Please make it stronger.')
    }
  }

  return result
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { password } = await req.json()

    if (!password) {
      return new Response(
        JSON.stringify({ 
          error: 'Password is required',
          valid: false 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate password
    const validation = validatePassword(password)

    // Return validation result
    return new Response(
      JSON.stringify(validation),
      { 
        status: validation.valid ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Password validation error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        valid: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
