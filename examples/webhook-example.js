#!/usr/bin/env node

/**
 * Example webhook handler for Waaku message notifications
 *
 * This is a simple Express.js server that receives webhook notifications
 * from Waaku when messages or replies are received.
 *
 * Usage:
 * 1. npm install express
 * 2. node webhook-example.js
 * 3. Set WEBHOOK_URL=http://localhost:3001/webhook in your Waaku .env
 */

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3001

// Middleware to parse JSON
app.use(express.json())

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const { event, timestamp, data } = req.body

  console.log(`\n🔔 Webhook received: ${event}`)
  console.log(`⏰ Timestamp: ${timestamp}`)
  console.log(`📱 Session: ${data.sessionId}`)

  switch (event) {
    case 'message_reply':
      console.log(`💬 Reply from: ${data.contact.name || data.contact.number}`)
      console.log(`📝 Reply text: "${data.body}"`)
      console.log(`🔗 Replying to: "${data.quotedMessage.body}"`)

      // Your custom logic for handling replies
      handleReply(data)
      break

    case 'message_received':
      if (!data.isReply) {
        console.log(`📨 New message from: ${data.contact.name || data.contact.number}`)
        console.log(`📝 Message: "${data.body}"`)

        // Your custom logic for handling new messages
        handleNewMessage(data)
      }
      break

    default:
      console.log(`❓ Unknown event: ${event}`)
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ success: true, received: event })
})

// Custom handler for reply messages
function handleReply(data) {
  // Example: Log to database, send notification, trigger automation, etc.
  console.log(`🤖 Processing reply from ${data.contact.number}...`)

  // You could integrate with:
  // - Database to store conversation history
  // - Notification services (email, Slack, Discord)
  // - AI services for automated responses
  // - CRM systems to update customer interactions
}

// Custom handler for new messages
function handleNewMessage(data) {
  // Example: Auto-respond, log lead, trigger workflow, etc.
  console.log(`🤖 Processing new message from ${data.contact.number}...`)

  // Example auto-response logic:
  if (data.body.toLowerCase().includes('hello') || data.body.toLowerCase().includes('hi')) {
    console.log(`👋 Detected greeting, could trigger auto-response...`)
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`)
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
  console.log(`\n💡 Set this in your Waaku .env:`)
  console.log(`   WEBHOOK_URL=http://localhost:${PORT}/webhook`)
  console.log(`\n⏳ Waiting for webhook notifications...`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down webhook server...')
  process.exit(0)
})
