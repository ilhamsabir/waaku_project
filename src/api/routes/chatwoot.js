const express = require('express')
const { chatwootWebhookHandler, chatwootWebhookHealthHandler } = require('../controllers/chatwoot')

const router = express.Router()

/**
 * Chatwoot Integration Routes
 * Handles incoming webhooks from Chatwoot for agent replies
 */

// Webhook endpoint for Chatwoot callbacks
router.post('/webhook', chatwootWebhookHandler)

// Health check for Chatwoot integration
router.get('/health', chatwootWebhookHealthHandler)

module.exports = router
