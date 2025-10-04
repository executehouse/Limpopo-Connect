export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateName = (name: string): boolean => {
  return Boolean(name) && name.trim().length >= 2 && name.trim().length <= 100;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>"']/g, '');
};

export const validateBusinessName = (name: string): boolean => {
  return Boolean(name) && name.trim().length >= 2 && name.trim().length <= 200;
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validatePhone = (phone: string): boolean => {
  // Simple phone validation - numbers, spaces, dashes, plus, parentheses
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateMimeType = (mimeType: string, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): boolean => {
  return allowedTypes.includes(mimeType);
};