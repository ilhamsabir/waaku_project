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

## Stack

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
    main.js, index.css, components/
    lib/http.js         # Axios with X-API-Key header
    lib/api.js          # API wrapper
    lib/socket.js       # Socket.IO client
Dockerfile, Dockerfile.dev
docker-compose.yml, docker-compose.dev.yml
vite.config.js, tailwind.config.js
```

## Prerequisites

- Node.js 18+ (for local runs)
- Docker + docker‑compose (optional but recommended)

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
docker compose up --build -d
```

Open http://localhost:3000. Provide envs (WAAKU_API_KEY, optionally VITE vars) via compose or image environment.

Development:

```bash
docker compose -f docker-compose.dev.yml up --build
```

- API: http://localhost:3000
- Vite: http://localhost:1100 (respects VITE_PORT)

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
  - POST   /api/sessions/:id/validate { to }
  - POST   /api/sessions/:id/send { to, message }
  - GET    /api/sessions/health
  - GET    /api/sessions/:id/health
  - POST   /api/sessions/:id/restart
  - DELETE /api/sessions/:id

## Troubleshooting

- EADDRINUSE on 3000: run `npm run dev` (predev kills stale process) or `npm run port:kill:3000`
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

If this project helps you, consider buying me a coffee:

<a href="https://buymeacoffee.com/ilhamsabir" target="_blank" rel="noopener noreferrer"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" height="41" width="174"></a>

base_url: http://localhost:3000
session_id: test-session
phone_number: 6281234567890
message_text: Hello from API!
```

## �📝 API Endpoints

### 🔧 General
- `GET /health` - Check general service health

### 📱 Sessions Management
- `GET /api/sessions` - List semua sessions
- `POST /api/sessions` - Buat session baru
- `GET /api/sessions/:id/qr` - Get QR code untuk session
- `POST /api/sessions/:id/restart` - Restart session tertentu

### 💬 Messages
- `POST /api/sessions/:id/validate` - Validasi nomor WhatsApp
- `POST /api/sessions/:id/send` - Kirim pesan

### 🏥 Health Monitoring
- `GET /api/sessions/health` - Health check semua sessions
- `GET /api/sessions/:id/health` - Health check session tertentu### Request Examples

```bash
# Buat session baru
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"id": "session1"}'

# Validasi nomor
curl -X POST http://localhost:3000/api/sessions/session1/validate \
  -H "Content-Type: application/json" \
  -d '{"to": "6281234567890"}'

# Kirim pesan
curl -X POST http://localhost:3000/api/sessions/session1/send \
  -H "Content-Type: application/json" \
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

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check [Issues](../../issues) untuk masalah yang sudah diketahui
2. Buat [Issue baru](../../issues/new) jika diperlukan
3. Lihat logs dengan `docker-compose logs` untuk debugging

---

**Note**: Aplikasi ini menggunakan WhatsApp Web API unofficial. Pastikan mematuhi [Terms of Service WhatsApp](https://www.whatsapp.com/legal/) saat menggunakan aplikasi ini.
