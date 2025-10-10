#!/usr/bin/env node
/**
 * Basic Realtime Connection Test
 */

import { createClient } from '@supabase/supabase-js'
import { setTimeout } from 'timers/promises'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  console.log('🔌 Testing realtime connection...')
  
  // Test basic realtime connection
  client.realtime.onOpen(() => {
    console.log('✅ Realtime connection opened')
  })
  
  client.realtime.onClose(() => {
    console.log('🔌 Realtime connection closed')
  })
  
  client.realtime.onError((error) => {
    console.error('❌ Realtime error:', error)
  })
  
  // Simple channel test
  const channel = client.channel('test-channel')
    .subscribe((status) => {
      console.log('📡 Channel status:', status)
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to test channel')
        setTimeout(2000).then(() => {
          client.removeChannel(channel)
          console.log('✅ Test completed successfully')
          process.exit(0)
        })
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel subscription failed')
        process.exit(1)
      }
    })
  
  // Timeout after 10 seconds
  setTimeout(10000).then(() => {
    console.error('❌ Test timed out')
    process.exit(1)
  })
}

main().catch(err => {
  console.error('💥 Test failed:', err)
  process.exit(1)
})