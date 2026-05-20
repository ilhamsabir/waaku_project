# Waaku VPS Deployment Guide

## Prerequisites

- VPS dengan Ubuntu
- Docker & Docker Compose terinstall
- Domain atau IP Public

## 1. Setup SSL (Self-Signed Certificate)

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

## 2. Configure Nginx

Buat file `/etc/nginx/sites-available/app`:

```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name YOUR_VPS_IP;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:4300;

        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-API-Key $http_x_api_key;

        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan config:

```bash
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Configure Docker Environment

Edit `.env` file:

```env
# Server Configuration
PORT=4300
NODE_ENV=production

# API Key (UUID4 + SHA-512)
VITE_API_KEY=your-uuid-key
WAAKU_API_KEY=your-sha512-hash

# SSL Certificate - PENTING untuk self-signed SSL
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/nginx-selfsigned.crt
NODE_TLS_REJECT_UNAUTHORIZED=0

# Volumes (optional)
WAAKU_RUNTIME=linux
```

## 4. Update docker-compose.yml

Pastikan volume mount SSL tersedia:

```yaml
services:
  app:
    volumes:
      - /etc/ssl/certs:/etc/ssl/certs:ro
```

## 5. Deploy

```bash
# Build dan start container
docker-compose down
docker-compose build
docker-compose up -d

# Cek status
docker ps
docker logs -f waaku
```

## 6. Test API

```bash
curl --location 'https://YOUR_VPS_IP/api/sessions' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: your-api-key' \
--data '{"id":"test-session"}'
```

## 7. Konfigurasi Vercel (Jika Backend di Vercel)

Tambah environment variable di Vercel Dashboard:

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Troubleshooting

### Error: "self-signed certificate"
- Pastikan `NODE_TLS_REJECT_UNAUTHORIZED=0` sudah diset
- Atau install SSL valid (Let's Encrypt)

### Error: "Failed to start session"
- Cek logs: `docker logs waaku`
- Pastikan port benar (4300 tidak 8080)
- Cek nginx headers sudah benar

### API Key tidak terbaca
- Pastikan `proxy_set_header X-API-Key $http_x_api_key;` ada di nginx config

## Catatan Keamanan

`NODE_TLS_REJECT_UNAUTHORIZED=0` tidak aman untuk production. Setelah deployment stabil:
1. Ganti ke SSL valid (Let's Encrypt)
2. Hapus `NODE_TLS_REJECT_UNAUTHORIZED=0`
3. Gunakan `NODE_EXTRA_CA_CERTS` dengan SSL valid