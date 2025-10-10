/**
 * Rooms and Messaging Hooks
 * 
 * This module provides React hooks for room management, messaging, and realtime subscriptions
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { subscribeToRoomMessages, unsubscribeFromRoom, isSubscribedToRoom } from './realtime'
import type { MessageBroadcast, MessageChangePayload } from './realtime'
import { useAuth } from './useAuth'

// Types
export interface Room {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface RoomMember {
  room_id: string
  user_id: string
  role: 'member' | 'admin'
  joined_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string
  }
}

export interface MessageThread {
  id: string
  room_id: string
  created_by: string
  subject: string | null
  message_count: number
  last_activity_at: string
  created_at: string
}

export interface RoomMessage {
  id: string
  thread_id: string
  room_id: string
  user_id: string
  body: string
  edited: boolean
  created_at: string
  updated_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string
  }
}

// Hook for managing user's rooms
export function useRooms() {
  const { user, isAuthenticated } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    if (!supabase || !isAuthenticated || !user) return

    setLoading(true)
    setError(null)

    try {
      // Get rooms where user is a member
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members!inner(user_id)
        `)
        .eq('room_members.user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setRooms(data || [])
    } catch (err) {
      console.error('[useRooms] Error fetching rooms:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const createRoom = async (name: string): Promise<Room> => {
    if (!supabase || !user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('room_members')
      .insert({
        room_id: data.id,
        user_id: user.id,
        role: 'admin'
      })

    if (memberError) throw memberError

    // Refresh rooms list
    await fetchRooms()
    return data
  }

  const joinRoom = async (roomId: string): Promise<void> => {
    if (!supabase || !user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('room_members')
      .insert({
        room_id: roomId,
        user_id: user.id,
        role: 'member'
      })

    if (error) throw error

    // Refresh rooms list
    await fetchRooms()
  }

  const leaveRoom = async (roomId: string): Promise<void> => {
    if (!supabase || !user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id)

    if (error) throw error

    // Unsubscribe from realtime if subscribed
    if (isSubscribedToRoom(roomId)) {
      unsubscribeFromRoom(roomId)
    }

    // Refresh rooms list
    await fetchRooms()
  }

  return {
    rooms,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    refreshRooms: fetchRooms
  }
}

// Hook for managing room members
export function useRoomMembers(roomId: string | null) {
  const [members, setMembers] = useState<RoomMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!supabase || !roomId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('room_members')
        .select(`
          *,
          profiles(first_name, last_name, email)
        `)
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true })

      if (error) throw error

      setMembers(data || [])
    } catch (err) {
      console.error('[useRoomMembers] Error fetching members:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch members')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    members,
    loading,
    error,
    refreshMembers: fetchMembers
  }
}

// Hook for managing room messages with realtime
export function useRoomMessages(roomId: string | null) {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch messages for the room
  const fetchMessages = useCallback(async () => {
    if (!supabase || !roomId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('room_messages')
        .select(`
          *,
          profiles(first_name, last_name, email)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (err) {
      console.error('[useRoomMessages] Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  // Fetch threads for the room
  const fetchThreads = useCallback(async () => {
    if (!supabase || !roomId) return

    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .eq('room_id', roomId)
        .order('last_activity_at', { ascending: false })

      if (error) throw error

      setThreads(data || [])
    } catch (err) {
      console.error('[useRoomMessages] Error fetching threads:', err)
    }
  }, [roomId])

  // Set up realtime subscription
  useEffect(() => {
    if (!roomId || !isAuthenticated) return

    fetchMessages()
    fetchThreads()

    // Subscribe to realtime updates
    subscribeToRoomMessages(roomId, {
      onInsert: (payload: MessageChangePayload) => {
        const newMessage = payload.new as RoomMessage
        setMessages(prev => [...prev, newMessage])
        
        // Update thread activity
        fetchThreads()
      },
      onUpdate: (payload: MessageChangePayload) => {
        const updatedMessage = payload.new as RoomMessage
        setMessages(prev =>
          prev.map(msg =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        )
      },
      onDelete: (payload: MessageChangePayload) => {
        const deletedMessage = payload.old as RoomMessage
        setMessages(prev =>
          prev.filter(msg => msg.id !== deletedMessage.id)
        )
      },
      onBroadcast: (payload: MessageBroadcast) => {
        console.log('[useRoomMessages] Received broadcast:', payload)
        // Handle custom broadcasts if needed
      },
      onError: (error: Error) => {
        console.error('[useRoomMessages] Realtime error:', error)
        setError(error.message)
      }
    })

    return () => {
      unsubscribeFromRoom(roomId)
    }
  }, [roomId, isAuthenticated, fetchMessages, fetchThreads])

  // Send a message using RPC function
  const sendMessage = async (body: string, threadId?: string): Promise<void> => {
    if (!supabase || !roomId || !user) throw new Error('Not authenticated')

    const { error } = await supabase.rpc('post_message', {
      p_room_id: roomId,
      p_thread_id: threadId || null,
      p_body: body
    })

    if (error) throw error
  }

  // Create a new thread
  const createThread = async (subject: string): Promise<MessageThread> => {
    if (!supabase || !roomId || !user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('message_threads')
      .insert({
        room_id: roomId,
        created_by: user.id,
        subject
      })
      .select()
      .single()

    if (error) throw error

    setThreads(prev => [data, ...prev])
    return data
  }

  return {
    messages,
    threads,
    loading,
    error,
    sendMessage,
    createThread,
    refreshMessages: fetchMessages,
    refreshThreads: fetchThreads
  }
}