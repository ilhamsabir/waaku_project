# WhatsApp Multi-Session Manager

Aplikasi web untuk mengelola multiple session WhatsApp menggunakan Vue.js dan Express.js dengan whatsapp-web.js.

## 🚀 Fitur

- ✅ Mengelola multiple session WhatsApp
- ✅ Generate QR Code untuk autentikasi
- ✅ Validasi nomor WhatsApp
- ✅ Kirim pesan ke nomor yang valid
- ✅ Interface web yang responsive dengan Tailwind CSS
- ✅ Docker support untuk deployment mudah

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, whatsapp-web.js
- **Containerization**: Docker, Docker Compose

## 📋 Prerequisites

Pastikan Anda telah menginstall:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd waaku
```

### 2. Jalankan dengan Docker Compose

#### Production Mode

```bash
# Build dan jalankan aplikasi
docker-compose up -d

# Atau build ulang jika ada perubahan
docker-compose up --build -d
```

Aplikasi akan tersedia di:
- **Web Interface**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`

#### Development Mode

```bash
# Jalankan dalam mode development
docker-compose -f docker-compose.dev.yml up -d

# Lihat logs
docker-compose -f docker-compose.dev.yml logs -f
```

Development server akan tersedia di:
- **Backend API**: `http://localhost:3000`
- **Frontend (Vite HMR)**: `http://localhost:1100`
- **API Documentation**: `http://localhost:3000/api-docs`

> **💡 Tips Development:**
> - Frontend Vite server (port 1100) untuk hot reload dan fast refresh
> - Backend API server (port 3000) untuk REST API endpoints
> - Vite secara otomatis akan proxy API calls ke backend server

### 3. Dengan Nginx (Opsional)

Jika Anda ingin menggunakan Nginx sebagai reverse proxy:

```bash
# Jalankan dengan nginx
docker-compose --profile with-nginx up -d
```

## 📁 Struktur Project

```
waaku/
├── src/
│   ├── api/                 # Backend API
│   │   ├── index.js        # Express server
│   │   ├── routes/
│   │   │   └── session.js  # Session routes
│   │   └── whatsapp/
│   │       └── session.js  # WhatsApp session manager
│   └── app/                # Frontend Vue.js
│       ├── App.vue         # Main component
│       ├── main.js         # Vue app entry
│       └── index.css       # Tailwind styles
├── nginx/                  # Nginx configuration
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── Dockerfile             # Production image
├── Dockerfile.dev         # Development image
└── package.json           # Dependencies
```

## 🔧 Konfigurasi

### Environment Variables

Buat file `.env` di root directory (opsional):

```env
NODE_ENV=production
PORT=3000
```

### Port Configuration

#### Production Mode
- **Main Application**: Port 3000
- **Nginx (optional)**: Port 80/443

#### Development Mode
- **Backend API**: Port 3000
- **Frontend Vite**: Port 1100 (configurable di `vite.config.js`)

Untuk mengubah port Vite development server:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 1100,  // Ubah ke port yang diinginkan
    host: true,
    cors: true
  }
})
```

### Docker Volumes

Aplikasi menggunakan named volume untuk menyimpan data session WhatsApp:

- `whatsapp_sessions`: Menyimpan data autentikasi WhatsApp
- `./logs`: Mount logs (opsional)

## 🖥️ Penggunaan

### 1. Tambah Session Baru
- Masukkan Session ID di form "Add Session"
- Klik tombol "Add" untuk membuat session baru

### 2. Scan QR Code
- Jika session belum ready, klik "Show QR"
- Scan QR code dengan WhatsApp di HP Anda
- Status akan berubah menjadi "Ready" setelah berhasil

### 3. Kirim Pesan
- Masukkan nomor tujuan (format: 62xxx)
- Tulis pesan yang ingin dikirim
- Klik "Validate" untuk memastikan nomor valid
- Klik "Send" untuk mengirim pesan

## 🐳 Docker Commands

### Management Commands

```bash
# Lihat status container
docker-compose ps

# Lihat logs
docker-compose logs -f whatsapp-app

# Restart aplikasi
docker-compose restart

# Stop aplikasi
docker-compose down

# Stop dan hapus volumes
docker-compose down -v

# Build ulang image
docker-compose build --no-cache
```

### Development Commands

```bash
# Jalankan development mode
docker-compose -f docker-compose.dev.yml up -d

# Lihat logs development
docker-compose -f docker-compose.dev.yml logs -f

# Masuk ke container untuk debugging
docker-compose exec whatsapp-app-dev sh
```

## 🔍 Monitoring & Debugging

### Health Check

Aplikasi memiliki built-in health check yang dapat diakses di:
```
http://localhost:3000/health
```

### Logs

```bash
# Lihat semua logs
docker-compose logs

# Lihat logs real-time
docker-compose logs -f

# Lihat logs spesifik service
docker-compose logs whatsapp-app
```

### Debugging

Masuk ke container untuk debugging:

```bash
# Production container
docker-compose exec whatsapp-app sh

# Development container
docker-compose -f docker-compose.dev.yml exec whatsapp-app-dev sh
```

## 🔒 Security Considerations

### Production Deployment

1. **Gunakan HTTPS**: Konfigurasikan SSL certificate di nginx
2. **Environment Variables**: Simpan sensitive data di environment variables
3. **Network Security**: Batasi akses port hanya yang diperlukan
4. **Regular Updates**: Update base image dan dependencies secara berkala

### SSL Configuration

Untuk mengaktifkan HTTPS, uncomment konfigurasi SSL di `nginx/nginx.conf` dan tempatkan certificate di `nginx/ssl/`.

## 📊 Performance

### Resource Requirements

- **Minimum**: 1 CPU, 1GB RAM
- **Recommended**: 2 CPU, 2GB RAM untuk multiple sessions

### Scaling

Untuk menangani lebih banyak session, Anda dapat:

1. Increase container resources:
```bash
docker-compose up --scale whatsapp-app=3
```

2. Use nginx load balancer untuk distribute load

## 🐛 Troubleshooting

### Common Issues

#### 1. Frontend Build Error (ENOENT: dist/index.html)
```bash
# Build frontend assets
npm run build

# Or setup development environment
./start.sh setup

# For local development
./start.sh local
```

**Penyebab:** Frontend belum di-build atau folder `dist` tidak ada.

**Solusi:**
- Jalankan `npm run build` untuk production build
- Gunakan `npm run dev` untuk development dengan hot reload
- Server akan menampilkan fallback page jika `dist` tidak ada

#### 2. QR Code tidak muncul
```bash
# Check logs untuk error
docker-compose logs whatsapp-app

# Restart container
docker-compose restart whatsapp-app
```

#### 2. Session tidak tersimpan
```bash
# Pastikan volume mounted dengan benar
docker volume ls
docker volume inspect waaku_whatsapp_sessions
```

#### 3. Chrome/Chromium issues
```bash
# Rebuild dengan no-cache
docker-compose build --no-cache
```

#### 4. Port sudah digunakan
```bash
# Ubah port di docker-compose.yml
ports:
  - "3001:3000"  # Ganti 3000 ke port lain
```

### Debug Mode

Untuk debugging lebih detail, set environment variable:

```yaml
# Tambah di docker-compose.yml
environment:
  - DEBUG=whatsapp-web.js:*
  - NODE_ENV=development
```

## 🔄 Updates & Maintenance

### Update Aplikasi

```bash
# Pull latest changes
git pull

# Rebuild dan restart
docker-compose down
docker-compose up --build -d
```

### Backup Session Data

```bash
# Backup volume
docker run --rm -v waaku_whatsapp_sessions:/data -v $(pwd):/backup alpine tar czf /backup/sessions-backup.tar.gz -C /data .

# Restore volume
docker run --rm -v waaku_whatsapp_sessions:/data -v $(pwd):/backup alpine tar xzf /backup/sessions-backup.tar.gz -C /data
```

### Cleanup

```bash
# Hapus unused images
docker image prune -a

# Hapus unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## � API Documentation

Aplikasi ini dilengkapi dengan dokumentasi API interaktif menggunakan **Swagger/OpenAPI 3.0**.

### 🔗 Akses Dokumentasi

- **Swagger UI**: `http://localhost:3000/api-docs`
- **API Info**: `http://localhost:3000/api-info`
- **JSON Spec**: `http://localhost:3000/api-docs.json`

### ✨ Fitur Dokumentasi

- 📖 **Interactive API Explorer** - Test endpoints langsung dari browser
- 📋 **Complete Schema Documentation** - Model dan response yang lengkap
- 🔧 **Request/Response Examples** - Contoh payload untuk setiap endpoint
- 🏷️ **Organized by Tags** - Endpoints dikelompokkan berdasarkan fungsi
- 🔍 **Search & Filter** - Cari endpoints dengan mudah
- 💾 **Export Options** - Download sebagai OpenAPI spec atau Postman collection
- 📁 **Modular Documentation** - Dokumentasi terpisah per kategori untuk maintainability

### 📂 Struktur Dokumentasi

```
src/api/docs/
├── index.js      # Index untuk semua dokumentasi
├── schemas.js    # Component schemas & responses
├── general.js    # General endpoints (/health, /api)
├── sessions.js   # Session management endpoints
├── messages.js   # Message & validation endpoints
└── health.js     # Health monitoring endpoints
```

### 📁 Postman Collection

Import collection siap pakai: `postman/WhatsApp-Multi-Session-API.postman_collection.json`

```bash
# Variables untuk testing
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
