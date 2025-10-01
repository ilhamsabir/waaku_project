# Waaku — End‑User Guide (Direct Usage)

This guide is for operators who want to run and use Waaku without developing the code. You’ll get a working dashboard, create WhatsApp sessions, scan QR codes, and send messages.

If you’re looking to contribute or dive into the code, see `README.md`.

## What you’ll get

- Web dashboard to manage multiple WhatsApp sessions
- QR login flow and live status via Socket.IO
- Simple UI to validate numbers and send messages
- REST API for programmatic sends

## Quick start (recommended: Docker)

### Option A — Run directly from Docker Hub (no build)

Quickest way to get started without cloning the repo:

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

Open http://localhost:1100. The named volume `waaku_whatsapp_sessions` persists WhatsApp auth data.

If you prefer docker-compose with the prebuilt image:

```yaml
services:
  waaku-app:
    image: ilhamsabir/waaku-app:latest
    container_name: waaku
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - WAAKU_RUNTIME=linux
      - PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
      - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
      - WAAKU_API_KEY=${WAAKU_API_KEY}
      - VITE_API_KEY=${VITE_API_KEY}
    volumes:
      - waaku_whatsapp_sessions:/usr/src/app/.wwebjs_auth
    restart: unless-stopped
    shm_size: '1gb'
volumes:
  waaku_whatsapp_sessions:
    driver: local
```

Then run:

```bash
docker compose pull
docker compose up -d
```

Prerequisites:

- Docker and Docker Compose installed

Steps:

1) Get the code and copy env

```bash
git clone https://github.com/ilhamsabir/waaku_project.git
cd waaku_project
cp .env.example .env
```

2) Create your API key

- Generate a raw UUID (client key) and its SHA‑512 hash (server key):

```bash
# macOS and Linux
RAW=$(uuidgen | tr -d '-') && echo "Raw: $RAW" && echo -n "$RAW" | shasum -a 512 | awk '{print "SHA512:", $1}'
```

3) Edit `.env` and set at least:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_API_KEY=<paste RAW here>
WAAKU_API_KEY=<paste SHA512 hash here>

# Login for the dashboard UI
VITE_AUTH_USER=admin
VITE_AUTH_PASS=admin

# Ports (change only if needed)
PORT=3000
FRONTEND_PORT=1100

# Runtime (linux for Docker; use mac for local non‑Docker macOS)
WAAKU_RUNTIME=linux
```

4) Start the stack

```bash
docker compose up --build -d
```

Open http://localhost:1100

- The web UI/API is exposed on port 1100 (container listens on 3000)
- Swagger docs: http://localhost:1100/api-docs

5) Log in to the dashboard

- Use VITE_AUTH_USER and VITE_AUTH_PASS from your `.env`

6) Create your first session

- Click “Create Session”, enter a unique session ID (e.g., mybot)
- After creating, click “Show QR” and scan it with WhatsApp on your phone
- Once connected, status changes to Ready

7) Send your first message

- Select the session
- Enter a phone number in international format (e.g., 62xxxxxxxxxx)
- Type your message, click Validate (optional) then Send

That’s it — you’re running Waaku.

## Alternative: Local run (no Docker)

Prerequisites: Node.js 18+

1) Copy env and set values

```bash
cp .env.example .env
# Set VITE_API_KEY (raw), WAAKU_API_KEY (sha512), VITE_AUTH_USER/PASS
```

2) For macOS local run, set:

```
WAAKU_RUNTIME=mac
```

3) Install and run

```bash
npm install
npm run dev
```

Open the Vite URL (default http://localhost:1100) for the UI, and http://localhost:3000 for the API.

## Using the API (optional)

You can integrate Waaku into your systems via REST. Always include your raw client key in the `X-API-Key` header.

Examples:

Create a session:

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: <RAW-UUIDv4-no-dashes>' \
  -d '{"id":"mybot"}'
```

Check QR (returns data URL):

```bash
curl -X GET http://localhost:3000/api/sessions/mybot/qr \
  -H 'X-API-Key: <RAW-UUIDv4-no-dashes>'
```

Validate a number:

```bash
curl -X POST http://localhost:3000/api/sessions/mybot/validate \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: <RAW-UUIDv4-no-dashes>' \
  -d '{"to":"62XXXXXXXXXX"}'
```

Send a message:

```bash
curl -X POST http://localhost:3000/api/sessions/mybot/send \
  -H 'Content-Type: application/json' \
  -H 'X-API-Key: <RAW-UUIDv4-no-dashes>' \
  -d '{"to":"62XXXXXXXXXX","message":"Halo dari Waaku"}'
```

List sessions:

```bash
curl -H 'X-API-Key: <RAW-UUIDv4-no-dashes>' http://localhost:3000/api/sessions
```

Health:

```bash
curl -H 'X-API-Key: <RAW-UUIDv4-no-dashes>' http://localhost:3000/api/sessions/health
```

Rotate API key (admin helper):

```bash
curl -X POST http://localhost:3000/admin/generate-api-key \
  -H 'X-API-Key: <current-RAW-key>'
```

This returns a JSON with a new `clientKey` and `serverHash` you can update in your envs.

## Operating tips

- Restart the service:

```bash
docker compose restart
```

- View logs:

```bash
docker compose logs -f
```

- Update to a newer version:

```bash
git pull
docker compose up --build -d
```

- Backup WhatsApp session data (named volume `waaku_whatsapp_sessions`):

```bash
docker run --rm -v waaku_whatsapp_sessions:/data -v $(pwd):/backup alpine \
  tar czf /backup/sessions-backup.tar.gz -C /data .
```

### Scaling

Waaku can manage multiple WhatsApp sessions in a single app instance. Start by scaling vertically, and only then consider horizontal scaling.

- Vertical scaling (simple):
  - Allocate more CPU/RAM to the container/host.
  - Keep `shm_size` large (the default compose uses 1GB) for Chromium stability.
  - A single instance can handle many sessions; monitor memory usage and CPU.

- Horizontal scaling (advanced):
  - Run multiple app instances behind Nginx with sticky sessions for Socket.IO.
  - Give each instance its own auth volume; do not share `.wwebjs_auth` across instances.
  - Use the same `WAAKU_API_KEY` across instances so the same client key works everywhere.

  Minimal compose override example (add as `docker-compose.override.yml`):

  ```yaml
  services:
  waaku-app-2:
      build: .
      environment:
        - NODE_ENV=production
        - PORT=3000
        - WAAKU_RUNTIME=linux
        # - WAAKU_API_KEY=${WAAKU_API_KEY}
        - PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
        - PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
      volumes:
        - whatsapp_sessions_b:/usr/src/app/.wwebjs_auth
      restart: unless-stopped
      shm_size: '1gb'
      networks:
  - waaku-network

  volumes:
    whatsapp_sessions_b:
      driver: local
  ```

  Update `nginx/nginx.conf` upstream with sticky sessions:

  ```nginx
  upstream whatsapp_app {
      ip_hash;  # sticky per client IP for Socket.IO
  server waaku-app:3000;
  server waaku-app-2:3000;
  }
  ```

  Apply and reload:

  ```bash
  docker compose up -d --build
  docker compose exec nginx nginx -s reload
  ```

Notes:
- Each instance manages its own session set on its own volume; the UI shows sessions for the instance you’re connected to. A unified multi-instance view would require a shared store/broker (not included).
- Keep your API key secure; rotate via `/admin/generate-api-key` if needed.

## Security notes

- Keep your RAW client key secret. Don’t share it publicly or embed it in public apps.
- Use HTTPS in production (reverse proxy such as Nginx or a cloud load balancer).
- Limit network access to the necessary ports.

## Common issues

- Socket connect error on login or dashboard stays empty:
  - RAW key (VITE_API_KEY) must match the SHA‑512 hash (WAAKU_API_KEY) on the server
  - Check browser devtools and server logs

- Port already in use (3000):
  - Change `PORT` in `.env` and the published port in `docker-compose.yml`, then re‑up

- QR not showing:
  - Ensure the session was created and the server is emitting QR; see logs
  - Try restarting the service

- Message send fails with “Evaluation failed”:
  - Use international format (e.g., 62…) and ensure the number exists; validation helps

## Where to get help

- Swagger docs at http://localhost:3000/api-docs for API details
- Open an issue in the repository if you find a bug or need a feature
