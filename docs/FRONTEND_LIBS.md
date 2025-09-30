# Frontend Library Structure

This document describes the organized library structure for the WhatsApp Multi-Session Manager frontend.

## 📁 Structure

```
src/app/lib/
├── index.js          # Main exports file
├── http.js           # Axios HTTP client configuration
└── api.js            # API service functions
```

## 🔧 HTTP Client (`http.js`)

Axios instance with enhanced configuration:

- **Base URL**: From environment variable `VITE_API_BASE_URL`
- **Timeout**: 30 seconds
- **Content Type**: JSON
- **Interceptors**: Request/response logging and error handling
- **Environment**: Development logging

### Usage
```javascript
import http from './lib/http.js'

// Direct HTTP calls (if needed)
const response = await http.get('/custom-endpoint')
const data = await http.post('/custom-endpoint', payload)
```

## 🌐 API Service (`api.js`)

Organized API functions by functionality:

### Sessions Management
```javascript
import { getSessions, createSession, deleteSession } from './lib/api.js'

// Get all sessions
const sessions = await getSessions()

// Create new session
await createSession('session-name')

// Delete session
await deleteSession('session-id')
```

### Health Monitoring
```javascript
import { getSessionsHealth, getSessionHealth } from './lib/api.js'

// Get overall health summary
const health = await getSessionsHealth()

// Check specific session health
const sessionHealth = await getSessionHealth('session-id')
```

### QR Code Generation
```javascript
import { generateQRCode } from './lib/api.js'

const qrData = await generateQRCode('session-id')
```

### Messaging
```javascript
import { validatePhoneNumber, sendMessage } from './lib/api.js'

// Validate phone number
const validation = await validatePhoneNumber('session-id', '628123456789')

// Send message
const result = await sendMessage('session-id', '628123456789', 'Hello!')
```

### Batch Operations
```javascript
import { getSessionsWithHealth } from './lib/api.js'

// Get both sessions and health data in one call
const { sessions, health } = await getSessionsWithHealth()
```

### Error Handling
```javascript
import { getErrorMessage, isNetworkError, isServerError } from './lib/api.js'

try {
  await someApiCall()
} catch (error) {
  const message = getErrorMessage(error)

  if (isNetworkError(error)) {
    console.log('Network connection issue')
  } else if (isServerError(error)) {
    console.log('Server error occurred')
  }
}
```

## 📦 Centralized Exports (`index.js`)

All library functions can be imported from the main index:

```javascript
// Import specific functions
import { api, getSessions, sendMessage } from './lib/index.js'

// Import everything
import * as lib from './lib/index.js'
```

## ✨ Benefits

### 🔄 **Separation of Concerns**
- HTTP client logic separated from API business logic
- Clear distinction between transport layer and service layer

### 🛡️ **Error Handling**
- Centralized error processing with helper functions
- Network error detection and handling
- User-friendly error messages

### 📝 **Logging & Debugging**
- Automatic request/response logging in development
- Enhanced error information for debugging

### 🎯 **Type Safety & Documentation**
- JSDoc comments for all functions
- Clear parameter and return types
- Usage examples in documentation

### 🚀 **Performance**
- Batch operations to reduce API calls
- Axios interceptors for request optimization
- Timeout configuration for reliability

### 🔧 **Maintainability**
- Single source of truth for API endpoints
- Easy to add new API functions
- Environment-based configuration

## 🔄 Migration Benefits

**Before**: Direct fetch calls scattered throughout components
```javascript
const res = await fetch(`${API_BASE_URL}/api/sessions`)
const data = await res.json()
```

**After**: Clean, organized API service
```javascript
const sessions = await api.getSessions()
```

**Result**: Cleaner, more maintainable, and more reliable code! ✨
