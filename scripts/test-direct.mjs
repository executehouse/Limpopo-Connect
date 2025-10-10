#!/usr/bin/env node
/**
 * Simple Database Test
 * Test direct database operations to isolate the updated_at issue
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testDirectInsert() {
  console.log('🔧 Testing direct message insert...')
  
  try {
    // Create test user
    const { data: user, error: userError } = await serviceClient.auth.admin.createUser({
      email: 'test@test.com',
      password: 'test123',
      email_confirm: true
    })
    
    if (userError) throw userError
    console.log('✅ Test user created:', user.user.id)
    
    // Create room
    const { data: room, error: roomError } = await serviceClient
      .from('rooms')
      .insert({
        name: 'Test Room Direct',
        created_by: user.user.id
      })
      .select()
      .single()
    
    if (roomError) throw roomError
    console.log('✅ Room created:', room.id)
    
    // Create thread
    const { data: thread, error: threadError } = await serviceClient
      .from('message_threads')
      .insert({
        room_id: room.id,
        created_by: user.user.id,
        subject: 'Test Thread Direct'
      })
      .select()
      .single()
    
    if (threadError) throw threadError
    console.log('✅ Thread created:', thread.id)
    
    // Insert message directly
    const { data: message, error: messageError } = await serviceClient
      .from('room_messages')
      .insert({
        thread_id: thread.id,
        room_id: room.id,
        user_id: user.user.id,
        body: 'Test message direct insert'
      })
      .select()
      .single()
    
    if (messageError) {
      console.error('❌ Direct insert error:', messageError)
      throw messageError
    }
    
    console.log('✅ Message inserted directly:', message.id)
    console.log('✅ All direct operations successful!')
    
    // Cleanup
    await serviceClient.from('room_messages').delete().eq('id', message.id)
    await serviceClient.from('message_threads').delete().eq('id', thread.id)
    await serviceClient.from('rooms').delete().eq('id', room.id)
    await serviceClient.auth.admin.deleteUser(user.user.id)
    console.log('✅ Cleanup complete')
    
    return true
  } catch (err) {
    console.error('❌ Direct insert test failed:', err.message)
    return false
  }
}

testDirectInsert().then(success => {
  if (success) {
    console.log('\n✅ Direct database operations work correctly!')
    console.log('The issue may be specific to the RPC function or client-side operations.')
  } else {
    console.log('\n❌ Database has fundamental issues that need to be resolved.')
  }
})