/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: WhatsApp message sending and validation endpoints
 */

/**
 * @swagger
 * /api/sessions/{id}/validate:
 *   post:
 *     summary: Validate WhatsApp number
 *     description: |
 *       Validates if a phone number exists on WhatsApp platform.
 *       This is useful to check number validity before sending messages.
 *
 *       **Requirements:**
 *       - Session must be in 'ready' status
 *       - Phone number must be in international format (without + sign)
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session ID to use for validation
 *         schema:
 *           type: string
 *           example: "session-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateNumberRequest'
 *           examples:
 *             indonesian_number:
 *               summary: Indonesian phone number
 *               value:
 *                 to: "6281234567890"
 *             international_number:
 *               summary: International phone number
 *               value:
 *                 to: "14155552671"
 *     responses:
 *       200:
 *         description: Validation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationResponse'
 *             examples:
 *               number_exists:
 *                 summary: Number exists on WhatsApp
 *                 value:
 *                   exists: true
 *                   number: "6281234567890"
 *               number_not_exists:
 *                 summary: Number does not exist on WhatsApp
 *                 value:
 *                   exists: false
 *       400:
 *         description: Bad request - session not ready or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               session_not_ready:
 *                 summary: Session not ready
 *                 value:
 *                   error: "session not ready"
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *               missing_number:
 *                 summary: Missing phone number
 *                 value:
 *                   error: "to required"
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *         examples:
 *           validation_error:
 *             summary: Validation failed
 *             value:
 *               error: "Failed to validate number"
 *               timestamp: "2025-09-30T10:30:00.000Z"
 */

/**
 * @swagger
 * /api/sessions/{id}/send:
 *   post:
 *     summary: Send WhatsApp message
 *     description: |
 *       Sends a text message via WhatsApp to the specified recipient.
 *
 *       **Requirements:**
 *       - Session must be in 'ready' status
 *       - Recipient number must be valid (recommend validating first)
 *       - Message text cannot be empty
 *
 *       **Tips:**
 *       - Use the validation endpoint first to check if number exists
 *       - Phone numbers should be in international format (without + sign)
 *       - Messages are sent as plain text
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Session ID to use for sending
 *         schema:
 *           type: string
 *           example: "session-1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *           examples:
 *             simple_message:
 *               summary: Simple text message
 *               value:
 *                 to: "6281234567890"
 *                 message: "Hello from WhatsApp API!"
 *             business_message:
 *               summary: Business notification
 *               value:
 *                 to: "6281234567890"
 *                 message: "Your order #12345 has been processed and will be shipped within 24 hours."
 *             multiline_message:
 *               summary: Multi-line message
 *               value:
 *                 to: "6281234567890"
 *                 message: "Hello!\n\nThis is a multi-line message.\n\nBest regards,\nAPI Team"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     result:
 *                       type: object
 *                       description: WhatsApp Web.js send result containing message details
 *                       properties:
 *                         id:
 *                           type: object
 *                           properties:
 *                             fromMe:
 *                               type: boolean
 *                               example: true
 *                             remote:
 *                               type: string
 *                               example: "6281234567890@c.us"
 *                             id:
 *                               type: string
 *                               example: "3EB0C767D82A1E1D2F99"
 *                         ack:
 *                           type: number
 *                           description: Acknowledgment status
 *                           example: 1
 *                         timestamp:
 *                           type: number
 *                           description: Message timestamp
 *                           example: 1696084800
 *             examples:
 *               message_sent:
 *                 summary: Message sent successfully
 *                 value:
 *                   success: true
 *                   result:
 *                     id:
 *                       fromMe: true
 *                       remote: "6281234567890@c.us"
 *                       id: "3EB0C767D82A1E1D2F99"
 *                     ack: 1
 *                     timestamp: 1696084800
 *       400:
 *         description: Bad request - session not ready or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               session_not_ready:
 *                 summary: Session not ready
 *                 value:
 *                   error: "session not ready"
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *               missing_parameters:
 *                 summary: Missing required parameters
 *                 value:
 *                   error: "to & message required"
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 *         examples:
 *           send_failed:
 *             summary: Failed to send message
 *             value:
 *               error: "Number does not exist"
 *               timestamp: "2025-09-30T10:30:00.000Z"
 */
