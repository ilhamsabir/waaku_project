const express = require('express')
const { validateNumberHandler, sendMessageHandler } = require('../controllers/message')

const router = express.Router()

// Validate number for a session
router.post('/:id/validate', validateNumberHandler)

// Send a message for a session
router.post('/:id/send', sendMessageHandler)

module.exports = router
