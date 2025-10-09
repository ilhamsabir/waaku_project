/**
 * @swagger
 * /admin/generate-api-key:
 *   post:
 *     tags: [Admin]
 *     summary: Generate new API key pair
 *     description: |
 *       Generate a new UUID4 client key and SHA-512 server hash pair.
 *       Requires existing valid API key for authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: New API key pair generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 clientKey:
 *                   type: string
 *                   description: Raw UUID4 for client use (X-API-Key header)
 *                   example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
 *                 serverHash:
 *                   type: string
 *                   description: SHA-512 hash for server configuration (WAAKU_API_KEY)
 *                   example: 'abc123def456...'
 *                 usage:
 *                   type: object
 *                   properties:
 *                     client:
 *                       type: string
 *                       example: 'Set VITE_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
 *                     server:
 *                       type: string
 *                       example: 'Set WAAKU_API_KEY=abc123def456...'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /config:
 *   get:
 *     tags: [General]
 *     summary: Get service configuration
 *     description: |
 *       Retrieve current service configuration including:
 *       - Runtime environment (Linux/macOS)
 *       - Webhook integration status
 *       - Chatwoot integration status
 *       - Puppeteer configuration
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Service configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceConfiguration'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /integrations/chatwoot/test:
 *   post:
 *     tags: [Messages]
 *     summary: Test Chatwoot integration
 *     description: |
 *       Test the Chatwoot integration by attempting to:
 *       - Connect to Chatwoot API
 *       - Verify account and inbox access
 *       - Create a test contact and conversation
 *       - Send a test message
 *       - Clean up test data
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Chatwoot integration test successful
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
 *                   example: 'Chatwoot integration test passed'
 *                 tests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: 'Account Access'
 *                       status:
 *                         type: string
 *                         enum: [passed, failed]
 *                         example: 'passed'
 *                       details:
 *                         type: string
 *                         example: 'Successfully connected to account "My Company"'
 *       400:
 *         description: Chatwoot not configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         description: Chatwoot integration test failed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     tests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           status:
 *                             type: string
 *                             example: 'failed'
 *                           error:
 *                             type: string
 */
