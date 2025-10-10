/**
 * Authentication Context Provider
 * 
 * This provides authentication state and methods throughout the React app
 */

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile, UserRole } from './useAuth'

interface RoleClaims {
  role: UserRole
  sub: string
  email?: string
}

interface AuthContextType {
  // State
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole
  claims: RoleClaims | null
  loading: boolean
  isAuthenticated: boolean

  // Methods
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ user: User | null; session: Session | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void> | null
  refreshToken: () => Promise<{ session: Session | null }>
  
  // Role utilities
  getRoleConfig: (role: UserRole) => {
    label: string
    color: string
    defaultLanding: string
    routes: string[]
    permissions: Record<string, boolean>
    description: string
    quickActions?: Array<{ label: string; path: string; icon: string }>
  }
  getDefaultLandingPage: (role?: UserRole) => string
  hasPermission: (permission: string, role?: UserRole) => boolean
  canAccessRoute: (route: string, role?: UserRole) => boolean
  
  // Role helper functions
  isVisitor: () => boolean
  isCitizen: () => boolean
  isBusiness: () => boolean
  isAdmin: () => boolean
  hasRoleOrHigher: (requiredRole: UserRole) => boolean
  getRolePriority: (role?: UserRole) => number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// eslint-disable-next-line react-refresh/only-export-components
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}