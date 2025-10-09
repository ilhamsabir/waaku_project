<div align="center">

# Waaku — WhatsApp Multi‑Session Manager

Manage multiple WhatsApp sessions with a modern Vue 3 UI, secure Express API, real‑time updates via Socket.IO, and production‑ready Docker support.

</div>

## Highlights

- Multi‑session WhatsApp manageme## Troubleshooting

- EADDRINUSE on 4300: set a different port and rerun, e.g. `npm run dev:4301` or set `PORT`/`VITE_API_DEV_PORT` in `.env`
- Socket connect_error: ensure VITE_API_KEY (raw UUID) matches WAAKU_API_KEY (sha512) server hash
- Chromium/puppeteer issues in Docker: container uses chromium with stability flags and larger shm; see Dockerfile
- Message send "Evaluation failed": ensure number is in intl format (e.g., 62...) and exists; route resolves chatId with `getNumberId`
- **macOS Puppeteer Error** (`spawn /usr/bin/chromium-browser ENOENT`): Set `WAAKU_RUNTIME=mac` in `.env`. If Chrome is in a custom location, set `WAAKU_CHROME_PATH=/path/to/chrome`
- **Webhook not receiving data**: Check WEBHOOK_URL is accessible and returns HTTP 200. Use `node examples/webhook-example.js` to test locallyatsapp-web.js)
- QR login flow, live status, health dashboard
- Real‑time UI (Socket.IO) — no polling
- Secure API with X‑API‑Key (UUIDv4 raw on client, SHA‑512 hash on server)
- Direct dashboard access (no login required)
- Webhook notifications for message replies and incoming messages
- Docker and docker‑compose for dev and prod

## Tech Stack

- Frontend: Vue 3, Vite, Tailwind CSS, Socket.IO client
- Backend: Node.js/Express, whatsapp-web.js, Socket.IO, Swagger
- Containerization: Docker (Node 18 alpine + Chromium), docker-compose

## Repository structure

```
src/
  api/
    index.js            # Express bootstrap, Swagger, middleware, Socket.IO init
    middleware/auth.js  # X-API-Key (UUID4 + SHA-512), rate limiting, logging
    routes/session.js   # Sessions, QR, validate, send, health, restart, delete
    socket.js           # Socket.IO server with API-key auth (handshake)
    whatsapp/session.js # WhatsApp client lifecycle + socket emits
  app/
    App.vue             # Main Vue app (direct dashboard access)
    main.js, assets/css/tailwind.css, components/
    lib/http.js         # Axios with X-API-Key header
    lib/api.js          # API wrapper
    lib/socket.js       # Socket.IO client
Dockerfile
docker-compose.yml
vite.config.js, tailwind.config.js
```

## Prerequisites

- Node.js 18+ (for local runs)
- Docker + docker‑compose (optional but recommended)
- **macOS users**: Google Chrome or Chromium browser

## Minimum requirements (hardware/server)

- OS: Linux x86_64 (recommended) or macOS; Docker installed (for container runs)
- CPU: 1 vCPU minimum; 2+ vCPU recommended for 5–10 active sessions
- RAM: 1.5 GB minimum for a few sessions; 2–4 GB recommended; increase for heavy use
- Disk: 1 GB free for app + growth for WhatsApp auth data per session
- Network: stable internet connectivity; open ports 4300 (app/API), optionally 80/443 (via Nginx)
- Docker: shared memory size (shm) ≥ 1 GB for Chromium stability (already set in compose)

## Quick start (local)

1) Copy env and configure

```bash
cp .env.example .env
```

Set these variables (see .env.example for all):

- VITE_API_BASE_URL=http://localhost:4300 (or omit to use window origin)
- VITE_API_KEY=<raw UUIDv4 without dashes>
- WAAKU_API_KEY=<sha512 hash of the raw key>
- WAAKU_RUNTIME=mac (for macOS) or linux (for Docker/Linux)
- WEBHOOK_URL=<optional URL to receive message webhooks>
- WEBHOOK_SECRET=<optional secret for webhook authentication>
- WAAKU_CHROME_PATH=<optional custom Chrome path for macOS>
- CHATWOOT_URL=<optional Chatwoot instance URL>
- CHATWOOT_TOKEN=<optional Chatwoot API access token>
- ACCOUNT_ID=<optional Chatwoot account ID>
- INBOX_ID=<optional Chatwoot inbox ID for WhatsApp integration>
- CHATWOOT_WEBHOOK_SECRET=<optional webhook secret for agent replies>

Generate values:

- Raw UUID (client): any v4 without dashes (e.g. `uuidgen | tr -d '-'` on macOS)
- Hash (server): `echo -n <raw> | shasum -a 512 | awk '{print $1}'`

**For macOS users**, also set:
- `WAAKU_RUNTIME=mac` (enables macOS-specific Chrome detection)
- `WAAKU_CHROME_PATH=/path/to/chrome` (optional, if Chrome is in custom location)

2) Install and run

```bash
npm install
npm run dev
```

What it does:

- Frees port 4300 if busy (predev hook)
- Starts Vite (default 1100, respects VITE_PORT)
- Starts Express API on 4300 with Socket.IO

Open:

- App: http://localhost:1100 (or whichever Vite chooses)
- API: http://localhost:4300
- Swagger: http://localhost:4300/api-docs

Login to the dashboard with AUTH_USER/PASS. The UI uses X‑API‑Key automatically via Axios.

## Quick start (Docker)

Production‑like:

```bash
docker compose build \
  --build-arg VITE_API_KEY=<raw_uuid_no_dashes> \
  --build-arg VITE_API_BASE_URL=http://localhost:4300
docker compose up -d
```

Open http://localhost:4300. Provide envs via .env/compose.

Development (local, no Docker):

```bash
npm install
npm run dev

### Run directly from Docker Hub (no build)

You can pull and run the prebuilt image without cloning the repo:

```bash
docker pull ilhamsabir/waaku-app:latest
docker run -d \
  --name waaku \
  -p 4300:4300 \
  --shm-size=1g \
  -e NODE_ENV=production \
  -e PORT=4300 \
  -e WAAKU_RUNTIME=linux \
  -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  -e WAAKU_API_KEY=<sha512_of_raw_uuid> \
  -e VITE_API_KEY=<raw_uuid_no_dashes> \
  -v waaku_whatsapp_sessions:/usr/src/app/.wwebjs_auth \
  ilhamsabir/waaku-app:latest
```

Notes:
- Set VITE_API_KEY to the RAW UUID (32 hex chars, no dashes)
- Set WAAKU_API_KEY to the SHA‑512 hash of that RAW UUID
- The named volume `waaku_whatsapp_sessions` persists WhatsApp auth data
- Access the UI at http://localhost:4300 and Swagger at http://localhost:4300/api-docs

If you see `connect_error UNAUTHORIZED` in the browser console:
- Ensure the image was built with a VITE_API_KEY embedded (build args above)
- Ensure the container has WAAKU_API_KEY set to sha512(VITE_API_KEY)
```

## Usage guide

For step‑by‑step operator instructions (Docker/local), QR workflow, and cURL API examples, see `usage.md`.

## Security model (API)

- Client sends X‑API‑Key with raw UUIDv4 (32 hex chars, no dashes)
- Server stores only SHA‑512 of the key (WAAKU_API_KEY)
- On each request (and socket handshake), server sha512(raw) and compares with stored hash using timing‑safe comparison
- Rate limiting and access logging included

Admin helper: POST /admin/generate-api-key returns a client key + server hash (requires a valid existing key).

## Chatwoot Integration

WAAKU can automatically sync messages with Chatwoot for customer support integration:

### Features
- **Automatic Contact Creation**: Creates contacts in Chatwoot for new WhatsApp numbers
- **Conversation Management**: Creates and manages conversations for each contact
- **Bidirectional Sync**: Syncs both incoming and outgoing messages
- **Reply Detection**: Handles WhatsApp reply messages with quoted content

### Configuration
Set these environment variables to enable Chatwoot integration:

```bash
CHATWOOT_URL=https://app.chatwoot.com  # Your Chatwoot instance URL
CHATWOOT_TOKEN=your_api_token          # API access token from Chatwoot
ACCOUNT_ID=1                           # Your Chatwoot account ID
INBOX_ID=1                             # WhatsApp inbox ID in Chatwoot
```

### Getting Chatwoot Credentials
1. Login to your Chatwoot instance
2. Go to **Settings** → **Account Settings** → **API Access Tokens**
3. Create a new token or use existing one
4. Note your Account ID from the URL or account settings
5. Create a WhatsApp inbox and note the Inbox ID

### Message Flow
- **Incoming Messages**: WhatsApp → WAAKU → Chatwoot (as incoming messages)
- **Outgoing Messages**: WAAKU API → WhatsApp → Chatwoot (as outgoing messages)
- **Agent Replies**: Chatwoot Agent → WAAKU Webhook → WhatsApp Contact
- **Replies**: WhatsApp replies are detected and formatted with quoted content

### Agent Reply Integration
Enable agents to reply directly from Chatwoot and automatically send messages via WhatsApp:

1. **Configure Chatwoot Webhook:**
   ```bash
   # Add to your .env file
   CHATWOOT_WEBHOOK_SECRET=your-webhook-secret-key
   ```

2. **Setup Webhook in Chatwoot:**
   - Go to Settings → Integrations → Webhooks
   - Add webhook URL: `https://your-waaku-domain.com/api/chatwoot/webhook`
   - Set webhook secret (matches CHATWOOT_WEBHOOK_SECRET)
   - Enable "Message Created" events
   - Save configuration

3. **How it works:**
   - Agent replies in Chatwoot conversation
   - Chatwoot sends webhook to WAAKU
   - WAAKU automatically sends reply to WhatsApp contact
   - Full bidirectional communication enabled

## Realtime events (Socket.IO)

- Auth: handshake includes `{ auth: { token: <raw uuid> } }` (or X-API-Key header)
- Emitted by server:
  - `sessions:update` — array of sessions
  - `session:qr` — `{ id, qr }` (data URL)
  - `session:ready` — `{ id }`
  - `session:error` — `{ id, error }`
  - `health:update` — full health summary

## API overview

- GET  /health — service health
- GET  /api-docs — Swagger UI
- POST /admin/generate-api-key — generate new key pair
- Sessions
  - GET    /api/sessions
  - POST   /api/sessions { id }
  - GET    /api/sessions/:id/qr
  - GET    /api/sessions/health
  - GET    /api/sessions/:id/health
  - POST   /api/sessions/:id/restart
  - DELETE /api/sessions/:id

- Messages (new dedicated routes)
  - POST   /api/messages/:id/validate { to }
  - POST   /api/messages/:id/send { to, message }

Note: The legacy endpoints under /api/sessions/:id/(validate|send) remain available for backward compatibility.

## Webhook Integration

Waaku supports webhook notifications for incoming messages and replies. Configure webhook settings in your `.env`:

```bash
# Optional: URL to receive webhook notifications
WEBHOOK_URL=https://your-domain.com/webhook

# Optional: Secret for webhook authentication
WEBHOOK_SECRET=your-secret-key
```

### Webhook Events

**Message Reply** (`message_reply`):
```json
{
  "event": "message_reply",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "data": {
    "sessionId": "mybot",
    "messageId": "message_id",
    "from": "628123456789@c.us",
    "to": "session_number@c.us",
    "body": "Reply message text",
    "timestamp": 1696681800,
    "isReply": true,
    "quotedMessage": {
      "id": "quoted_message_id",
      "body": "Original message being replied to",
      "from": "original_sender@c.us",
      "timestamp": 1696681500
    },
    "contact": {
      "name": "John Doe",
      "number": "628123456789",
      "isMyContact": true
    },
    "chat": {
      "name": "Chat Name",
      "isGroup": false,
      "participantCount": null
    }
  }
}
```

**Regular Message** (`message_received`):
```json
{
  "event": "message_received",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "data": {
    "sessionId": "mybot",
    "messageId": "message_id",
    "from": "628123456789@c.us",
    "to": "session_number@c.us",
    "body": "Hello world",
    "timestamp": 1696681800,
    "isReply": false,
    "contact": { ... },
    "chat": { ... }
  }
}
```

### Webhook Headers

- `Content-Type: application/json`
- `User-Agent: Waaku-Webhook/1.0`
- `X-Webhook-Secret: your-secret-key` (if `WEBHOOK_SECRET` is configured)

## Troubleshooting

- EADDRINUSE on 4300: set a different port and rerun, e.g. `npm run dev:4301` or set `PORT`/`VITE_API_DEV_PORT` in `.env`
- Socket connect_error: ensure VITE_API_KEY (raw UUID) matches WAAKU_API_KEY (sha512) server hash
- Chromium/puppeteer issues in Docker: container uses chromium with stability flags and larger shm; see Dockerfile
- Message send “Evaluation failed”: ensure number is in intl format (e.g., 62...) and exists; route resolves chatId with `getNumberId`

## Health check

You can verify the service is up with simple curl checks:

```bash
# General service health (200 when healthy)
curl -f http://localhost:4300/health

# Sessions health (200 = all healthy, 503 = some unhealthy)
curl -i http://localhost:4300/api/sessions/health
```

These match the container healthcheck used in `docker-compose.yml`.


## API Endpoint Docs

base_url: http://localhost:4300
session_id: test-session
phone_number: 6281234567890
message_text: Hello from API!
```

## 📝 API Endpoints

### 🔧 General
- `GET /health` - Check general service health

### 📱 Sessions Management
- `GET /api/sessions` - List all sessions
- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:id/qr` - Get QR code for a session
- `POST /api/sessions/:id/restart` - Restart a specific session

### 💬 Messages
- `POST /api/sessions/:id/validate` - Validate a WhatsApp number
- `POST /api/sessions/:id/send` - Send a message

### 🏥 Health Monitoring
- `GET /api/sessions/health` - Health check for all sessions
- `GET /api/sessions/:id/health` - Health check for a specific session

### Request Examples

> **Note:** All API requests require the `X-API-Key` header with your raw UUIDv4 key (32 hex chars, no dashes).

```bash
# Create a new session
curl -X POST http://localhost:4300/api/sessions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-raw-uuidv4>" \
  -d '{"id": "session1"}'

# Validate a number
curl -X POST http://localhost:4300/api/sessions/session1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-raw-uuidv4>" \
  -d '{"to": "6281234567890"}'

# Send a message
curl -X POST http://localhost:4300/api/sessions/session1/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-raw-uuidv4>" \
  -d '{"to": "6281234567890", "message": "Hello World!"}'
```

## 🤝 Contributing

PRs welcome! Suggested flow:

1. Fork and create a feature branch
2. Keep changes focused; add/update docs and small tests where possible
3. Follow existing code style and structure
4. Open a PR with a concise summary and screenshots/logs when relevant

Areas to improve:

- Add automated tests (unit/integration)
- Improve session lifecycle UX and metrics
- Pluggable auth providers for the UI login
- External rate‑limit store (Redis) for multi‑instance prod

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request


## 📞 Support

If you encounter issues or have questions:

1. Check the [Issues](../../issues) for known problems
2. Create a [new Issue](../../issues/new) if needed
3. View logs with `docker-compose logs` for debugging

---

**Note**: This app uses the unofficial WhatsApp Web API. Please ensure you comply with the [WhatsApp Terms of Service](https://www.whatsapp.com/legal/) when using this application.


If this project helps you, consider buying me a coffee:

<a href="https://buymeacoffee.com/ilhamsabir" target="_blank" rel="noopener noreferrer"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" height="41" width="174"></a>
