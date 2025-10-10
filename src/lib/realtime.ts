/**
 * Supabase Realtime Configuration and Helper Functions
 * 
 * This module provides:
 * 1. Realtime channel setup for room messages
 * 2. Type-safe subscription helpers
 * 3. Channel authentication and management
 */

import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Types for realtime payloads
export interface RoomMessage {
  id: string
  thread_id: string
  room_id: string
  user_id: string
  body: string
  created_at: string
  updated_at: string
}

export interface MessageBroadcast {
  id: string
  thread_id: string
  room_id: string
  user_id: string
  body: string
  op: 'INSERT' | 'UPDATE' | 'DELETE'
  created_at: string
}

export type MessageChangePayload = RealtimePostgresChangesPayload<RoomMessage>

// Channel management
const activeChannels = new Map<string, RealtimeChannel>()

/**
 * Subscribe to realtime messages for a specific room
 * Channel name pattern: room:{room_id}:messages
 */
export function subscribeToRoomMessages(
  roomId: string,
  callbacks: {
    onInsert?: (payload: MessageChangePayload) => void
    onUpdate?: (payload: MessageChangePayload) => void
    onDelete?: (payload: MessageChangePayload) => void
    onBroadcast?: (payload: MessageBroadcast) => void
    onError?: (error: Error) => void
  }
): RealtimeChannel | null {
  const channelName = `room:${roomId}:messages`
  
  // Remove existing channel if present
  if (activeChannels.has(channelName)) {
    unsubscribeFromRoom(roomId)
  }
  
  if (!supabase) {
    console.error('Supabase client not initialized')
    return null
  }
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        try {
          callbacks.onInsert?.(payload as MessageChangePayload)
        } catch (error) {
          callbacks.onError?.(error as Error)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        try {
          callbacks.onUpdate?.(payload as MessageChangePayload)
        } catch (error) {
          callbacks.onError?.(error as Error)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        try {
          callbacks.onDelete?.(payload as MessageChangePayload)
        } catch (error) {
          callbacks.onError?.(error as Error)
        }
      }
    )
    .on(
      'broadcast',
      { event: `room:${roomId}:messages` },
      (payload) => {
        try {
          callbacks.onBroadcast?.(payload.payload as MessageBroadcast)
        } catch (error) {
          callbacks.onError?.(error as Error)
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to room ${roomId} messages`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Failed to subscribe to room ${roomId}`)
        callbacks.onError?.(new Error(`Channel subscription failed for room ${roomId}`))
      } else if (status === 'TIMED_OUT') {
        console.error(`⏰ Subscription timeout for room ${roomId}`)
        callbacks.onError?.(new Error(`Channel subscription timeout for room ${roomId}`))
      } else if (status === 'CLOSED') {
        console.log(`🔒 Channel closed for room ${roomId}`)
      }
    })
  
  activeChannels.set(channelName, channel)
  return channel
}

/**
 * Unsubscribe from room messages
 */
export function unsubscribeFromRoom(roomId: string): boolean {
  const channelName = `room:${roomId}:messages`
  const channel = activeChannels.get(channelName)
  
  if (channel && supabase) {
    supabase.removeChannel(channel)
    activeChannels.delete(channelName)
    console.log(`🔌 Unsubscribed from room ${roomId}`)
    return true
  }
  
  return false
}

/**
 * Unsubscribe from all active channels
 */
export function unsubscribeFromAll(): void {
  if (!supabase) return
  
  for (const [channelName, channel] of activeChannels.entries()) {
    supabase.removeChannel(channel)
    console.log(`🔌 Unsubscribed from ${channelName}`)
  }
  activeChannels.clear()
}

/**
 * Get list of active channel names
 */
export function getActiveChannels(): string[] {
  return Array.from(activeChannels.keys())
}

/**
 * Check if subscribed to a specific room
 */
export function isSubscribedToRoom(roomId: string): boolean {
  return activeChannels.has(`room:${roomId}:messages`)
}

/**
 * Broadcast a message to a room channel
 * Note: This is typically handled by database triggers, 
 * but can be used for custom broadcasts
 */
export async function broadcastToRoom(
  roomId: string, 
  message: Omit<MessageBroadcast, 'room_id'>
): Promise<boolean> {
  const channelName = `room:${roomId}:messages`
  const channel = activeChannels.get(channelName)
  
  if (!channel) {
    console.error(`❌ No active channel for room ${roomId}`)
    return false
  }
  
  const result = await channel.send({
    type: 'broadcast',
    event: `room:${roomId}:messages`,
    payload: {
      ...message,
      room_id: roomId
    }
  })
  
  return result === 'ok'
}

/**
 * Get realtime connection status
 */
export function getRealtimeStatus(): string {
  if (!supabase) return 'disconnected'
  return supabase.realtime.isConnected() ? 'connected' : 'disconnected'
}

/**
 * Force reconnect realtime connection
 */
export function reconnectRealtime(): void {
  if (!supabase) return
  supabase.realtime.disconnect()
  supabase.realtime.connect()
}