#!/usr/bin/env node

/**
 * Chatwoot Integration Test Script
 *
 * This script helps you test your Chatwoot configuration and verify
 * that WAAKU can successfully connect to your Chatwoot instance.
 *
 * Usage:
 *   node examples/chatwoot-test.js
 *
 * Make sure to set these environment variables:
 *   CHATWOOT_URL=https://app.chatwoot.com
 *   CHATWOOT_TOKEN=your_api_token
 *   ACCOUNT_ID=1
 *   INBOX_ID=1
 */

require('dotenv').config()
const axios = require('axios')

const CHATWOOT_URL = process.env.CHATWOOT_URL
const CHATWOOT_TOKEN = process.env.CHATWOOT_TOKEN
const ACCOUNT_ID = process.env.ACCOUNT_ID
const INBOX_ID = process.env.INBOX_ID

async function testChatwootConnection() {
    console.log('🔍 Testing Chatwoot Integration...\n')

    // Check configuration
    if (!CHATWOOT_URL || !CHATWOOT_TOKEN || !ACCOUNT_ID || !INBOX_ID) {
        console.error('❌ Missing Chatwoot configuration!')
        console.log('Required environment variables:')
        console.log('  CHATWOOT_URL =', CHATWOOT_URL || '(missing)')
        console.log('  CHATWOOT_TOKEN =', CHATWOOT_TOKEN ? '[hidden]' : '(missing)')
        console.log('  ACCOUNT_ID =', ACCOUNT_ID || '(missing)')
        console.log('  INBOX_ID =', INBOX_ID || '(missing)')
        process.exit(1)
    }

    console.log('✅ Configuration loaded:')
    console.log('  CHATWOOT_URL:', CHATWOOT_URL)
    console.log('  CHATWOOT_TOKEN: [hidden]')
    console.log('  ACCOUNT_ID:', ACCOUNT_ID)
    console.log('  INBOX_ID:', INBOX_ID)
    console.log()

    try {
        // Test 1: Check account access
        console.log('1️⃣ Testing account access...')
        const accountResponse = await axios.get(
            `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}`,
            {
                headers: {
                    'api_access_token': CHATWOOT_TOKEN,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        )
        console.log('✅ Account access successful')
        console.log('   Account name:', accountResponse.data.name)
        console.log()

        // Test 2: Check inbox access
        console.log('2️⃣ Testing inbox access...')
        const inboxResponse = await axios.get(
            `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/inboxes/${INBOX_ID}`,
            {
                headers: {
                    'api_access_token': CHATWOOT_TOKEN,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        )
        console.log('✅ Inbox access successful')
        console.log('   Inbox name:', inboxResponse.data.name)
        console.log('   Inbox type:', inboxResponse.data.channel_type)
        console.log()

        // Test 3: Test contact creation (with cleanup)
        console.log('3️⃣ Testing contact creation...')
        const testPhone = `test${Date.now()}`
        const contactCreateResponse = await axios.post(
            `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts`,
            {
                name: `Test Contact ${testPhone}`,
                phone: testPhone,
                identifier: testPhone
            },
            {
                headers: {
                    'api_access_token': CHATWOOT_TOKEN,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        )
        const testContact = contactCreateResponse.data.payload.contact
        console.log('✅ Contact creation successful')
        console.log('   Contact ID:', testContact.id)
        console.log('   Contact name:', testContact.name)
        console.log()

        // Test 4: Test conversation creation
        console.log('4️⃣ Testing conversation creation...')
        const conversationResponse = await axios.post(
            `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations`,
            {
                source_id: `waaku_test_${testContact.id}_${Date.now()}`,
                inbox_id: parseInt(INBOX_ID),
                contact_id: testContact.id
            },
            {
                headers: {
                    'api_access_token': CHATWOOT_TOKEN,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        )
        const testConversation = conversationResponse.data
        console.log('✅ Conversation creation successful')
        console.log('   Conversation ID:', testConversation.id)
        console.log()

        // Test 5: Test message sending
        console.log('5️⃣ Testing message sending...')
        const messageResponse = await axios.post(
            `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${testConversation.id}/messages`,
            {
                content: 'Test message from WAAKU integration test',
                message_type: 'incoming',
                private: false
            },
            {
                headers: {
                    'api_access_token': CHATWOOT_TOKEN,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        )
        console.log('✅ Message sending successful')
        console.log('   Message ID:', messageResponse.data.id)
        console.log()

        // Cleanup: Delete test contact (this will also delete the conversation)
        console.log('🧹 Cleaning up test data...')
        await axios.delete(
            `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${testContact.id}`,
            {
                headers: {
                    'api_access_token': CHATWOOT_TOKEN,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        )
        console.log('✅ Test data cleaned up')
        console.log()

        console.log('🎉 All tests passed! Your Chatwoot integration is properly configured.')
        console.log()
        console.log('Next steps:')
        console.log('1. Start WAAKU with your Chatwoot configuration')
        console.log('2. Create a WhatsApp session')
        console.log('3. Send/receive messages to test the integration')

    } catch (error) {
        console.error('❌ Test failed!')

        if (error.response) {
            console.error('HTTP Status:', error.response.status)
            console.error('Error:', error.response.data)

            if (error.response.status === 401) {
                console.error('\n💡 This looks like an authentication error.')
                console.error('   Check your CHATWOOT_TOKEN - it may be invalid or expired.')
            } else if (error.response.status === 404) {
                console.error('\n💡 This looks like a "not found" error.')
                console.error('   Check your ACCOUNT_ID and INBOX_ID - they may be incorrect.')
            }
        } else if (error.request) {
            console.error('Network Error:', error.message)
            console.error('\n💡 Cannot reach Chatwoot server.')
            console.error('   Check your CHATWOOT_URL and internet connection.')
        } else {
            console.error('Error:', error.message)
        }

        process.exit(1)
    }
}

if (require.main === module) {
    testChatwootConnection()
}

module.exports = { testChatwootConnection }
