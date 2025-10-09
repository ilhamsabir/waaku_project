/**
 * @swagger
 * tags:
 *   - name: Webhooks
 *     description: Webhook integration for real-time message notifications
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WebhookPayload:
 *       type: object
 *       description: |
 *         Webhook payload sent to configured webhook URL when message events occur.
 *
 *         **Webhook Headers:**
 *         - `Content-Type: application/json`
 *         - `User-Agent: Waaku-Webhook/1.0`
 *         - `X-Webhook-Secret: your-secret` (if WEBHOOK_SECRET is configured)
 *
 *         **Events Triggered:**
 *         - `message_received`: Any incoming message (not a reply)
 *         - `message_reply`: Incoming message that quotes another message
 *       properties:
 *         event:
 *           type: string
 *           enum: [message_received, message_reply]
 *           description: Type of webhook event
 *           example: 'message_received'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Event timestamp in ISO format
 *           example: '2025-10-09T10:30:00.000Z'
 *         data:
 *           $ref: '#/components/schemas/MessageData'
 *       example:
 *         event: 'message_received'
 *         timestamp: '2025-10-09T10:30:00.000Z'
 *         data:
 *           sessionId: 'session-1'
 *           messageId: 'msg_12345'
 *           from: '628123456789@c.us'
 *           to: '628987654321@c.us'
 *           body: 'Hello, this is a test message'
 *           timestamp: 1696681800000
 *           isReply: false
 *           quotedMessage: null
 *           contact:
 *             name: 'John Doe'
 *             number: '628123456789'
 *             isMyContact: true
 *           chat:
 *             name: 'John Doe'
 *             isGroup: false
 *             participantCount: null
 *
 * /webhooks/example:
 *   post:
 *     tags: [Webhooks]
 *     summary: Example webhook endpoint
 *     description: |
 *       This is an example of how your webhook endpoint should handle incoming webhook payloads from WAAKU.
 *
 *       **Implementation Notes:**
 *       - Your endpoint should return HTTP 200 for successful processing
 *       - Verify webhook secret if configured (X-Webhook-Secret header)
 *       - Handle both `message_received` and `message_reply` events
 *       - Implement retry logic for failed webhook deliveries
 *       - Consider using a queue for processing webhook events asynchronously
 *
 *       **Example Implementation:**
 *       ```javascript
 *       app.post('/webhook', (req, res) => {
 *         const { event, timestamp, data } = req.body;
 *
 *         // Verify webhook secret
 *         const receivedSecret = req.headers['x-webhook-secret'];
 *         if (expectedSecret && receivedSecret !== expectedSecret) {
 *           return res.status(401).json({ error: 'Invalid webhook secret' });
 *         }
 *
 *         // Process the event
 *         if (event === 'message_received') {
 *           console.log('New message:', data.body);
 *         } else if (event === 'message_reply') {
 *           console.log('Reply to:', data.quotedMessage.body);
 *         }
 *
 *         res.status(200).json({ success: true });
 *       });
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Webhook processed successfully'
 *       401:
 *         description: Invalid webhook secret
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid webhook secret'
 *       500:
 *         description: Webhook processing failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Internal server error'
 */
