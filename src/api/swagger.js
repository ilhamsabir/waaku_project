const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Multi-Session API',
      version: '1.0.0',
      description: 'API untuk mengelola multiple session WhatsApp menggunakan whatsapp-web.js',
      contact: {
        name: 'WhatsApp Multi-Session Support',
        email: 'support@whatsapp-multi.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://your-domain.com',
        description: 'Production server',
      },
    ],
    // Components (schemas, responses, etc.) are defined in separate docs files
    tags: [
      {
        name: 'General',
        description: 'General API endpoints',
      },
      {
        name: 'Sessions',
        description: 'WhatsApp session management',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Messages',
        description: 'Message sending and validation',
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
