/**
 * Supabase Authentication Hook
 * 
 * This hook provides authentication state management and methods for login, logout, and user management
 */

import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

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
  role: string
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })
  const [profile, setProfile] = useState<Profile | null>(null)

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
    } catch (err) {
      console.error('[useAuth] Profile fetch failed:', err)
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

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
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

  return {
    // State
    user: authState.user,
    session: authState.session,
    profile,
    loading: authState.loading,
    isAuthenticated: !!authState.user,

    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile: () => authState.user && fetchProfile(authState.user.id)
  }
}

export type { Profile }