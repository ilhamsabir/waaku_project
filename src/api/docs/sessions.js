/**
 * @swagger
 * tags:
 *   - name: Sessions
 *     description: WhatsApp session management endpoints
 */

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: List all WhatsApp sessions
 *     description: Returns a list of all WhatsApp sessions with their current status
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *             examples:
 *               sessions:
 *                 summary: Example sessions list
 *                 value:
 *                   - id: "session-1"
 *                     ready: true
 *                     status: "ready"
 *                     clientState: "CONNECTED"
 *                     error: null
 *                     createdAt: "2025-09-30T10:00:00.000Z"
 *                     lastActivity: "2025-09-30T10:30:00.000Z"
 *                     uptime: 1800
 *                   - id: "session-2"
 *                     ready: false
 *                     status: "qr_received"
 *                     clientState: "OPENING"
 *                     error: null
 *                     createdAt: "2025-09-30T10:25:00.000Z"
 *                     lastActivity: "2025-09-30T10:25:30.000Z"
 *                     uptime: 330
 *
 *   post:
 *     summary: Create a new WhatsApp session
 *     description: Creates a new WhatsApp session with the specified ID. The session will be initialized and require QR code authentication.
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *           examples:
 *             create_session:
 *               summary: Create new session
 *               value:
 *                 id: "my-session-1"
 *     responses:
 *       200:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "my-session-1"
 *             examples:
 *               success:
 *                 summary: Session created
 *                 value:
 *                   success: true
 *                   id: "my-session-1"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *         examples:
 *           missing_id:
 *             summary: Missing session ID
 *             value:
 *               error: "id required"
 *               timestamp: "2025-09-30T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/sessions/{id}/qr:
 *   get:
 *     summary: Get QR code for session authentication
 *     description: |
 *       Returns the QR code image (Base64 data URL) for WhatsApp authentication.
 *       Scan this QR code with your WhatsApp mobile app to authenticate the session.
 *
 *       **Note:** QR code is only available when session status is 'qr_received'.
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session ID to get QR code for
 *         schema:
 *           type: string
 *           example: "session-1"
 *     responses:
 *       200:
 *         description: QR code retrieved successfully (may be null if not available)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QRResponse'
 *             examples:
 *               qr_available:
 *                 summary: QR code available
 *                 value:
 *                   qr: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *               qr_not_available:
 *                 summary: QR code not available
 *                 value:
 *                   qr: null
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *         examples:
 *           session_not_found:
 *             summary: Session not found
 *             value:
 *               error: "not found"
 *               timestamp: "2025-09-30T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/sessions/{id}/restart:
 *   post:
 *     summary: Restart a WhatsApp session
 *     description: |
 *       Destroys and recreates a WhatsApp session. This will:
 *       - Disconnect the current session
 *       - Clear authentication data
 *       - Require new QR code authentication
 *
 *       **Warning:** This action will interrupt any ongoing operations.
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session ID to restart
 *         schema:
 *           type: string
 *           example: "session-1"
 *     responses:
 *       200:
 *         description: Session restarted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestartResponse'
 *             examples:
 *               restart_success:
 *                 summary: Restart successful
 *                 value:
 *                   success: true
 *                   message: "Session restarted successfully"
 *                   sessionId: "session-1"
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *         examples:
 *           session_not_found:
 *             summary: Session not found
 *             value:
 *               error: "Session not found"
 *               timestamp: "2025-09-30T10:30:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
