import { fetchWithTimeout, handleApiError, getEnvVar } from './utils';

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Contact Form Service using Formspree
 * Handles contact form submissions
 * Free tier: 50 submissions/month
 */
export class ContactFormService {
  private readonly formId: string | undefined;
  private readonly baseUrl = 'https://formspree.io/f';

  constructor() {
    this.formId = getEnvVar('VITE_FORMSPREE_FORM_ID');
  }

  private checkFormId(): boolean {
    if (!this.formId) {
      console.warn('Formspree form ID not configured');
      return false;
    }
    return true;
  }

  async submitForm(data: ContactFormData): Promise<boolean> {
    if (!this.checkFormId()) {
      console.error('Formspree form ID is required');
      return false;
    }

    try {
      const url = `${this.baseUrl}/${this.formId}`;
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Form submission error: ${response.status}`);
      }

      return true;
    } catch (error) {
      return handleApiError(error, 'Contact Form Service');
    }
  }

  async submitContactRequest(
    name: string,
    email: string,
    message: string,
    subject?: string
  ): Promise<boolean> {
    return this.submitForm({
      name,
      email,
      subject,
      message,
    });
  }
}

export const contactFormService = new ContactFormService();
