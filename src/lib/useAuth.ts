/**
 * Supabase Authentication Hook
 * 
 * This hook provides authentication state management and methods for login, logout, and user management
 */

import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import rolesConfig from '../config/roles.json'

export type UserRole = 'visitor' | 'citizen' | 'business' | 'admin'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  is_public_profile: boolean
  show_contact: boolean
  role: UserRole
  created_at: string
  updated_at: string
}

interface RoleClaims {
  role: UserRole
  sub: string
  email?: string
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roleClaims, setRoleClaims] = useState<RoleClaims | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        setAuthState({ user: null, session: null, loading: false })
        return
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('[useAuth] Error getting session:', error)
        setAuthState({ user: null, session: null, loading: false })
        return
      }

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false
      })

      // Fetch user profile if authenticated
      if (session?.user) {
        await fetchProfile(session.user.id)
      }
    }

    getInitialSession()

    if (!supabase) return

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state changed:', event, session?.user?.email)
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setRoleClaims(null)
          // Clear session storage
          sessionStorage.removeItem('limpopo_user_role')
          sessionStorage.removeItem('limpopo_role_claims')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[useAuth] Error fetching profile:', error)
        return
      }

      setProfile(data)
      
      // Update JWT claims with role information
      if (data) {
        const claims: RoleClaims = {
          role: data.role,
          sub: userId,
          email: data.email
        }
        setRoleClaims(claims)
        
        // Store role claims in session storage for UI purposes
        sessionStorage.setItem('limpopo_user_role', data.role)
        sessionStorage.setItem('limpopo_role_claims', JSON.stringify(claims))
      }
    } catch (err) {
      console.error('[useAuth] Profile fetch failed:', err)
    }
  }

  const refreshJWTClaims = async () => {
    if (!supabase || !authState.user) {
      console.warn('[useAuth] Cannot refresh JWT claims - not authenticated')
      return
    }

    try {
      const { data, error } = await supabase.rpc('refresh_jwt_claims')
      
      if (error) {
        console.error('[useAuth] Error refreshing JWT claims:', error)
        return
      }
      
      console.log('[useAuth] JWT claims refreshed:', data)
      
      // Re-fetch profile to get updated data
      await fetchProfile(authState.user.id)
    } catch (err) {
      console.error('[useAuth] JWT refresh failed:', err)
    }
  }

  const verifyRoleSync = async () => {
    if (!supabase) return null

    try {
      const { data, error } = await supabase.rpc('get_jwt_claims')
      
      if (error) {
        console.error('[useAuth] Error getting JWT claims:', error)
        return null
      }
      
      return {
        jwtRole: data?.role || 'visitor',
        profileRole: profile?.role || 'visitor',
        inSync: data?.role === profile?.role,
        claims: data
      }
    } catch (err) {
      console.error('[useAuth] Role sync verification failed:', err)
      return null
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!supabase || !authState.user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authState.user.id)

    if (error) throw error

    // Refresh profile data
    await fetchProfile(authState.user.id)
  }

  const getRoleConfig = (role: UserRole) => {
    return rolesConfig[role] || rolesConfig.visitor
  }

  const getDefaultLandingPage = (role?: UserRole) => {
    if (!role) return '/explore'
    return getRoleConfig(role).defaultLanding
  }

  const hasPermission = (permission: string, role?: UserRole) => {
    if (!role) return false
    const config = getRoleConfig(role)
    return config.permissions?.[permission as keyof typeof config.permissions] === true
  }

  const canAccessRoute = (route: string, role?: UserRole) => {
    if (!role) role = 'visitor'
    const config = getRoleConfig(role)
    return config.routes.includes(route)
  }

  const refreshToken = async () => {
    if (!supabase) throw new Error('Supabase not initialized')
    
    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error
    return data
  }

  const requestBusinessVerification = async (verificationData: {
    business_name: string
    business_registration_number?: string
    business_address?: string
    business_phone?: string
    business_email?: string
    verification_documents?: string[]
  }) => {
    if (!supabase || !authState.user) throw new Error('Not authenticated')
    if (profile?.role !== 'citizen') throw new Error('Only citizens can request business verification')

    const { data, error } = await supabase
      .from('business_verifications')
      .insert({
        user_id: authState.user.id,
        ...verificationData
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const getBusinessVerificationStatus = async () => {
    if (!supabase || !authState.user) return null

    const { data, error } = await supabase
      .from('business_verifications')
      .select('*')
      .eq('user_id', authState.user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('[useAuth] Error fetching verification status:', error)
    }

    return data
  }

  const hasRoleOrHigher = (requiredRole: UserRole, userRole?: UserRole) => {
    const roleHierarchy = { visitor: 0, citizen: 1, business: 2, admin: 3 }
    const currentRole = userRole || profile?.role || 'visitor'
    return roleHierarchy[currentRole] >= roleHierarchy[requiredRole]
  }

  const isRoleUpgradeAvailable = () => {
    if (!profile) return false
    return profile.role === 'citizen'
  }

  // Role helper functions
  const isVisitor = () => {
    return (profile?.role || 'visitor') === 'visitor'
  }

  const isCitizen = () => {
    return profile?.role === 'citizen'
  }

  const isBusiness = () => {
    return profile?.role === 'business'
  }

  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  const hasRoleOrHigherSimple = (requiredRole: UserRole) => {
    return hasRoleOrHigher(requiredRole, profile?.role)
  }

  const getRolePriority = (role?: UserRole) => {
    const roleHierarchy = { visitor: 0, citizen: 1, business: 2, admin: 3 }
    return roleHierarchy[role || 'visitor']
  }

  return {
    // State
    user: authState.user,
    session: authState.session,
    profile,
    role: profile?.role || 'visitor' as UserRole,
    claims: roleClaims,
    loading: authState.loading,
    isAuthenticated: !!authState.user,

    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile: () => authState.user && fetchProfile(authState.user.id),
    refreshToken,
    
    // Role utilities
    getRoleConfig,
    getDefaultLandingPage,
    hasPermission,
    canAccessRoute,
    hasRoleOrHigher,
    isRoleUpgradeAvailable,
    
    // Role helper functions
    isVisitor,
    isCitizen,
    isBusiness,
    isAdmin,
    hasRoleOrHigherSimple,
    getRolePriority,
    
    // JWT and role management
    refreshJWTClaims,
    verifyRoleSync,
    
    // Business verification
    requestBusinessVerification,
    getBusinessVerificationStatus
  }
}

export type { Profile }