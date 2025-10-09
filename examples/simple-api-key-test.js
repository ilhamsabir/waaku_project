#!/usr/bin/env node

/**
 * Simple API Key Test
 * Test the simplified API key system using VITE_API_KEY only
 */

require('dotenv').config()
const axios = require('axios')

const WAAKU_URL = process.env.WAAKU_URL || 'http://localhost:4300'
const API_KEY = process.env.VITE_API_KEY

async function testSimpleApiKey() {
    console.log('🔑 Testing Simplified API Key System...\n')

    if (!API_KEY) {
        console.error('❌ VITE_API_KEY not found in .env file')
        process.exit(1)
    }

    console.log('✅ Configuration:')
    console.log('  WAAKU_URL:', WAAKU_URL)
    console.log('  API_KEY:', API_KEY)
    console.log()

    try {
        // Test 1: Health endpoint (no auth required)
        console.log('1️⃣ Testing public health endpoint...')
        const healthResponse = await axios.get(`${WAAKU_URL}/health`)
        console.log('✅ Public health endpoint works')
        console.log()

        // Test 2: Protected API endpoint with VITE_API_KEY
        console.log('2️⃣ Testing protected endpoint with VITE_API_KEY...')
        const sessionsResponse = await axios.get(`${WAAKU_URL}/api/sessions`, {
            headers: {
                'X-API-Key': API_KEY
            }
        })
        console.log('✅ Protected endpoint works with VITE_API_KEY')
        console.log('   Sessions found:', sessionsResponse.data.length)
        console.log()

        // Test 3: Chatwoot health endpoint
        console.log('3️⃣ Testing Chatwoot integration endpoint...')
        const chatwootHealthResponse = await axios.get(`${WAAKU_URL}/api/chatwoot/health`, {
            headers: {
                'X-API-Key': API_KEY
            }
        })
        console.log('✅ Chatwoot endpoint works')
        console.log('   Chatwoot configured:', chatwootHealthResponse.data.chatwoot_configured)
        console.log()

        console.log('🎉 All tests passed!')
        console.log()
        console.log('✅ Simplified API Key System Working:')
        console.log('   - Frontend and Backend use same VITE_API_KEY')
        console.log('   - No need for separate WAAKU_API_KEY')
        console.log('   - Single key for all authentication')
        console.log()
        console.log('📋 Your current setup:')
        console.log(`   X-API-Key: ${API_KEY}`)
        console.log('   Use this key for all API calls!')

    } catch (error) {
        console.error('❌ Test failed!')

        if (error.response) {
            console.error('HTTP Status:', error.response.status)
            console.error('Error Response:', error.response.data)

            if (error.response.status === 401) {
                console.error('\n💡 Authentication failed:')
                console.error('   - Check your VITE_API_KEY value')
                console.error('   - Make sure server is using the updated auth system')
                console.error('   - Restart WAAKU server if you just updated the code')
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
    testSimpleApiKey()
}

module.exports = { testSimpleApiKey }
