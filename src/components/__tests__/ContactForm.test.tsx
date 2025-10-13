import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '../ContactForm';

// Mock the contact form service
vi.mock('@/services/contactForm', () => ({
  submitContact: vi.fn()
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ error: null }))
    }))
  }
}));

const mockSubmitContact = vi.mocked((await import('@/services/contactForm')).submitContact);

describe('ContactForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates minimum message length', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'Short');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    mockSubmitContact.mockResolvedValue({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    });
    
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(mockSubmitContact).toHaveBeenCalledWith(undefined, {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message that is long enough to pass validation.'
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });
  });

  it('handles submission errors', async () => {
    const user = userEvent.setup();
    mockSubmitContact.mockResolvedValue({
      success: false,
      message: 'An error occurred while sending your message.'
    });
    
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/an error occurred while sending your message/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    // Create a promise that we can control
    let resolveSubmit: (value: any) => void;
    const submissionPromise = new Promise(resolve => {
      resolveSubmit = resolve;
    });
    mockSubmitContact.mockReturnValue(submissionPromise);
    
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/sending.../i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sending.../i })).toBeDisabled();
    });
    
    // Resolve the promise
    resolveSubmit!({ success: true, message: 'Success!' });
    
    await waitFor(() => {
      expect(screen.queryByText(/sending.../i)).not.toBeInTheDocument();
    });
  });

  it('displays rate limit warning', async () => {
    const user = userEvent.setup();
    mockSubmitContact.mockResolvedValue({
      success: false,
      message: 'Please wait before sending another message.',
      rateLimited: true,
      cooldownUntil: Date.now() + 30 * 60 * 1000
    });
    
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/rate limit reached/i)).toBeInTheDocument();
      expect(screen.getByText(/please wait before sending another message/i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback when provided', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const successResponse = {
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    };
    
    mockSubmitContact.mockResolvedValue(successResponse);
    
    render(<ContactForm onSuccess={onSuccess} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(successResponse);
    });
  });

  it('calls onError callback when provided', async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    const errorResponse = {
      success: false,
      message: 'An error occurred while sending your message.'
    };
    
    mockSubmitContact.mockResolvedValue(errorResponse);
    
    render(<ContactForm onError={onError} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(errorResponse);
    });
  });

  it('uses custom form ID when provided', async () => {
    const user = userEvent.setup();
    const customFormId = 'custom-form-id';
    mockSubmitContact.mockResolvedValue({
      success: true,
      message: 'Success!'
    });
    
    render(<ContactForm formId={customFormId} />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(mockSubmitContact).toHaveBeenCalledWith(customFormId, expect.any(Object));
    });
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    mockSubmitContact.mockResolvedValue({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    });
    
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(subjectInput, 'Test Subject');
    await user.type(messageInput, 'This is a test message that is long enough to pass validation.');
    
    await user.click(screen.getByRole('button', { name: /send message/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
    
    // Click "Send Another Message" button
    await user.click(screen.getByRole('button', { name: /send another message/i }));
    
    // Form should be cleared
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(subjectInput.value).toBe('');
    expect(messageInput.value).toBe('');
  });

  it('has proper accessibility attributes', () => {
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    expect(nameInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('inputMode', 'email');
    expect(messageInput).toHaveAttribute('required');
    
    // Check honeypot field is properly hidden
    const honeypotInput = document.querySelector('input[name="honeypot"]');
    expect(honeypotInput).toHaveStyle({ position: 'absolute', left: '-9999px' });
    expect(honeypotInput).toHaveAttribute('tabIndex', '-1');
    expect(honeypotInput).toHaveAttribute('aria-hidden', 'true');
  });
});