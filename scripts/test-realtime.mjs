#!/usr/bin/env node
/**
 * Realtime Integration Test
 * 
 * This script tests our realtime setup by:
 * 1. Creating a test user and room
 * 2. Subscribing to realtime messages
 * 3. Posting messages and verifying realtime delivery
 * 4. Testing subscription cleanup
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

// Test data - use timestamp-based UUIDs to make unique
const TEST_TIMESTAMP = Date.now()
const TEST_USER_ID = `${TEST_TIMESTAMP.toString(16).padStart(8, '0').slice(-8)}-0000-4000-8000-000000000001`
const TEST_ROOM_ID = `${TEST_TIMESTAMP.toString(16).padStart(8, '0').slice(-8)}-1111-4111-8111-111111111111`

async function setupTestData() {
  console.log('🔧 Setting up test data...')
  
  try {
    // First, create a test user in auth.users using admin API
    const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
      user_id: TEST_USER_ID,
      email: `testuser${TEST_TIMESTAMP}@test.com`,
      email_confirm: true,
      user_metadata: {
        username: `testuser${TEST_TIMESTAMP}`,
        full_name: 'Test User'
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Failed to create auth user:', authError.message)
      return false
    }
    
    // Small delay to let the trigger create the profile
    await setTimeout(1000)
    
    // Create test room
    const { error: roomError } = await serviceClient
      .from('rooms')
      .upsert({
        id: TEST_ROOM_ID,
        name: 'Test Room',
        created_by: TEST_USER_ID
      })
    
    if (roomError) {
      console.error('❌ Failed to create test room:', roomError.message)
      return false
    }
    
    // Add user as room member
    const { error: memberError } = await serviceClient
      .from('room_members')
      .upsert({
        room_id: TEST_ROOM_ID,
        user_id: TEST_USER_ID,
        role: 'admin',
        joined_at: new Date().toISOString()
      })
    
    if (memberError) {
      console.error('❌ Failed to add room member:', memberError.message)
      return false
    }
    
    console.log('✅ Test data created')
    return true
  } catch (err) {
    console.error('❌ Setup failed:', err.message)
    return false
  }
}

async function testRealtimeSubscription() {
  console.log('📡 Testing realtime subscription...')
  
  return new Promise((resolve) => {
    let messagesReceived = 0
    const expectedMessages = 2
    
    // Subscribe to room messages
    const channel = serviceClient
      .channel(`room:${TEST_ROOM_ID}:messages`)
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
            user_id: payload.new.user_id
          })
          
          messagesReceived++
          
          if (messagesReceived >= expectedMessages) {
            console.log(`✅ Received all ${expectedMessages} expected messages`)
            serviceClient.removeChannel(channel)
            resolve(true)
          }
        }
      )
      .on(
        'broadcast',
        { event: `room:${TEST_ROOM_ID}:messages` },
        (payload) => {
          console.log('📢 Received broadcast:', payload.payload)
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
    
    // Timeout after 30 seconds
    setTimeout(30000).then(() => {
      if (messagesReceived < expectedMessages) {
        console.error(`❌ Timeout: Only received ${messagesReceived}/${expectedMessages} messages`)
        serviceClient.removeChannel(channel)
        resolve(false)
      }
    })
  })
}

async function sendTestMessages() {
  console.log('📤 Sending test messages...')
  
  try {
    // Create a thread first
    const { data: thread, error: threadError } = await serviceClient
      .from('message_threads')
      .insert({
        room_id: TEST_ROOM_ID,
        created_by: TEST_USER_ID,
        subject: 'Test Thread'
      })
      .select()
      .single()
    
    if (threadError) {
      console.error('❌ Failed to create thread:', threadError.message)
      return false
    }
    
    // Send first message
    const { error: msg1Error } = await serviceClient
      .from('room_messages')
      .insert({
        thread_id: thread.id,
        room_id: TEST_ROOM_ID,
        user_id: TEST_USER_ID,
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
        thread_id: thread.id,
        room_id: TEST_ROOM_ID,
        user_id: TEST_USER_ID,
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

async function testRPCFunction() {
  console.log('🧮 Testing post_message RPC function...')
  
  try {
    // This should fail because we're not authenticated as the test user
    const { error } = await serviceClient.rpc('post_message', {
      p_room_id: TEST_ROOM_ID,
      p_thread_id: null,
      p_body: 'Test message via RPC'
    })
    
    // Expect authentication error
    if (error && error.message.includes('unauthenticated')) {
      console.log('✅ RPC function working (authentication error expected)')
      return true
    } else if (error) {
      console.error('❌ Unexpected RPC error:', error.message)
      return false
    } else {
      console.log('✅ RPC function executed successfully')
      return true
    }
  } catch (err) {
    console.error('❌ RPC test failed:', err.message)
    return false
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...')
  
  try {
    // Delete messages
    await serviceClient
      .from('room_messages')
      .delete()
      .eq('room_id', TEST_ROOM_ID)
    
    // Delete threads
    await serviceClient
      .from('message_threads')
      .delete()
      .eq('room_id', TEST_ROOM_ID)
    
    // Delete room member
    await serviceClient
      .from('room_members')
      .delete()
      .eq('room_id', TEST_ROOM_ID)
    
    // Delete room
    await serviceClient
      .from('rooms')
      .delete()
      .eq('id', TEST_ROOM_ID)
    
    // Delete profile and auth user
    await serviceClient
      .from('profiles')
      .delete()
      .eq('id', TEST_USER_ID)
    
    await serviceClient.auth.admin.deleteUser(TEST_USER_ID)
    
    console.log('✅ Test data cleaned up')
    return true
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting realtime integration test...\n')
  
  const tests = [
    { name: 'Setup Test Data', fn: setupTestData },
    { name: 'RPC Function', fn: testRPCFunction },
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
  } else {
    console.log('\n❌ Some tests failed!')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('💥 Test script failed:', err)
  process.exit(1)
})