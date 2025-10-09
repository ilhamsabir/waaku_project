#!/usr/bin/env node

/**
 * Unified API Key Test
 * Test that both authentication and Chatwoot webhook use the same VITE_API_KEY
 */

require('dotenv').config()
const axios = require('axios')
const crypto = require('crypto')

const WAAKU_URL = process.env.WAAKU_URL || 'http://localhost:4300'
const API_KEY = process.env.VITE_API_KEY
const CHATWOOT_WEBHOOK_SECRET = process.env.CHATWOOT_WEBHOOK_SECRET || process.env.VITE_API_KEY

async function testUnifiedApiKey() {
    console.log('🔑 Testing Unified API Key System...\n')

    if (!API_KEY) {
        console.error('❌ VITE_API_KEY not found in .env file')
        process.exit(1)
    }

    console.log('✅ Configuration:')
    console.log('  WAAKU_URL:', WAAKU_URL)
    console.log('  VITE_API_KEY:', API_KEY)
    console.log('  CHATWOOT_WEBHOOK_SECRET:', CHATWOOT_WEBHOOK_SECRET)
    console.log('  🎯 Both secrets are the same:', API_KEY === CHATWOOT_WEBHOOK_SECRET ? '✅ YES' : '❌ NO')
    console.log()

    try {
        // Test 1: API Authentication
        console.log('1️⃣ Testing API authentication with VITE_API_KEY...')
        const sessionsResponse = await axios.get(`${WAAKU_URL}/api/sessions`, {
            headers: {
                'X-API-Key': API_KEY
            }
        })
        console.log('✅ API authentication works')
        console.log()

        // Test 2: Chatwoot Health Check
        console.log('2️⃣ Testing Chatwoot integration...')
        const chatwootHealthResponse = await axios.get(`${WAAKU_URL}/api/chatwoot/health`, {
            headers: {
                'X-API-Key': API_KEY
            }
        })
        console.log('✅ Chatwoot endpoint accessible')
        console.log('   Chatwoot configured:', chatwootHealthResponse.data.chatwoot_configured)
        console.log()

        // Test 3: Simulate Chatwoot Webhook with unified secret
        console.log('3️⃣ Testing Chatwoot webhook signature verification...')

        const webhookPayload = {
            event: 'message_created',
            data: {
                id: 12345,
                content: 'Test message from agent',
                message_type: 'outgoing',
                conversation: {
                    id: 1,
                    inbox_id: parseInt(process.env.INBOX_ID || '1')
                },
                sender: {
                    type: 'User',
                    name: 'Agent Test'
                }
            }
        }

        const payloadString = JSON.stringify(webhookPayload)
        const signature = crypto
            .createHmac('sha256', CHATWOOT_WEBHOOK_SECRET)
            .update(payloadString)
            .digest('hex')

        console.log('   📦 Webhook payload prepared')
        console.log('   🔐 Signature generated with unified secret')

        const webhookResponse = await axios.post(`${WAAKU_URL}/api/chatwoot/webhook`, webhookPayload, {
            headers: {
                'X-API-Key': API_KEY,
                'X-Chatwoot-Signature': signature,
                'Content-Type': 'application/json'
            }
        })

        console.log('✅ Webhook signature verification works')
        console.log('   Response:', webhookResponse.data.message)
        console.log()

        console.log('🎉 All tests passed!')
        console.log()
        console.log('✅ Unified API Key System Working:')
        console.log('   - Single VITE_API_KEY for all authentication')
        console.log('   - Same key used for API and Chatwoot webhooks')
        console.log('   - No need for separate secrets')
        console.log()
        console.log('📋 Your unified setup:')
        console.log(`   VITE_API_KEY: ${API_KEY}`)
        console.log(`   CHATWOOT_WEBHOOK_SECRET: ${CHATWOOT_WEBHOOK_SECRET}`)
        console.log('   🎯 Both use the same value!')

    } catch (error) {
        console.error('❌ Test failed!')

        if (error.response) {
            console.error('HTTP Status:', error.response.status)
            console.error('Error Response:', error.response.data)

            if (error.response.status === 401) {
                console.error('\n💡 Authentication failed:')
                console.error('   - Check your VITE_API_KEY value')
                console.error('   - Make sure server is running with updated config')
                console.error('   - Restart WAAKU server if needed')
            } else if (error.response.status === 400) {
                console.error('\n💡 Webhook verification failed:')
                console.error('   - Check CHATWOOT_WEBHOOK_SECRET configuration')
                console.error('   - Ensure it matches VITE_API_KEY if not explicitly set')
            }
        } else if (error.request) {
            console.error('Network Error:', error.message)
            console.error('\n💡 Connection error:')
            console.error('   - Make sure WAAKU server is running')
            console.error('   - Check WAAKU_URL:', WAAKU_URL)
        } else {
            console.error('Error:', error.message)
        }

        process.exit(1)
    }
}

if (require.main === module) {
    testUnifiedApiKey()
}

module.exports = { testUnifiedApiKey }
