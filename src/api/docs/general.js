/**
 * @swagger
 * tags:
 *   - name: General
 *     description: General service endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check general service health
 *     description: |
 *       Returns the general health status of the WhatsApp Multi-Session service.
 *       This endpoint provides basic service information including:
 *       - Service status and uptime
 *       - Memory usage statistics
 *       - API version information
 *
 *       This is useful for monitoring tools and load balancers.
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Service is healthy and operational
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneralHealth'
 *             examples:
 *               service_healthy:
 *                 summary: Service is healthy
 *                 value:
 *                   status: "healthy"
 *                   service: "WhatsApp Multi-Session Manager"
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 *                   uptime: 7200
 *                   memory:
 *                     rss: 45056000
 *                     heapTotal: 28672000
 *                     heapUsed: 20480000
 *                     external: 1024000
 *                   version: "1.0.0"
 *       500:
 *         description: Service is experiencing issues
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               service_error:
 *                 summary: Service error
 *                 value:
 *                   error: "Internal service error"
 *                   timestamp: "2025-09-30T10:30:00.000Z"
 */

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Redirect to API documentation
 *     description: |
 *       Redirects to the interactive Swagger API documentation.
 *       This is a convenience endpoint for easy access to the API docs.
 *     tags: [General]
 *     responses:
 *       302:
 *         description: Redirect to /api-docs
 *         headers:
 *           Location:
 *             description: Redirect location
 *             schema:
 *               type: string
 *               example: "/api-docs"
 *
 * /api-info:
 *   get:
 *     summary: API information page
 *     description: |
 *       Returns a user-friendly HTML page with links to various API resources:
 *       - Web interface
 *       - API documentation
 *       - Health check endpoints
 *       - Quick start examples
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API information page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<!DOCTYPE html>..."
 */
