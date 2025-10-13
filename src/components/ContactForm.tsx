import React, { useState, useCallback } from 'react';
import { Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { submitContact } from '@/services/contactForm';
import type { ContactFormData, ContactSubmissionResponse } from '@/services/types';

interface ContactFormProps {
  formId?: string;
  className?: string;
  onSuccess?: (response: ContactSubmissionResponse) => void;
  onError?: (response: ContactSubmissionResponse) => void;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string; // Hidden field for spam detection
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  general?: string;
}

export function ContactForm({ 
  formId, 
  className = '', 
  onSuccess, 
  onError 
}: ContactFormProps) {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState<ContactSubmissionResponse | null>(null);

  // Client-side validation
  const validateForm = useCallback((data: FormState): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!data.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (data.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    return newErrors;
  }, []);

  const handleInputChange = useCallback((
    field: keyof FormState, 
    value: string
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Log contact submission for analytics
  const logContactSubmission = useCallback(async (data: ContactFormData) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      if (!supabase) return;

      await supabase
        .from('platform_logs')
        .insert({
          event_type: 'contact_form_submission',
          event_data: {
            has_subject: Boolean(data.subject),
            message_length: data.message.length,
            source: 'ContactForm'
          },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.warn('Failed to log contact submission:', error);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setErrors({});
    setResponse(null);

    // Validate form
    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check honeypot (if filled, it's likely spam)
    if (formState.honeypot) {
      setErrors({ general: 'Spam detection triggered. Please try again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData: ContactFormData = {
        name: formState.name.trim(),
        email: formState.email.trim(),
        subject: formState.subject.trim() || 'Contact Form Submission',
        message: formState.message.trim()
      };

      const result = await submitContact(submissionData, formId);
      setResponse(result);

      if (result.success) {
        setSubmitted(true);
        // Clear form on success
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: '',
          honeypot: ''
        });

        // Log analytics to Supabase if available
        logContactSubmission(submissionData);

        onSuccess?.(result);
      } else {
        setErrors({ general: result.message });
        onError?.(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      
      setErrors({ general: errorMessage });
      setResponse({
        success: false,
        message: errorMessage
      });
      onError?.({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, formId, validateForm, onSuccess, onError, logContactSubmission]);

  // Success state
  if (submitted && response?.success) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            {response.message}
          </p>
          {response.fallbackUsed && (
            <p className="text-sm text-gray-500">
              {response.fallbackUsed === 'supabase' 
                ? 'Message saved to our backup system.' 
                : 'Backup system used.'}
            </p>
          )}
          <button
            onClick={() => {
              setSubmitted(false);
              setResponse(null);
            }}
            className="mt-4 px-4 py-2 bg-limpopo-green text-white rounded-md hover:bg-limpopo-green-dark transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
      noValidate
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
      
      {/* General error message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Rate limit warning */}
      {response?.rateLimited && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 text-sm font-medium">Rate Limit Reached</p>
            <p className="text-yellow-700 text-sm mt-1">
              Please wait before sending another message.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Name field */}
        <div>
          <label 
            htmlFor="contact-name" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name *
          </label>
          <input
            id="contact-name"
            type="text"
            value={formState.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md text-base focus:ring-2 focus:ring-limpopo-green focus:border-transparent transition-colors ${
              errors.name 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Your full name"
            required
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label 
            htmlFor="contact-email" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email *
          </label>
          <input
            id="contact-email"
            type="email"
            inputMode="email"
            value={formState.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-md text-base focus:ring-2 focus:ring-limpopo-green focus:border-transparent transition-colors ${
              errors.email 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="your.email@example.com"
            required
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject field */}
      <div className="mb-4">
        <label 
          htmlFor="contact-subject" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Subject (optional)
        </label>
        <input
          id="contact-subject"
          type="text"
          value={formState.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-limpopo-green focus:border-transparent hover:border-gray-400 transition-colors"
          placeholder="What is this about?"
        />
      </div>

      {/* Message field */}
      <div className="mb-6">
        <label 
          htmlFor="contact-message" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message *
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={formState.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
          className={`w-full px-4 py-3 border rounded-md text-base focus:ring-2 focus:ring-limpopo-green focus:border-transparent transition-colors resize-y ${
            errors.message 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          placeholder="Please tell us how we can help you..."
          required
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-red-600">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot field (hidden, for spam detection) */}
      <input
        type="text"
        name="honeypot"
        value={formState.honeypot}
        onChange={(e) => handleInputChange('honeypot', e.target.value)}
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          opacity: 0, 
          pointerEvents: 'none' 
        }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full md:w-auto px-8 py-3 rounded-md font-medium text-base transition-colors flex items-center justify-center ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-limpopo-green hover:bg-limpopo-green-dark focus:ring-2 focus:ring-limpopo-green focus:ring-offset-2'
        } text-white`}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </>
        )}
      </button>

      <p className="mt-4 text-sm text-gray-600">
        * Required fields. We'll respond within 24 hours.
      </p>
    </form>
  );
}