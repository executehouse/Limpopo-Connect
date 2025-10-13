import { fetchWithTimeout, ApiServiceError, getEnvVar, CACHE_DURATIONS } from './utils';
import type { ContactFormData, ContactSubmissionResponse, FormspreeResponse } from './types';

// Rate limiting storage keys
const FORMSPREE_COOLDOWN_KEY = 'formspree_cooldown';
const COOLDOWN_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Enhanced Contact Form Service using Formspree with Supabase fallback
 * Handles contact form submissions with graceful degradation
 * Formspree free tier: 50 submissions/month
 */
export async function submitContact(
  formId?: string, 
  payload: Record<string, any>
): Promise<ContactSubmissionResponse> {
  const effectiveFormId = formId || getEnvVar('VITE_FORMSPREE_FORM_ID');
  
  // Check for rate limiting cooldown
  const cooldownUntil = getCooldownTime();
  if (cooldownUntil && Date.now() < cooldownUntil) {
    return {
      success: false,
      message: 'Please wait before sending another message. Try again in a few minutes.',
      rateLimited: true,
      cooldownUntil
    };
  }

  // Validate required fields
  if (!payload.name || !payload.email || !payload.message) {
    return {
      success: false,
      message: 'Please fill in all required fields (name, email, and message).'
    };
  }

  // Check for honeypot (anti-spam)
  if (payload.honeypot) {
    return {
      success: false,
      message: 'Spam detection triggered. Please try again.'
    };
  }

  // Try Formspree first if form ID is available
  if (effectiveFormId) {
    try {
      const formspreeResult = await submitToFormspree(effectiveFormId, payload);
      return formspreeResult;
    } catch (error) {
      console.warn('Formspree submission failed, trying fallback:', error);
      
      // If rate limited, set cooldown
      if (error instanceof ApiServiceError && error.status === 429) {
        setCooldown();
        return {
          success: false,
          message: 'Too many requests. Please wait 30 minutes before sending another message.',
          rateLimited: true,
          cooldownUntil: Date.now() + COOLDOWN_DURATION
        };
      }
    }
  }

  // Fallback to Supabase if available
  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
  const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
  
  if (supabaseUrl && supabaseKey) {
    try {
      const supabaseResult = await submitToSupabase(payload);
      return {
        ...supabaseResult,
        fallbackUsed: 'supabase'
      };
    } catch (error) {
      console.error('Supabase fallback failed:', error);
    }
  }

  // Final fallback - return structured error
  return {
    success: false,
    message: 'Message service temporarily unavailable. Please try again later or contact us directly via email.',
    fallbackUsed: 'error'
  };
}

async function submitToFormspree(
  formId: string, 
  payload: Record<string, any>
): Promise<ContactSubmissionResponse> {
  const url = `https://formspree.io/f/${formId}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        subject: payload.subject || 'Contact Form Submission',
        message: payload.message,
        _replyto: payload.email, // Formspree reply-to field
      }),
    }, 10000); // 10s timeout

    if (response.status === 429) {
      throw new ApiServiceError('Rate limited', 'RATE_LIMITED', 429);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiServiceError(
        errorData.error || `Formspree error: ${response.status}`,
        'FORMSPREE_ERROR',
        response.status
      );
    }

    const data: FormspreeResponse = await response.json();
    
    return {
      success: data.ok,
      message: data.ok 
        ? 'Thank you! Your message has been sent successfully.' 
        : 'There was an error sending your message. Please try again.'
    };
  } catch (error) {
    if (error instanceof ApiServiceError) {
      throw error;
    }
    throw new ApiServiceError(
      'Failed to send message via Formspree',
      'FORMSPREE_ERROR'
    );
  }
}

async function submitToSupabase(payload: Record<string, any>): Promise<ContactSubmissionResponse> {
  try {
    // Dynamically import Supabase to avoid bundle issues if not configured
    const { supabase } = await import('../lib/supabase');
    
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const contactData = {
      name: payload.name,
      email: payload.email,
      subject: payload.subject || 'Contact Form Submission',
      message: payload.message,
      submitted_at: new Date().toISOString(),
      source: 'website_contact_form'
    };

    const { error } = await supabase
      .from('contacts')
      .insert(contactData);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return {
      success: true,
      message: 'Thank you! Your message has been received and saved.'
    };
  } catch (error) {
    throw new ApiServiceError(
      'Failed to save contact via Supabase fallback',
      'SUPABASE_ERROR'
    );
  }
}

// Rate limiting helpers
function getCooldownTime(): number | null {
  const stored = localStorage.getItem(FORMSPREE_COOLDOWN_KEY);
  if (!stored) return null;
  
  const cooldownUntil = parseInt(stored, 10);
  if (isNaN(cooldownUntil) || Date.now() > cooldownUntil) {
    localStorage.removeItem(FORMSPREE_COOLDOWN_KEY);
    return null;
  }
  
  return cooldownUntil;
}

function setCooldown(): void {
  const cooldownUntil = Date.now() + COOLDOWN_DURATION;
  localStorage.setItem(FORMSPREE_COOLDOWN_KEY, cooldownUntil.toString());
}

// Legacy compatibility - keep the existing class for backwards compatibility
export class ContactFormService {
  async submitForm(data: ContactFormData): Promise<boolean> {
    const result = await submitContact(undefined, data);
    return result.success;
  }

  async submitContactRequest(
    name: string,
    email: string,
    message: string,
    subject?: string
  ): Promise<boolean> {
    return this.submitForm({ name, email, subject, message });
  }
}

export const contactFormService = new ContactFormService();
