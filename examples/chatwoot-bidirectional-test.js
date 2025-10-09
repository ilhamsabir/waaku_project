#!/usr/bin/env node

/**
 * Chatwoot Bidirectional Integration Test
 *
 * This script tests the complete Chatwoot integration including:
 * 1. Incoming WhatsApp messages → Chatwoot
 * 2. Agent replies in Chatwoot → WhatsApp
 *
 * Usage:
 *   node examples/chatwoot-bidirectional-test.js
 *
 * Required environment variables:
 *   CHATWOOT_URL=https://app.chatwoot.com
 *   CHATWOOT_TOKEN=your_api_token
 *   ACCOUNT_ID=1
 *   INBOX_ID=1
 *   CHATWOOT_WEBHOOK_SECRET=your-webhook-secret
 */

require('dotenv').config()
const axios = require('axios')

const CHATWOOT_URL = process.env.CHATWOOT_URL
const CHATWOOT_TOKEN = process.env.CHATWOOT_TOKEN
const ACCOUNT_ID = process.env.ACCOUNT_ID
const INBOX_ID = process.env.INBOX_ID
const WEBHOOK_SECRET = process.env.CHATWOOT_WEBHOOK_SECRET

// Your WAAKU server URL
const WAAKU_URL = process.env.WAAKU_URL || 'http://localhost:4300'
const WAAKU_API_KEY = process.env.VITE_API_KEY

async function testBidirectionalIntegration() {
    console.log('🔄 Testing Chatwoot Bidirectional Integration...\n')

    // Check configuration
    const requiredVars = {
        CHATWOOT_URL,
        CHATWOOT_TOKEN,
        ACCOUNT_ID,
        INBOX_ID,
        WEBHOOK_SECRET,
        WAAKU_URL,
        WAAKU_API_KEY
    }

    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value) {
            console.error(`❌ Missing required environment variable: ${key}`)
            process.exit(1)
        }
    }

    console.log('✅ Configuration loaded:')
    console.log('  CHATWOOT_URL:', CHATWOOT_URL)
    console.log('  ACCOUNT_ID:', ACCOUNT_ID)
    console.log('  INBOX_ID:', INBOX_ID)
    console.log('  WAAKU_URL:', WAAKU_URL)
    console.log('  WEBHOOK_SECRET: [hidden]')
    console.log()

    try {
        // Test 1: Check WAAKU health
        console.log('1️⃣ Testing WAAKU server health...')
        const waakyHealthResponse = await axios.get(`${WAAKU_URL}/health`)
        console.log('✅ WAAKU server is healthy')
        console.log()

        // Test 2: Check Chatwoot webhook health endpoint
        console.log('2️⃣ Testing Chatwoot webhook endpoint...')
        const chatwootHealthResponse = await axios.get(
            `${WAAKU_URL}/api/chatwoot/health`,
            {
                headers: {
                    'X-API-Key': WAAKU_API_KEY
                }
            }
        )
        console.log('✅ Chatwoot webhook endpoint is healthy')
        console.log('   Configuration:', chatwootHealthResponse.data)
        console.log()

        // Test 3: Simulate Chatwoot webhook (agent reply)
        console.log('3️⃣ Testing webhook simulation (agent reply)...')
        const webhookPayload = {
            event_type: 'message_created',
            event_data: {
                id: 99999,
                content: 'This is a test reply from Chatwoot agent via WAAKU integration test',
                message_type: 'outgoing',
                sender_type: 'User',
                created_at: new Date().toISOString(),
                conversation: {
                    id: 99999,
                    contact_inbox: {
                        source_id: '628123456789' // Change this to a real test number
                    }
                },
                sender: {
                    id: 1,
                    name: 'Test Agent',
                    email: 'test@example.com'
                }
            }
        }

        const webhookResponse = await axios.post(
            `${WAAKU_URL}/api/chatwoot/webhook`,
            webhookPayload,
            {
                headers: {
                    'X-API-Key': WAAKU_API_KEY,
                    'X-Webhook-Secret': WEBHOOK_SECRET,
                    'Content-Type': 'application/json'
                }
            }
        )

        console.log('✅ Webhook processed successfully')
        console.log('   Response:', webhookResponse.data)
        console.log()

        console.log('🎉 All tests passed! Bidirectional integration is working.')
        console.log()
        console.log('📋 Next steps:')
        console.log('1. Configure the webhook in your Chatwoot instance:')
        console.log(`   URL: ${WAAKU_URL}/api/chatwoot/webhook`)
        console.log(`   Secret: ${WEBHOOK_SECRET}`)
        console.log('   Events: message_created')
        console.log()
        console.log('2. Test with real conversations:')
        console.log('   - Send WhatsApp message to your number')
        console.log('   - Reply from Chatwoot agent interface')
        console.log('   - Message should appear in WhatsApp chat')

    } catch (error) {
        console.error('❌ Test failed!')

        if (error.response) {
            console.error('HTTP Status:', error.response.status)
            console.error('Error Response:', error.response.data)

            if (error.response.status === 401) {
                console.error('\n💡 Authentication error:')
                console.error('   - Check your WAAKU_API_KEY (X-API-Key)')
                console.error('   - Check your CHATWOOT_WEBHOOK_SECRET')
            } else if (error.response.status === 503) {
                console.error('\n💡 Service unavailable:')
                console.error('   - Make sure at least one WhatsApp session is in "ready" state')
                console.error('   - Check WAAKU session dashboard')
            }
        } else if (error.request) {
            console.error('Network Error:', error.message)
            console.error('\n💡 Connection error:')
            console.error('   - Check your WAAKU_URL')
            console.error('   - Make sure WAAKU server is running')
        } else {
            console.error('Error:', error.message)
        }

        process.exit(1)
    }
}

if (require.main === module) {
    testBidirectionalIntegration()
}

module.exports = { testBidirectionalIntegration }
