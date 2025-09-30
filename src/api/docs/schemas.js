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
 */
