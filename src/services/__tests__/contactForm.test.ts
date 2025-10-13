import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { submitContact } from '../contactForm';

// Mock environment variables
const mockEnvVars = {
  VITE_FORMSPREE_FORM_ID: 'test-form-id',
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key'
};

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({ error: null }))
  }))
};

vi.mock('../../lib/supabase', () => ({
  supabase: mockSupabaseClient
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: mockEnvVars
});

// MSW server setup
const server = setupServer();

describe('ContactForm Service', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  describe('submitContact', () => {
    const validPayload = {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message that is long enough to pass validation.'
    };

    it('successfully submits via Formspree when form ID is available', async () => {
      // Mock successful Formspree response
      server.use(
        http.post('https://formspree.io/f/test-form-id', () => {
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      const result = await submitContact(undefined, validPayload);

      expect(result).toEqual({
        success: true,
        message: 'Thank you! Your message has been sent successfully.'
      });
    });

    it('handles Formspree validation errors', async () => {
      server.use(
        http.post('https://formspree.io/f/test-form-id', () => {
          return HttpResponse.json(
            { 
              ok: false,
              errors: [{ field: 'email', message: 'Invalid email' }]
            },
            { status: 400 }
          );
        })
      );

      const result = await submitContact(undefined, validPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('error');
    });

    it('handles Formspree rate limiting with cooldown', async () => {
      server.use(
        http.post('https://formspree.io/f/test-form-id', () => {
          return HttpResponse.json(
            { error: 'Too Many Requests' },
            { status: 429 }
          );
        })
      );

      const result = await submitContact(undefined, validPayload);

      expect(result.success).toBe(false);
      expect(result.rateLimited).toBe(true);
      expect(result.message).toContain('wait');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'formspree_cooldown',
        expect.any(String)
      );
    });

    it('respects existing cooldown period', async () => {
      const cooldownUntil = Date.now() + 30 * 60 * 1000; // 30 minutes from now
      localStorageMock.getItem.mockReturnValue(cooldownUntil.toString());

      const result = await submitContact(undefined, validPayload);

      expect(result.success).toBe(false);
      expect(result.rateLimited).toBe(true);
      expect(result.cooldownUntil).toBe(cooldownUntil);
    });

    it('falls back to Supabase when Formspree fails', async () => {
      // Mock Formspree failure
      server.use(
        http.post('https://formspree.io/f/test-form-id', () => {
          return HttpResponse.json(
            { error: 'Server Error' },
            { status: 500 }
          );
        })
      );

      // Mock successful Supabase fallback
      const mockSupabaseInsert = vi.fn(() => ({ error: null }));
      mockSupabaseClient.from.mockReturnValue({
        insert: mockSupabaseInsert
      });

      const result = await submitContact(undefined, validPayload);

      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe('supabase');
      expect(result.message).toContain('received and saved');
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        name: validPayload.name,
        email: validPayload.email,
        subject: 'Contact Form Submission',
        message: validPayload.message,
        submitted_at: expect.any(String),
        source: 'website_contact_form'
      });
    });

    it('handles Supabase fallback errors gracefully', async () => {
      // Mock Formspree failure
      server.use(
        http.post('https://formspree.io/f/test-form-id', () => {
          return HttpResponse.json(
            { error: 'Server Error' },
            { status: 500 }
          );
        })
      );

      // Mock Supabase error
      mockSupabaseClient.from.mockReturnValue({
        insert: vi.fn(() => ({ error: { message: 'Database error' } }))
      });

      const result = await submitContact(undefined, validPayload);

      expect(result.success).toBe(false);
      expect(result.fallbackUsed).toBe('error');
      expect(result.message).toContain('temporarily unavailable');
    });

    it('returns structured error when no services are configured', async () => {
      // Clear environment variables
      vi.stubGlobal('import.meta', {
        env: {}
      });

      const result = await submitContact(undefined, validPayload);

      expect(result.success).toBe(false);
      expect(result.fallbackUsed).toBe('error');
      expect(result.message).toContain('temporarily unavailable');
    });

    it('validates required fields', async () => {
      const invalidPayloads = [
        { name: '', email: 'test@example.com', message: 'Valid message' },
        { name: 'Valid Name', email: '', message: 'Valid message' },
        { name: 'Valid Name', email: 'test@example.com', message: '' },
        { name: 'Valid Name', email: 'invalid-email', message: 'Valid message' }
      ];

      for (const payload of invalidPayloads) {
        const result = await submitContact(undefined, payload);
        expect(result.success).toBe(false);
        expect(result.message).toContain('required fields');
      }
    });

    it('detects honeypot spam attempts', async () => {
      const spamPayload = {
        ...validPayload,
        honeypot: 'spam-value'
      };

      const result = await submitContact(undefined, spamPayload);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Spam detection');
    });

    it('handles network timeouts', async () => {
      server.use(
        http.post('https://formspree.io/f/test-form-id', async () => {
          // Simulate timeout by delaying longer than the 10s timeout
          await new Promise(resolve => setTimeout(resolve, 11000));
          return HttpResponse.json({ ok: true });
        })
      );

      const result = await submitContact(undefined, validPayload);

      // Should fallback due to timeout
      expect(result.success).toBe(false);
    });

    it('uses custom form ID when provided', async () => {
      const customFormId = 'custom-form-id';
      
      server.use(
        http.post(`https://formspree.io/f/${customFormId}`, () => {
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      const result = await submitContact(customFormId, validPayload);

      expect(result.success).toBe(true);
    });

    it('includes subject in Formspree submission', async () => {
      const payloadWithSubject = {
        ...validPayload,
        subject: 'Custom Subject'
      };

      server.use(
        http.post('https://formspree.io/f/test-form-id', () => {
          return HttpResponse.json({ ok: true }, { status: 200 });
        })
      );

      const result = await submitContact(undefined, payloadWithSubject);
      expect(result.success).toBe(true);
    });
  });
});