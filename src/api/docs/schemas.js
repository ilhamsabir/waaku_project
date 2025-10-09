/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique session identifier
 *           example: 'session-1'
 *         ready:
 *           type: boolean
 *           description: Whether the session is ready to send messages
 *           example: true
 *         status:
 *           type: string
 *           enum: [initializing, qr_received, authenticated, ready, disconnected, auth_failed]
 *           description: Current session status
 *           example: 'ready'
 *         clientState:
 *           type: string
 *           description: WhatsApp client state
 *           example: 'CONNECTED'
 *         error:
 *           type: string
 *           nullable: true
 *           description: Error message if any
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Session creation timestamp
 *           example: '2025-09-30T10:00:00.000Z'
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           description: Last activity timestamp
 *           example: '2025-09-30T10:30:00.000Z'
 *         uptime:
 *           type: number
 *           description: Session uptime in seconds
 *           example: 1800
 *
 *     SessionHealth:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Session ID
 *           example: 'session-1'
 *         status:
 *           type: string
 *           description: Current session status
 *           example: 'ready'
 *         clientState:
 *           type: string
 *           description: WhatsApp client state
 *           example: 'CONNECTED'
 *         ready:
 *           type: boolean
 *           description: Whether session is ready
 *           example: true
 *         healthy:
 *           type: boolean
 *           description: Whether session is healthy
 *           example: true
 *         uptime:
 *           type: number
 *           description: Session uptime in seconds
 *           example: 1800
 *         timeSinceLastActivity:
 *           type: number
 *           description: Time since last activity in seconds
 *           example: 30
 *         stale:
 *           type: boolean
 *           description: Whether session is stale
 *           example: false
 *
 *     HealthSummary:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy]
 *           description: Overall health status
 *           example: 'healthy'
 *         summary:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               description: Total number of sessions
 *               example: 3
 *             healthy:
 *               type: number
 *               description: Number of healthy sessions
 *               example: 2
 *             ready:
 *               type: number
 *               description: Number of ready sessions
 *               example: 2
 *             stale:
 *               type: number
 *               description: Number of stale sessions
 *               example: 0
 *             unhealthy:
 *               type: number
 *               description: Number of unhealthy sessions
 *               example: 1
 *         sessions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SessionHealth'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Health check timestamp
 *           example: '2025-09-30T10:30:00.000Z'
 *         overallHealth:
 *           type: boolean
 *           description: Overall system health
 *           example: true
 *
 *     GeneralHealth:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Service status
 *           example: 'healthy'
 *         service:
 *           type: string
 *           description: Service name
 *           example: 'WhatsApp Multi-Session Manager'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Health check timestamp
 *           example: '2025-09-30T10:30:00.000Z'
 *         uptime:
 *           type: number
 *           description: Server uptime in seconds
 *           example: 3600
 *         memory:
 *           type: object
 *           properties:
 *             rss:
 *               type: number
 *               example: 45056000
 *             heapTotal:
 *               type: number
 *               example: 28672000
 *             heapUsed:
 *               type: number
 *               example: 20480000
 *             external:
 *               type: number
 *               example: 1024000
 *         version:
 *           type: string
 *           description: API version
 *           example: '1.0.0'
 *
 *     CreateSessionRequest:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: Unique session identifier
 *           example: 'session-1'
 *
 *     ValidateNumberRequest:
 *       type: object
 *       required:
 *         - to
 *       properties:
 *         to:
 *           type: string
 *           description: Phone number to validate (international format)
 *           example: '6281234567890'
 *
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - to
 *         - message
 *       properties:
 *         to:
 *           type: string
 *           description: Recipient phone number (international format)
 *           example: '6281234567890'
 *         message:
 *           type: string
 *           description: Message text to send
 *           example: 'Hello, World!'
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Operation success status
 *           example: true
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *           example: 'Session not found'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Error timestamp
 *           example: '2025-09-30T10:30:00.000Z'
 *
 *     ValidationResponse:
 *       type: object
 *       properties:
 *         exists:
 *           type: boolean
 *           description: Whether the number exists on WhatsApp
 *           example: true
 *         number:
 *           type: string
 *           description: Validated number ID (only if exists)
 *           example: '6281234567890'
 *
 *     QRResponse:
 *       type: object
 *       properties:
 *         qr:
 *           type: string
 *           nullable: true
 *           description: Base64 encoded QR code image (data URL format)
 *           example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
 *
 *     RestartResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: 'Session restarted successfully'
 *         sessionId:
 *           type: string
 *           example: 'session-1'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: '2025-09-30T10:30:00.000Z'
 *
 *   responses:
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *
 *     InternalError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *
 *     SessionNotReady:
 *       description: Session is not ready
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - type: object
 *                 properties:
 *                   error:
 *                     example: 'session not ready'
 *
 *     WebhookEvent:
 *       type: object
 *       properties:
 *         event:
 *           type: string
 *           enum: [message_received, message_reply]
 *           description: Type of webhook event
 *           example: 'message_received'
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Event timestamp
 *           example: '2025-10-09T10:30:00.000Z'
 *         data:
 *           $ref: '#/components/schemas/MessageData'
 *
 *     MessageData:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *           description: Session ID that received the message
 *           example: 'session-1'
 *         messageId:
 *           type: string
 *           description: WhatsApp message ID
 *           example: 'message_12345'
 *         from:
 *           type: string
 *           description: Sender WhatsApp ID
 *           example: '628123456789@c.us'
 *         to:
 *           type: string
 *           description: Recipient WhatsApp ID
 *           example: '628987654321@c.us'
 *         body:
 *           type: string
 *           description: Message content
 *           example: 'Hello, this is a test message'
 *         timestamp:
 *           type: number
 *           description: Unix timestamp
 *           example: 1696681800000
 *         isReply:
 *           type: boolean
 *           description: Whether this message is a reply
 *           example: false
 *         quotedMessage:
 *           type: object
 *           nullable: true
 *           description: Quoted message data (if isReply is true)
 *           properties:
 *             id:
 *               type: string
 *               example: 'quoted_message_123'
 *             body:
 *               type: string
 *               example: 'Original message content'
 *             from:
 *               type: string
 *               example: '628987654321@c.us'
 *             timestamp:
 *               type: number
 *               example: 1696681500000
 *         contact:
 *           $ref: '#/components/schemas/ContactInfo'
 *         chat:
 *           $ref: '#/components/schemas/ChatInfo'
 *
 *     ContactInfo:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Contact display name
 *           example: 'John Doe'
 *         number:
 *           type: string
 *           description: Contact phone number
 *           example: '628123456789'
 *         isMyContact:
 *           type: boolean
 *           description: Whether this contact is in your contacts
 *           example: true
 *
 *     ChatInfo:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Chat name (for groups)
 *           example: 'Project Team'
 *         isGroup:
 *           type: boolean
 *           description: Whether this is a group chat
 *           example: false
 *         participantCount:
 *           type: number
 *           nullable: true
 *           description: Number of participants (for groups)
 *           example: null
 *
 *     ChatwootIntegration:
 *       type: object
 *       properties:
 *         enabled:
 *           type: boolean
 *           description: Whether Chatwoot integration is enabled
 *           example: true
 *         url:
 *           type: string
 *           description: Chatwoot instance URL
 *           example: 'https://app.chatwoot.com'
 *         accountId:
 *           type: string
 *           description: Chatwoot account ID
 *           example: '1'
 *         inboxId:
 *           type: string
 *           description: Chatwoot inbox ID
 *           example: '1'
 *         status:
 *           type: string
 *           enum: [connected, disconnected, error]
 *           description: Integration status
 *           example: 'connected'
 *
 *     ServiceConfiguration:
 *       type: object
 *       properties:
 *         runtime:
 *           type: string
 *           enum: [linux, mac]
 *           description: Runtime environment
 *           example: 'linux'
 *         webhook:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *               example: true
 *             url:
 *               type: string
 *               example: 'https://your-webhook.com/events'
 *         chatwoot:
 *           $ref: '#/components/schemas/ChatwootIntegration'
 *         puppeteer:
 *           type: object
 *           properties:
 *             runtime:
 *               type: string
 *               example: 'linux'
 *             executablePath:
 *               type: string
 *               example: '/usr/bin/chromium-browser'
 *
 *     ChatwootWebhookPayload:
 *       type: object
 *       description: Webhook payload sent by Chatwoot for message events
 *       properties:
 *         event_type:
 *           type: string
 *           enum: [message_created, message_updated, conversation_created, conversation_updated]
 *           description: Type of Chatwoot event
 *           example: 'message_created'
 *         event_data:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               description: Message ID in Chatwoot
 *               example: 12345
 *             content:
 *               type: string
 *               description: Message content
 *               example: 'Thank you for contacting us'
 *             message_type:
 *               type: string
 *               enum: [incoming, outgoing]
 *               description: Message direction
 *               example: 'outgoing'
 *             sender_type:
 *               type: string
 *               enum: [User, Contact, System]
 *               description: Who sent the message
 *               example: 'User'
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: Message creation timestamp
 *               example: '2025-10-09T10:30:00.000Z'
 *             conversation:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   description: Conversation ID in Chatwoot
 *                   example: 1001
 *                 contact_inbox:
 *                   type: object
 *                   properties:
 *                     source_id:
 *                       type: string
 *                       description: Contact phone number or identifier
 *                       example: '628123456789'
 *             sender:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: 'Agent John'
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: 'john@company.com'
 */
