/**
 * Swagger Documentation Index
 *
 * This file imports all documentation modules to ensure they are loaded
 * by swagger-jsdoc when scanning for API documentation.
 *
 * File organization:
 * - schemas.js: Component schemas and responses
 * - general.js: General service endpoints (/health, /api, etc.)
 * - sessions.js: Session management endpoints
 * - messages.js: Message sending and validation endpoints
 * - health.js: Health monitoring endpoints
 */

// Import all documentation modules
require('./schemas');
require('./general');
require('./sessions');
require('./messages');
require('./health');

module.exports = {
  // This module serves as an index for all documentation files
  // The actual documentation is loaded via swagger-jsdoc scanning
};
