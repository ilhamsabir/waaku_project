# Waaku Examples

This directory contains example code and integrations for Waaku.

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
