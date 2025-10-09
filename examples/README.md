# Waaku Examples

This directory contains example code and integrations for Waaku.

## Chatwoot Integration Test

`chatwoot-test.js` - A test script to verify your Chatwoot configuration and API connectivity.

### Setup

1. Configure your Chatwoot credentials in `.env`:
   ```bash
   CHATWOOT_URL=https://app.chatwoot.com
   CHATWOOT_TOKEN=your_api_token
   ACCOUNT_ID=1
   INBOX_ID=1
   ```

2. Run the test:
   ```bash
   node examples/chatwoot-test.js
   ```

### What it tests

- ✅ Account access with your API token
- ✅ Inbox access and configuration
- ✅ Contact creation capability
- ✅ Conversation creation capability
- ✅ Message sending functionality
- 🧹 Automatic cleanup of test data

This script helps you verify your Chatwoot setup before enabling the integration in Waaku.

## Chatwoot Bidirectional Integration Test

`chatwoot-bidirectional-test.js` - Complete test for bidirectional Chatwoot integration including agent replies.

### Setup

1. Configure all Chatwoot credentials plus webhook secret in `.env`:
   ```bash
   CHATWOOT_URL=https://app.chatwoot.com
   CHATWOOT_TOKEN=your_api_token
   ACCOUNT_ID=1
   INBOX_ID=1
   CHATWOOT_WEBHOOK_SECRET=your-webhook-secret
   WAAKU_URL=http://localhost:4300
   VITE_API_KEY=your-api-key
   ```

2. Run the bidirectional test:
   ```bash
   node examples/chatwoot-bidirectional-test.js
   ```

### What it tests

- ✅ WAAKU server health and availability
- ✅ Chatwoot webhook endpoint configuration
- ✅ Webhook payload processing (simulated agent reply)
- ✅ WhatsApp session availability for sending
- ✅ Complete bidirectional message flow
- 📋 Provides Chatwoot webhook configuration guide

This comprehensive test verifies that agents can reply from Chatwoot and messages will be automatically sent to WhatsApp contacts.

## Webhook Example

`webhook-example.js` - A simple Express.js server that demonstrates how to receive and process webhook notifications from Waaku.

### Setup

1. Install dependencies:
   ```bash
   npm install express
   ```

2. Run the webhook server:
   ```bash
   node examples/webhook-example.js
   ```

3. Configure Waaku to send webhooks to your server:
   ```bash
   # Add to your Waaku .env file
   WEBHOOK_URL=http://localhost:3001/webhook
   WEBHOOK_SECRET=optional-secret-key
   ```

### Features

- Receives and logs message replies and new messages
- Provides examples for custom handling logic
- Includes health check endpoint
- Demonstrates webhook payload structure

### Webhook Events

- `message_reply` - When someone replies to a message
- `message_received` - When a new message is received

### Integration Ideas

- **Customer Support**: Log conversations to your CRM system
- **Notifications**: Send alerts to Slack, Discord, or email
- **Automation**: Trigger automated responses or workflows
- **Analytics**: Track message volumes and response times
- **AI Integration**: Process messages with ChatGPT or other AI services

### Security

For production use, consider:
- Using HTTPS endpoints
- Validating webhook signatures with `WEBHOOK_SECRET`
- Rate limiting webhook endpoints
- Implementing proper error handling and retries
