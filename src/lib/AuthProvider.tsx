/**
 * Authentication Context Provider
 * 
 * This provides authentication state and methods throughout the React app
 */

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from './useAuth'

interface AuthContextType {
  // State
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean

  // Methods
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void> | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

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

// Export for convenience
export { useAuth }