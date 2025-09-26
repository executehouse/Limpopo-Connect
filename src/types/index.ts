// Authentication types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role: UserRole;
  profile?: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  location?: Location;
  preferences?: UserPreferences;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: 'en' | 'sepedi' | 'tshivenda' | 'xitsonga';
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export const UserRole = {
  USER: 'user',
  BUSINESS_OWNER: 'business_owner',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Location types
export interface Location {
  id?: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Business types
export interface Business {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  subcategory?: string;
  location: Location;
  contact: ContactInfo;
  operatingHours: OperatingHours;
  images: string[];
  services: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  email?: string;
  phone: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export const BusinessCategory = {
  RESTAURANT: 'restaurant',
  ACCOMMODATION: 'accommodation',
  RETAIL: 'retail',
  SERVICES: 'services',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  TOURISM: 'tourism',
  ARTS_CULTURE: 'arts_culture',
  AGRICULTURE: 'agriculture',
  TECHNOLOGY: 'technology',
  OTHER: 'other'
} as const;

export type BusinessCategory = typeof BusinessCategory[keyof typeof BusinessCategory];

// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  location: Location;
  startDate: Date;
  endDate?: Date;
  startTime: string;
  endTime?: string;
  organizer: EventOrganizer;
  images: string[];
  ticketInfo?: TicketInfo;
  attendeeCount: number;
  maxAttendees?: number;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventOrganizer {
  id: string;
  name: string;
  contact: ContactInfo;
}

export interface TicketInfo {
  isFree: boolean;
  price?: number;
  currency: string;
  bookingUrl?: string;
}

export const EventCategory = {
  CULTURAL: 'cultural',
  BUSINESS: 'business',
  EDUCATION: 'education',
  ENTERTAINMENT: 'entertainment',
  SPORTS: 'sports',
  COMMUNITY: 'community',
  GOVERNMENT: 'government',
  OTHER: 'other'
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];

// Review types
export interface Review {
  id: string;
  userId: string;
  businessId?: string;
  eventId?: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}