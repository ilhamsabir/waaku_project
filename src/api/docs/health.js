/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: System and session health monitoring endpoints
 */

/**
 * @swagger
 * /api/sessions/health:
 *   get:
 *     summary: Get health status of all sessions
 *     description: |
 *       Returns comprehensive health information for all WhatsApp sessions and service integrations.
 *
 *       **Health Criteria:**
 *       - **Healthy**: Session is in good state with recent activity (< 5 minutes)
 *       - **Unhealthy**: Session has issues or no recent activity (> 5 minutes)
 *       - **Stale**: No activity for more than 5 minutes
 *
 *       **Integration Status:**
 *       - **Webhook**: Shows if webhook URL is configured and reachable
 *       - **Chatwoot**: Shows if Chatwoot integration is configured and connected
 *       - **Puppeteer**: Shows runtime configuration (Linux/macOS)
 *
 *       **HTTP Status Codes:**
 *       - `200`: All sessions are healthy
 *       - `503`: Some sessions are unhealthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All sessions are healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthSummary'
 *             examples:
 *               all_healthy:
 *                 summary: All sessions healthy
 *                 value:
 *                   status: "healthy"
 *                   summary:
 *                     total: 2
 *                     healthy: 2
 *                     ready: 2
 *                     stale: 0
 *                     unhealthy: 0
 *                   sessions:
 *                     - id: "session-1"
 *                       status: "ready"
 *                       clientState: "CONNECTED"
 *                       ready: true
 *                       healthy: true
 *                       uptime: 3600
 *                       timeSinceLastActivity: 30
 *                       stale: false
 *                     - id: "session-2"
 *                       status: "ready"
 *                       clientState: "CONNECTED"
 *                       ready: true
 *                       healthy: true
 *                       uptime: 1800
 *                       timeSinceLastActivity: 15
 *                       stale: false
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *                   overallHealth: true
 *       503:
 *         description: Some sessions are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthSummary'
 *             examples:
 *               mixed_health:
 *                 summary: Mixed session health
 *                 value:
 *                   status: "unhealthy"
 *                   summary:
 *                     total: 3
 *                     healthy: 1
 *                     ready: 2
 *                     stale: 1
 *                     unhealthy: 2
 *                   sessions:
 *                     - id: "session-1"
 *                       status: "ready"
 *                       clientState: "CONNECTED"
 *                       ready: true
 *                       healthy: true
 *                       uptime: 3600
 *                       timeSinceLastActivity: 30
 *                       stale: false
 *                     - id: "session-2"
 *                       status: "disconnected"
 *                       clientState: null
 *                       ready: false
 *                       healthy: false
 *                       uptime: 1800
 *                       timeSinceLastActivity: 400
 *                       stale: true
 *                     - id: "session-3"
 *                       status: "qr_received"
 *                       clientState: "OPENING"
 *                       ready: false
 *                       healthy: false
 *                       uptime: 600
 *                       timeSinceLastActivity: 350
 *                       stale: true
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *                   overallHealth: false
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /api/sessions/{id}/health:
 *   get:
 *     summary: Get health status of specific session
 *     description: |
 *       Returns detailed health information for a specific WhatsApp session.
 *
 *       **Health Indicators:**
 *       - **Status**: Current session state
 *       - **Ready**: Whether session can send messages
 *       - **Healthy**: Overall health assessment
 *       - **Uptime**: How long session has been running
 *       - **Last Activity**: When session was last active
 *       - **Stale**: Whether session has been inactive too long
 *     tags: [Health]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session ID to check health for
 *         schema:
 *           type: string
 *           example: "session-1"
 *     responses:
 *       200:
 *         description: Session is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionHealth'
 *             examples:
 *               healthy_session:
 *                 summary: Healthy session
 *                 value:
 *                   id: "session-1"
 *                   status: "ready"
 *                   clientState: "CONNECTED"
 *                   ready: true
 *                   healthy: true
 *                   uptime: 3600
 *                   timeSinceLastActivity: 30
 *                   error: null
 *                   createdAt: "2025-09-30T09:30:00.000Z"
 *                   lastActivity: "2025-09-30T10:29:30.000Z"
 *                   stale: false
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "not_found"
 *                 healthy:
 *                   type: boolean
 *                   example: false
 *             examples:
 *               session_not_found:
 *                 summary: Session not found
 *                 value:
 *                   status: "not_found"
 *                   healthy: false
 *       503:
 *         description: Session is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionHealth'
 *             examples:
 *               unhealthy_session:
 *                 summary: Unhealthy session
 *                 value:
 *                   id: "session-1"
 *                   status: "disconnected"
 *                   clientState: null
 *                   ready: false
 *                   healthy: false
 *                   uptime: 3600
 *                   timeSinceLastActivity: 400
 *                   error: "NAVIGATION_TIMEOUT"
 *                   createdAt: "2025-09-30T09:30:00.000Z"
 *                   lastActivity: "2025-09-30T10:23:20.000Z"
 *                   stale: true
 *               stale_session:
 *                 summary: Stale session
 *                 value:
 *                   id: "session-2"
 *                   status: "qr_received"
 *                   clientState: "OPENING"
 *                   ready: false
 *                   healthy: false
 *                   uptime: 600
 *                   timeSinceLastActivity: 350
 *                   error: null
 *                   createdAt: "2025-09-30T10:20:00.000Z"
 *                   lastActivity: "2025-09-30T10:24:10.000Z"
 *                   stale: true
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
