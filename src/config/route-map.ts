/**
 * Route Map Configuration
 * 
 * Centralized configuration for all routes with role requirements and metadata
 */

import type { UserRole } from '../lib/useAuth'

export interface RouteConfig {
  path: string
  name: string
  component?: string
  requiredRoles: UserRole[]
  isPublic: boolean
  showInNav: boolean
  icon?: string
  description?: string
  category?: 'main' | 'auth' | 'admin' | 'business' | 'citizen'
  meta?: {
    title?: string
    description?: string
    requiresAuth?: boolean
    redirectTo?: string
  }
}

export const routeMap: Record<string, RouteConfig> = {
  // Public routes
  home: {
    path: '/',
    name: 'Home',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: true,
    icon: 'Home',
    description: 'Limpopo Connect home page',
    category: 'main'
  },
  
  explore: {
    path: '/explore',
    name: 'Explore',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: true,
    icon: 'MapPin',
    description: 'Explore Limpopo Province',
    category: 'main'
  },
  
  tourism: {
    path: '/tourism',
    name: 'Tourism',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: true,
    icon: 'Camera',
    description: 'Tourism information and attractions',
    category: 'main'
  },
  
  events: {
    path: '/events',
    name: 'Events',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: true,
    icon: 'Calendar',
    description: 'Local events and activities',
    category: 'main'
  },
  
  businessDirectory: {
    path: '/business-directory',
    name: 'Business Directory',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: true,
    icon: 'Building',
    description: 'Local business directory',
    category: 'main'
  },
  
  marketplace: {
    path: '/marketplace',
    name: 'Marketplace',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: true,
    icon: 'ShoppingBag',
    description: 'Local marketplace',
    category: 'main'
  },
  
  news: {
    path: '/news',
    name: 'News',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: true,
    icon: 'Newspaper',
    description: 'Local news and updates',
    category: 'main'
  },

  // Authentication routes
  login: {
    path: '/auth/login',
    name: 'Login',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: false,
    category: 'auth',
    meta: {
      title: 'Login to Limpopo Connect',
      redirectTo: '/home'
    }
  },
  
  register: {
    path: '/auth/register',
    name: 'Register',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: false,
    category: 'auth',
    meta: {
      title: 'Join Limpopo Connect'
    }
  },
  
  resetPassword: {
    path: '/auth/reset-password',
    name: 'Reset Password',
    requiredRoles: ['visitor', 'citizen', 'business', 'admin'],
    isPublic: true,
    showInNav: false,
    category: 'auth'
  },

  // Protected citizen routes
  citizenHome: {
    path: '/home',
    name: 'Home Feed',
    requiredRoles: ['citizen', 'business', 'admin'],
    isPublic: false,
    showInNav: true,
    icon: 'Home',
    description: 'Personal home feed',
    category: 'citizen'
  },
  
  profile: {
    path: '/profile',
    name: 'Profile',
    requiredRoles: ['citizen', 'business', 'admin'],
    isPublic: false,
    showInNav: true,
    icon: 'User',
    description: 'User profile management',
    category: 'citizen'
  },
  
  connections: {
    path: '/connections',
    name: 'Connections',
    requiredRoles: ['citizen', 'business', 'admin'],
    isPublic: false,
    showInNav: true,
    icon: 'Users',
    description: 'Manage connections',
    category: 'citizen'
  },
  
  chatDemo: {
    path: '/chat-demo',
    name: 'Chat Rooms',
    requiredRoles: ['citizen', 'business', 'admin'],
    isPublic: false,
    showInNav: true,
    icon: 'MessageCircle',
    description: 'Community chat rooms',
    category: 'citizen'
  },

  // Business routes
  businessDashboard: {
    path: '/business-dashboard',
    name: 'Business Dashboard',
    requiredRoles: ['business', 'admin'],
    isPublic: false,
    showInNav: true,
    icon: 'BarChart3',
    description: 'Business management dashboard',
    category: 'business'
  },
  
  listings: {
    path: '/listings',
    name: 'Manage Listings',
    requiredRoles: ['business', 'admin'],
    isPublic: false,
    showInNav: true,
    icon: 'Store',
    description: 'Manage business listings',
    category: 'business'
  },
  
  businessAnalytics: {
    path: '/business-analytics',
    name: 'Analytics',
    requiredRoles: ['business', 'admin'],
    isPublic: false,
    showInNav: true,
    icon: 'TrendingUp',
    description: 'Business analytics and insights',
    category: 'business'
  },

  // Admin routes
  adminDashboard: {
    path: '/admin',
    name: 'Admin Dashboard',
    requiredRoles: ['admin'],
    isPublic: false,
    showInNav: true,
    icon: 'Shield',
    description: 'Administrative dashboard',
    category: 'admin'
  },
  
  adminUsers: {
    path: '/admin/users',
    name: 'User Management',
    requiredRoles: ['admin'],
    isPublic: false,
    showInNav: true,
    icon: 'Users',
    description: 'Manage platform users',
    category: 'admin'
  },
  
  adminContent: {
    path: '/admin/content',
    name: 'Content Moderation',
    requiredRoles: ['admin'],
    isPublic: false,
    showInNav: true,
    icon: 'Flag',
    description: 'Moderate platform content',
    category: 'admin'
  },
  
  adminAuditLogs: {
    path: '/admin/audit-logs',
    name: 'Audit Logs',
    requiredRoles: ['admin'],
    isPublic: false,
    showInNav: true,
    icon: 'FileText',
    description: 'View system audit logs',
    category: 'admin'
  },

  // Onboarding
  completeOnboarding: {
    path: '/complete-onboarding',
    name: 'Complete Profile',
    requiredRoles: ['citizen', 'business', 'admin'],
    isPublic: false,
    showInNav: false,
    description: 'Complete user profile setup',
    category: 'auth'
  }
}

// Utility functions
export function getRoutesByRole(role: UserRole): RouteConfig[] {
  return Object.values(routeMap).filter(route => 
    route.requiredRoles.includes(role)
  )
}

export function getNavRoutes(role: UserRole): RouteConfig[] {
  return getRoutesByRole(role).filter(route => route.showInNav)
}

export function getRoutesByCategory(category: RouteConfig['category']): RouteConfig[] {
  return Object.values(routeMap).filter(route => route.category === category)
}

export function canAccessRoute(path: string, role: UserRole): boolean {
  const route = Object.values(routeMap).find(r => r.path === path)
  if (!route) return false
  return route.requiredRoles.includes(role)
}

export function isPublicRoute(path: string): boolean {
  const route = Object.values(routeMap).find(r => r.path === path)
  return route?.isPublic ?? false
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case 'visitor':
      return '/explore'
    case 'citizen':
      return '/home'
    case 'business':
      return '/business-dashboard'
    case 'admin':
      return '/admin'
    default:
      return '/'
  }
}

export default routeMap