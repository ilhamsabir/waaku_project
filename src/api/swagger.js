const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WAAKU - WhatsApp Multi-Session API',
      version: '2.0.0',
      description: `
        Advanced multi-session WhatsApp management API with real-time capabilities.

        ## Features
        - **Multi-Session Management**: Create and manage multiple WhatsApp sessions
        - **Real-time Updates**: Live QR codes and session status via Socket.IO
        - **Message Handling**: Send messages and validate numbers
        - **Chatwoot Integration**: Automatic sync with Chatwoot for customer support
        - **Webhook Notifications**: Real-time notifications for message events
        - **Cross-Platform**: Supports Docker, Linux, and macOS

        ## Authentication
        All endpoints require the \`X-API-Key\` header with your UUID4 key.

        ## Integrations
        - **Chatwoot**: Automatic contact creation and message synchronization
        - **Webhooks**: HTTP notifications for incoming messages and replies
        - **Socket.IO**: Real-time session status and message events
      `,
      contact: {
        name: 'WAAKU Support',
        url: 'https://github.com/ilhamsabir/waaku',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4300',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Alternative development port',
      },
      {
        url: 'https://your-domain.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Raw UUID4 key (32 hex chars, no dashes). Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ],
    // Components (schemas, responses, etc.) are defined in separate docs files
    tags: [
      {
        name: 'General',
        description: 'General API endpoints and service information',
      },
      {
        name: 'Sessions',
        description: 'WhatsApp session lifecycle management - create, QR, status, restart, delete',
      },
      {
        name: 'Health',
        description: 'Service and session health monitoring endpoints',
      },
      {
        name: 'Messages',
        description: 'Message sending, validation, and Chatwoot integration',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints for API key management',
      },
      {
        name: 'Webhooks',
        description: 'Webhook integration and event handling documentation',
      },
      {
        name: 'Chatwoot',
        description: 'Chatwoot integration for bidirectional agent communication',
      },
    ],
  },
  apis: [
    './src/api/docs/*.js',  // Documentation files
    './src/api/routes/*.js', // Route files with minimal docs
    './src/api/index.js'     // Main server file
  ], // Path to the API docs
};

const specs = swaggerJsdoc(options);
module.exports = specs;
