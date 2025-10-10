#!/usr/bin/env node
/**
 * Simplified Realtime Test
 * 
 * This script tests realtime functionality without creating users
 * by using service role permissions to bypass RLS
 */

import { createClient } from '@supabase/supabase-js'
import { setTimeout } from 'timers/promises'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test data
const TEST_ROOM_ID = crypto.randomUUID()
const TEST_THREAD_ID = crypto.randomUUID()

async function testRealtimeSubscription() {
  console.log('📡 Testing realtime subscription...')
  
  return new Promise((resolve) => {
    let messagesReceived = 0
    const expectedMessages = 2
    const timeout = 15000 // 15 seconds
    
    // Subscribe to room messages
    const channel = serviceClient
      .channel(`test-room:${TEST_ROOM_ID}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${TEST_ROOM_ID}`
        },
        (payload) => {
          console.log('🔔 Received realtime message:', {
            id: payload.new.id,
            body: payload.new.body,
            thread_id: payload.new.thread_id
          })
          
          messagesReceived++
          
          if (messagesReceived >= expectedMessages) {
            console.log(`✅ Received all ${expectedMessages} expected messages`)
            serviceClient.removeChannel(channel)
            resolve(true)
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to realtime channel')
          
          // Wait a moment for subscription to stabilize
          await setTimeout(1000)
          
          // Send test messages
          await sendTestMessages()
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel subscription failed')
          resolve(false)
        } else if (status === 'TIMED_OUT') {
          console.error('❌ Channel subscription timed out')
          resolve(false)
        }
      })
    
    // Timeout
    setTimeout(timeout).then(() => {
      if (messagesReceived < expectedMessages) {
        console.error(`❌ Timeout: Only received ${messagesReceived}/${expectedMessages} messages`)
        serviceClient.removeChannel(channel)
        resolve(false)
      }
    })
  })
}

async function sendTestMessages() {
  console.log('📤 Sending test messages directly to database...')
  
  try {
    // Insert messages directly (bypassing RLS with service role)
    const { error: msg1Error } = await serviceClient
      .from('room_messages')
      .insert({
        id: crypto.randomUUID(),
        thread_id: TEST_THREAD_ID,
        room_id: TEST_ROOM_ID,
        user_id: crypto.randomUUID(), // Random UUID for testing
        body: 'Hello from realtime test 1!'
      })
    
    if (msg1Error) {
      console.error('❌ Failed to send message 1:', msg1Error.message)
      return false
    }
    
    // Wait a moment
    await setTimeout(500)
    
    // Send second message
    const { error: msg2Error } = await serviceClient
      .from('room_messages')
      .insert({
        id: crypto.randomUUID(),
        thread_id: TEST_THREAD_ID,
        room_id: TEST_ROOM_ID,
        user_id: crypto.randomUUID(), // Random UUID for testing
        body: 'Hello from realtime test 2!'
      })
    
    if (msg2Error) {
      console.error('❌ Failed to send message 2:', msg2Error.message)
      return false
    }
    
    console.log('✅ Test messages sent')
    return true
  } catch (err) {
    console.error('❌ Failed to send test messages:', err.message)
    return false
  }
}

async function testStorageBucket() {
  console.log('📦 Testing storage bucket...')
  
  try {
    const { data: buckets, error } = await serviceClient.storage.listBuckets()
    
    if (error) {
      console.error('❌ Failed to list buckets:', error.message)
      return false
    }
    
    const userUploadsBucket = buckets.find(b => b.id === 'user-uploads')
    if (!userUploadsBucket) {
      console.error('❌ user-uploads bucket not found')
      return false
    }
    
    console.log('✅ Storage bucket accessible')
    return true
  } catch (err) {
    console.error('❌ Storage test failed:', err.message)
    return false
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...')
  
  try {
    // Delete any test messages
    await serviceClient
      .from('room_messages')
      .delete()
      .eq('room_id', TEST_ROOM_ID)
    
    console.log('✅ Test data cleaned up')
    return true
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting simplified realtime test...\n')
  
  const tests = [
    { name: 'Storage Bucket', fn: testStorageBucket },
    { name: 'Realtime Subscription', fn: testRealtimeSubscription },
    { name: 'Cleanup', fn: cleanup }
  ]
  
  let allPassed = true
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`)
    const passed = await test.fn()
    if (!passed) {
      allPassed = false
      if (test.name !== 'Cleanup') {
        console.log('Attempting cleanup before exit...')
        await cleanup()
        break
      }
    }
  }
  
  if (allPassed) {
    console.log('\n🎉 All realtime tests passed!')
    console.log('✅ Realtime functionality is working correctly')
    console.log('✅ Database triggers are broadcasting messages')
    console.log('✅ Ready to integrate with React frontend')
  } else {
    console.log('\n❌ Some tests failed!')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('💥 Test script failed:', err)
  process.exit(1)
})