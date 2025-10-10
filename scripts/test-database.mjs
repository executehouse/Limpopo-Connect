#!/usr/bin/env node
/**
 * Database Trigger Test
 * 
 * This script tests if our database triggers are working
 * by inserting data and checking if audit records are created
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testDatabaseTriggers() {
  console.log('🔧 Testing database triggers...')
  
  const testUserId = crypto.randomUUID()
  const testRoomId = crypto.randomUUID()
  const testThreadId = crypto.randomUUID()
  
  try {
    // Create test user in auth.users first
    const { error: authError } = await serviceClient.auth.admin.createUser({
      user_id: testUserId,
      email: `test${Date.now()}@test.com`,
      email_confirm: true
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Failed to create test user:', authError.message)
      return false
    }
    
    // Wait for profile trigger
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Create test room
    const { error: roomError } = await serviceClient
      .from('rooms')
      .insert({
        id: testRoomId,
        name: 'Test Room',
        created_by: testUserId
      })
    
    if (roomError) {
      console.error('❌ Failed to create test room:', roomError.message)
      return false
    }
    
    // Create test thread
    const { error: threadError } = await serviceClient
      .from('message_threads')
      .insert({
        id: testThreadId,
        room_id: testRoomId,
        created_by: testUserId,
        subject: 'Test Thread'
      })
    
    if (threadError) {
      console.error('❌ Failed to create test thread:', threadError.message)
      return false
    }
    
    // Insert a test message
    const messageId = crypto.randomUUID()
    const { error: messageError } = await serviceClient
      .from('room_messages')
      .insert({
        id: messageId,
        thread_id: testThreadId,
        room_id: testRoomId,
        user_id: testUserId,
        body: 'Test message for trigger validation'
      })
    
    if (messageError) {
      console.error('❌ Failed to insert message:', messageError.message)
      return false
    }
    
    console.log('✅ Message inserted successfully')
    
    // Wait a moment for triggers to fire
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if audit record was created
    const { data: auditRecords, error: auditError } = await serviceClient
      .from('room_messages_audit')
      .select('*')
      .eq('message_id', messageId)
    
    if (auditError) {
      console.error('❌ Failed to query audit records:', auditError.message)
      return false
    }
    
    if (auditRecords.length === 0) {
      console.error('❌ No audit record created - triggers may not be working')
      return false
    }
    
    console.log('✅ Audit trigger working - found', auditRecords.length, 'audit records')
    
    // Clean up in reverse order
    await serviceClient.from('room_messages').delete().eq('id', messageId)
    await serviceClient.from('message_threads').delete().eq('id', testThreadId)
    await serviceClient.from('rooms').delete().eq('id', testRoomId)
    await serviceClient.auth.admin.deleteUser(testUserId)
    
    console.log('✅ Test data cleaned up')
    return true
  } catch (err) {
    console.error('❌ Trigger test failed:', err.message)
    return false
  }
}

async function testRPCFunction() {
  console.log('🧮 Testing RPC function availability...')
  
  try {
    // Try to call the function (should fail with auth error, but function should exist)
    const { error } = await serviceClient.rpc('post_message', {
      p_room_id: crypto.randomUUID(),
      p_thread_id: null,
      p_body: 'Test message'
    })
    
    if (error) {
      if (error.message.includes('unauthenticated')) {
        console.log('✅ RPC function exists (authentication error expected)')
        return true
      } else {
        console.error('❌ Unexpected RPC error:', error.message)
        return false
      }
    } else {
      console.log('✅ RPC function executed successfully')
      return true
    }
  } catch (err) {
    if (err.message.includes('unauthenticated')) {
      console.log('✅ RPC function exists (authentication error expected)')
      return true
    } else {
      console.error('❌ RPC test failed:', err.message)
      return false
    }
  }
}

async function main() {
  console.log('🚀 Starting database functionality test...\n')
  
  const tests = [
    { name: 'Database Triggers', fn: testDatabaseTriggers },
    { name: 'RPC Function', fn: testRPCFunction }
  ]
  
  let allPassed = true
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`)
    const passed = await test.fn()
    if (!passed) {
      allPassed = false
    }
  }
  
  if (allPassed) {
    console.log('\n🎉 All database tests passed!')
    console.log('✅ Database schema and triggers are working correctly')
    console.log('✅ Ready to proceed with client integration')
  } else {
    console.log('\n❌ Some tests failed!')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('💥 Test script failed:', err)
  process.exit(1)
})