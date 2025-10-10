// API service layer for connecting to backend services
export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  imageUrl?: string;
  openingHours?: string;
  verified: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate?: string;
  location: string;
  address: string;
  organizer: string;
  contactInfo: string;
  imageUrl?: string;
  ticketPrice?: number;
  maxAttendees?: number;
  currentAttendees: number;
  tags: string[];
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  imageUrl?: string;
  tags: string[];
  isAvailable: boolean;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  source: string;
}

export interface TourismAttraction {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  priceRange: string;
  rating: number;
  imageUrl?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  features: string[];
  createdAt: string;
}

// API Base URL - defaults to current origin for production, can be overridden
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || `${window.location.origin}/api`;

// Generic API fetch wrapper
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('accessToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Check if response is JSON before parsing
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    } else {
      // If response is not JSON (e.g., HTML from a failed proxy), provide a better error
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        throw new Error('API endpoint unavailable. Please ensure the backend server is running.');
      }
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }
  }

  // Parse response as JSON only if content-type indicates JSON
  if (isJson) {
    return response.json();
  } else {
    const text = await response.text();
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
      throw new Error('API endpoint unavailable. Received HTML instead of JSON. Please ensure the backend server is running.');
    }
    throw new Error(`Expected JSON response but received: ${contentType || 'unknown content type'}`);
  }
}

// Business API
export const businessAPI = {
  getAll: async (params?: { category?: string; location?: string; search?: string }): Promise<Business[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return apiCall<Business[]>(`/businesses${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<Business> => {
    return apiCall<Business>(`/businesses/${id}`);
  },

  create: async (business: Omit<Business, 'id' | 'createdAt'>): Promise<Business> => {
    return apiCall<Business>('/businesses', {
      method: 'POST',
      body: JSON.stringify(business),
    });
  },

  update: async (id: string, business: Partial<Business>): Promise<Business> => {
    return apiCall<Business>(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(business),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/businesses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Events API
export const eventsAPI = {
  getAll: async (params?: { category?: string; startDate?: string; location?: string }): Promise<Event[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.location) searchParams.append('location', params.location);
    
    const queryString = searchParams.toString();
    return apiCall<Event[]>(`/events${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<Event> => {
    return apiCall<Event>(`/events/${id}`);
  },

  register: async (eventId: string): Promise<{ success: boolean; message: string }> => {
    return apiCall<{ success: boolean; message: string }>(`/events/${eventId}/register`, {
      method: 'POST',
    });
  },
};

// Marketplace API  
export const marketplaceAPI = {
  getAll: async (params?: { category?: string; location?: string; maxPrice?: number }): Promise<MarketplaceItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    
    const queryString = searchParams.toString();
    return apiCall<MarketplaceItem[]>(`/marketplace${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<MarketplaceItem> => {
    return apiCall<MarketplaceItem>(`/marketplace/${id}`);
  },
};

// News API
export const newsAPI = {
  getAll: async (params?: { category?: string; limit?: number }): Promise<NewsArticle[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return apiCall<NewsArticle[]>(`/news${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<NewsArticle> => {
    return apiCall<NewsArticle>(`/news/${id}`);
  },
};

// Tourism API
export const tourismAPI = {
  getAll: async (params?: { category?: string; location?: string; priceRange?: string }): Promise<TourismAttraction[]> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.priceRange) searchParams.append('priceRange', params.priceRange);
    
    const queryString = searchParams.toString();
    return apiCall<TourismAttraction[]>(`/tourism${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<TourismAttraction> => {
    return apiCall<TourismAttraction>(`/tourism/${id}`);
  },
};