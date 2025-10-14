/**
 * Profile Hooks for Limpopo Connect
 * 
 * Provides hooks for profile data fetching, mutations, and avatar upload
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase';

// Do not crash the app at import-time if env vars are missing in production.
// Gracefully degrade by logging a warning; individual functions will guard.
if (!supabase) {
  console.warn('[useProfile] Supabase client not initialized. Profile features will be limited until environment variables are configured.');
}
import { useAuthContext } from './AuthProvider'
import type { Profile } from './useAuth'

interface ProfileStats {
  reports_submitted: number
  businesses_owned: number
  rooms_joined: number
  messages_sent: number
  member_since: string
}

interface UseProfileOptions {
  includeStats?: boolean
}

interface UseProfileResult {
  profile: Profile | null
  stats: ProfileStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseProfileMutationsResult {
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  deleteAvatar: () => Promise<void>
  loading: boolean
  error: string | null
}

/**
 * Hook for fetching profile data with optional statistics
 */
export function useProfile(userId?: string, options: UseProfileOptions = {}): UseProfileResult {
  const { user, profile: authProfile } = useAuthContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const targetUserId = userId || user?.id
  const isOwnProfile = targetUserId === user?.id

  const fetchProfile = useCallback(async () => {
    console.log('[DEBUG] Fetching profile for userId:', targetUserId);
    if (!targetUserId) {
      setLoading(false)
      return
    }

    try {
      if (!supabase) {
        console.error('[DEBUG] Supabase client not available. Check .env.local');
        // Dev fallback
        if (import.meta.env.DEV) {
          console.log('[DEBUG] Using fallback profile for development.');
          setProfile({
            id: targetUserId,
            first_name: 'Dev',
            last_name: 'Fallback',
            email: 'dev@example.com',
            role: 'citizen',
            is_public_profile: true,
            bio: 'This is a fallback profile for development purposes.',
            created_at: new Date().toISOString(),
            avatar_url: null,
            show_contact: true,
          });
        } else {
          throw new Error('Supabase client not available');
        }
        return;
      }
      
      setLoading(true)
      setError(null)

      // For own profile, use the auth context profile if available
      if (isOwnProfile && authProfile) {
        setProfile(authProfile)
        
        // Fetch stats if requested
        if (options.includeStats) {
          const { data: statsData, error: statsError } = await supabase
            .rpc('get_profile_stats', { user_id: targetUserId })

          if (statsError) {
            console.warn('Failed to fetch profile stats:', statsError)
          } else {
            setStats(statsData)
          }
        }
      } else {
        // Fetch profile from database
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError('Profile not found')
          } else {
            setError('Failed to load profile')
          }
          console.error('Profile fetch error:', profileError)
          return
        }

        setProfile(data)

        // Fetch stats if requested and allowed
        if (options.includeStats && (isOwnProfile || data.is_public_profile)) {
          const { data: statsData, error: statsError } = await supabase
            .rpc('get_profile_stats', { user_id: targetUserId })

          if (statsError) {
            console.warn('Failed to fetch profile stats:', statsError)
          } else {
            setStats(statsData)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [targetUserId, isOwnProfile, authProfile, options.includeStats])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    stats,
    loading,
    error,
    refetch: fetchProfile
  }
}

/**
 * Hook for profile mutations (update, avatar upload/delete)
 */
export function useProfileMutations(): UseProfileMutationsResult {
  const { user, refreshProfile } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      // Remove fields that shouldn't be updated by regular users
      const allowedUpdates = { ...updates }
      delete allowedUpdates.id
      delete allowedUpdates.email
      delete allowedUpdates.created_at
      delete allowedUpdates.role // Only admins can change roles

      const { error: updateError } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Refresh the profile in auth context
      await refreshProfile()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, refreshProfile])

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${user.id}/avatar.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Replace existing file
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl })

      return publicUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, updateProfile])

  const deleteAvatar = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      setLoading(true)
      setError(null)

      // Remove from storage (try both common extensions)
      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      for (const ext of extensions) {
        const fileName = `${user.id}/avatar.${ext}`
        // Don't throw on error - file might not exist
        await supabase.storage
          .from('avatars')
          .remove([fileName])
      }

      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: null })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete avatar'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user, updateProfile])

  return {
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    loading,
    error
  }
}

/**
 * Utility function to validate profile data
 */
export function validateProfileData(data: Partial<Profile>): string[] {
  const errors: string[] = []

  if (data.bio && data.bio.length > 1000) {
    errors.push('Bio must be 1000 characters or less')
  }

  if (data.phone && data.phone.trim()) {
    // Basic South African phone number validation
    const phoneRegex = /^(\+27|0)[0-9]{9}$/
    if (!phoneRegex.test(data.phone.trim())) {
      errors.push('Phone number must be a valid South African number')
    }
  }

  if (data.first_name && data.first_name.trim().length < 2) {
    errors.push('First name must be at least 2 characters long')
  }

  if (data.last_name && data.last_name.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long')
  }

  return errors
}

/**
 * Utility function to get display name from profile
 */
export function getDisplayName(profile: Profile | null): string {
  if (!profile) return 'Unknown User'
  
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`
  }
  
  if (profile.first_name) {
    return profile.first_name
  }
  
  return profile.email || 'Unknown User'
}

/**
 * Utility function to check if profile is viewable by current user
 */
export function canViewProfile(profile: Profile | null, currentUserId: string | null, isAdmin: boolean = false): boolean {
  if (!profile) return false
  
  // Own profile is always viewable
  if (profile.id === currentUserId) return true
  
  // Admin can view all profiles
  if (isAdmin) return true
  
  // Check if profile is public
  return profile.is_public_profile
}

export type { Profile, ProfileStats, UseProfileOptions, UseProfileResult, UseProfileMutationsResult }