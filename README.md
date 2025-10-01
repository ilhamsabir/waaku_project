<div align="center">

# Waaku — WhatsApp Multi‑Session Manager

Manage multiple WhatsApp sessions with a modern Vue 3 UI, secure Express API, real‑time updates via Socket.IO, and production‑ready Docker support.

</div>

## Highlights

- Multi‑session WhatsApp management (whatsapp-web.js)
- QR login flow, live status, health dashboard
- Real‑time UI (Socket.IO) — no polling
- Secure API with X‑API‑Key (UUIDv4 raw on client, SHA‑512 hash on server)
- Frontend UI login (env-based) for dashboard access
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
    App.vue             # Main Vue app (now with env-based login)
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

## Minimum requirements (hardware/server)

- OS: Linux x86_64 (recommended) or macOS; Docker installed (for container runs)
- CPU: 1 vCPU minimum; 2+ vCPU recommended for 5–10 active sessions
- RAM: 1.5 GB minimum for a few sessions; 2–4 GB recommended; increase for heavy use
- Disk: 1 GB free for app + growth for WhatsApp auth data per session
- Network: stable internet connectivity; open ports 1100 (app/API via Docker), optionally 80/443 (via Nginx)
- Docker: shared memory size (shm) ≥ 1 GB for Chromium stability (already set in compose)

## Quick start (local)

1) Copy env and configure

```bash
cp .env.example .env
```

Set these variables (see .env.example for all):

- VITE_API_BASE_URL=http://localhost:3000 (or omit to use window origin)
- VITE_API_KEY=<raw UUIDv4 without dashes>
- WAAKU_API_KEY=<sha512 hash of the raw key>
- VITE_AUTH_USER=<dashboard user>
- VITE_AUTH_PASS=<dashboard pass>

Generate values:

- Raw UUID (client): any v4 without dashes (e.g. `uuidgen | tr -d '-'` on macOS)
- Hash (server): `echo -n <raw> | shasum -a 512 | awk '{print $1}'`

2) Install and run

```bash
npm install
npm run dev
```

What it does:

- Frees port 3000 if busy (predev hook)
- Starts Vite (default 1100, respects VITE_PORT)
- Starts Express API on 3000 with Socket.IO

Open:

- App: http://localhost:1100 (or whichever Vite chooses)
- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

Login to the dashboard with VITE_AUTH_USER/PASS. The UI uses X‑API‑Key automatically via Axios.

## Quick start (Docker)

Production‑like:

```bash
docker compose build \
  --build-arg VITE_API_KEY=<raw_uuid_no_dashes> \
  --build-arg VITE_API_BASE_URL=http://localhost:3000 \
  --build-arg VITE_AUTH_USER=<user> \
  --build-arg VITE_AUTH_PASS=<pass>
docker compose up -d
```

Open http://localhost:3000. Provide envs (WAAKU_API_KEY, optionally VITE vars) via compose or image environment.

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
  -p 3000:3000 \
  --shm-size=1g \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e WAAKU_RUNTIME=linux \
  -e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
  -e WAAKU_API_KEY=<sha512_of_raw_uuid> \
  -e VITE_API_KEY=<raw_uuid_no_dashes> \
  -v waaku_whatsapp_sessions:/usr/src/app/.wwebjs_auth \
  ilhamsabir/waaku-app:latest
```

Notes:
- Set VITE_API_KEY to the RAW UUID (32 hex chars, no dashes)
- Set WAAKU_API_KEY to the SHA‑512 hash of that RAW UUID
- The named volume `waaku_whatsapp_sessions` persists WhatsApp auth data
- Access the UI at http://localhost:3000 and Swagger at http://localhost:3000/api-docs

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

## Troubleshooting

- EADDRINUSE on 3000: set a different port and rerun, e.g. `npm run dev:3001` or set `PORT`/`VITE_API_DEV_PORT` in `.env`
- Socket connect_error: ensure VITE_API_KEY (raw UUID) matches WAAKU_API_KEY (sha512) server hash
- Chromium/puppeteer issues in Docker: container uses chromium with stability flags and larger shm; see Dockerfile
- Message send “Evaluation failed”: ensure number is in intl format (e.g., 62...) and exists; route resolves chatId with `getNumberId`

## Contributing

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

## License

MIT License. See LICENSE file if present; otherwise, contributions are assumed MIT under this repository.

## Support

base_url: http://localhost:3000
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
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-raw-uuidv4>" \
  -d '{"id": "session1"}'

# Validate a number
curl -X POST http://localhost:3000/api/sessions/session1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-raw-uuidv4>" \
  -d '{"to": "6281234567890"}'

# Send a message
curl -X POST http://localhost:3000/api/sessions/session1/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-raw-uuidv4>" \
  -d '{"to": "6281234567890", "message": "Hello World!"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Support

If you encounter issues or have questions:

1. Check the [Issues](../../issues) for known problems
2. Create a [new Issue](../../issues/new) if needed
3. View logs with `docker-compose logs` for debugging

---

**Note**: This app uses the unofficial WhatsApp Web API. Please ensure you comply with the [WhatsApp Terms of Service](https://www.whatsapp.com/legal/) when using this application.


If this project helps you, consider buying me a coffee:

<a href="https://buymeacoffee.com/ilhamsabir" target="_blank" rel="noopener noreferrer"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" height="41" width="174"></a>
