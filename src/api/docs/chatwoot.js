/**
 * @swagger
 * tags:
 *   - name: Chatwoot
 *     description: Chatwoot integration endpoints for agent replies
 */

/**
 * @swagger
 * /api/chatwoot/webhook:
 *   post:
 *     tags: [Chatwoot]
 *     summary: Chatwoot webhook for agent replies
 *     description: |
 *       Webhook endpoint that receives notifications from Chatwoot when agents reply to conversations.
 *       This enables bidirectional communication where agent replies in Chatwoot are automatically
 *       sent to WhatsApp contacts.
 *
 *       **Setup in Chatwoot:**
 *       1. Go to Settings → Integrations → Webhooks
 *       2. Add webhook URL: `https://your-waaku-domain.com/api/chatwoot/webhook`
 *       3. Set webhook secret (optional but recommended)
 *       4. Enable "Message Created" events
 *       5. Save configuration
 *
 *       **Event Processing:**
 *       - Only processes `message_created` events
 *       - Only handles outgoing messages from human agents
 *       - Ignores bot messages and incoming messages
 *       - Automatically finds available WhatsApp session to send message
 *
 *       **Requirements:**
 *       - At least one WhatsApp session must be in 'ready' state
 *       - Contact phone number must be extractable from conversation
 *       - Message content must not be empty
 *
 *       **Security:**
 *       - Supports webhook secret verification via `X-Webhook-Secret` header
 *       - All requests require WAAKU API key authentication
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatwootWebhookPayload'
 *           examples:
 *             agent_reply:
 *               summary: Agent reply to customer
 *               value:
 *                 event_type: 'message_created'
 *                 event_data:
 *                   id: 12345
 *                   content: 'Thank you for contacting us. How can I help you today?'
 *                   message_type: 'outgoing'
 *                   sender_type: 'User'
 *                   conversation:
 *                     id: 1001
 *                     contact_inbox:
 *                       source_id: '628123456789'
 *                   sender:
 *                     name: 'Agent John'
 *                     email: 'john@company.com'
 *     responses:
 *       200:
 *         description: Agent reply sent to WhatsApp successfully
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
 *                   example: 'Agent reply sent to WhatsApp'
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: 'session-1'
 *                     whatsappId:
 *                       type: string
 *                       example: '628123456789@c.us'
 *                     conversationId:
 *                       type: number
 *                       example: 1001
 *                     messageId:
 *                       type: string
 *                       example: 'msg_abc123'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_data:
 *                 summary: Missing required data
 *                 value:
 *                   error: 'Missing message content or contact phone'
 *       401:
 *         description: Unauthorized - Invalid API key or webhook secret
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_secret:
 *                 summary: Invalid webhook secret
 *                 value:
 *                   error: 'Invalid webhook secret'
 *       503:
 *         description: Service unavailable - No ready WhatsApp session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_session:
 *                 summary: No ready session available
 *                 value:
 *                   error: 'No ready WhatsApp session available'
 *
 * /api/chatwoot/health:
 *   get:
 *     tags: [Chatwoot]
 *     summary: Chatwoot integration health check
 *     description: |
 *       Check the health and configuration status of Chatwoot integration.
 *       Returns information about webhook endpoint availability and supported events.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Chatwoot integration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'healthy'
 *                 chatwoot_configured:
 *                   type: boolean
 *                   example: true
 *                 webhook_endpoint:
 *                   type: string
 *                   example: '/api/chatwoot/webhook'
 *                 supported_events:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ['message_created']
 *                 requirements:
 *                   type: object
 *                   properties:
 *                     event_type:
 *                       type: string
 *                       example: 'message_created'
 *                     message_type:
 *                       type: string
 *                       example: 'outgoing'
 *                     sender_type:
 *                       type: string
 *                       example: 'User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
