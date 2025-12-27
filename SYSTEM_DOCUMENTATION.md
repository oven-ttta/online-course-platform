# Online Course Platform - System Documentation

## Overview

ระบบ Online Course Platform สำหรับการเรียนการสอนออนไลน์ พัฒนาด้วย React + Node.js + PostgreSQL

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Tunnel                             │
│              (6aa42026-2845-4b40-9bad-11b0e9e0089e)             │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Frontend     │  │    Backend      │  │    Database     │
│    (Vercel)     │  │   (Docker)      │  │   (PostgreSQL)  │
│                 │  │                 │  │                 │
│ React + Vite    │  │ Node.js/Express │  │  + pgweb UI     │
│ Tailwind CSS    │  │ Prisma ORM      │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │     MinIO       │
                     │ (Object Storage)│
                     └─────────────────┘
```

---

## URLs & Endpoints

### Production URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | https://frontend-rose-nu-28.vercel.app | React Web Application |
| Backend API | https://course-api.ovenx.shop | REST API Server |
| Database UI | https://db.ovenx.shop | pgweb - PostgreSQL Web Interface |
| MinIO Console | https://console-minio.ovenx.shop | Object Storage Management |
| Code Server | https://code.ovenx.shop | VS Code in Browser |

### API Endpoints

Base URL: `https://course-api.ovenx.shop/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh-token` | Refresh JWT token |
| GET | `/courses` | List all courses |
| GET | `/courses/:slug` | Get course details |
| GET | `/categories` | List all categories |
| POST | `/upload/image` | Upload image |
| POST | `/upload/video` | Upload video |
| POST | `/upload/thumbnail` | Upload thumbnail |

---

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context + Hooks
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Hosting:** Vercel

### Backend
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Authentication:** JWT (Access + Refresh Tokens)
- **File Upload:** Multer + MinIO
- **Hosting:** Docker on Linux Server

### Database
- **Database:** PostgreSQL 15
- **SSL:** Enabled
- **Management UI:** pgweb
- **ORM:** Prisma

### Storage
- **Object Storage:** MinIO (S3-compatible)
- **Bucket:** uploads
- **Folders:** images, videos, thumbnails, attachments

### Infrastructure
- **Tunnel:** Cloudflare Tunnel
- **Server:** Linux (192.168.1.13)
- **Container:** Docker + Docker Compose

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `STUDENT` | ผู้เรียน | ดูคอร์ส, ลงทะเบียนเรียน, ทำแบบทดสอบ, รีวิว |
| `INSTRUCTOR` | ผู้สอน | สร้าง/แก้ไขคอร์ส, จัดการบทเรียน, ดูสถิติ |
| `ADMIN` | ผู้ดูแลระบบ | จัดการผู้ใช้, จัดการหมวดหมู่, ดูรายงานทั้งหมด |

---

## Default Accounts (Seed Data)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password123 | ADMIN |
| instructor@example.com | password123 | INSTRUCTOR |
| instructor2@example.com | password123 | INSTRUCTOR |
| student@example.com | password123 | STUDENT |

---

## Environment Variables

### Frontend (.env.production)

```env
VITE_API_URL=https://course-api.ovenx.shop/api
```

### Backend (docker-compose.yml)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/online_course_db?sslmode=prefer
JWT_SECRET=super-secret-jwt-key-for-online-course-platform-2024
JWT_REFRESH_SECRET=super-secret-refresh-key-for-online-course-platform-2024
FRONTEND_URL=https://frontend-rose-nu-28.vercel.app
MINIO_ENDPOINT=minio.ovenx.shop
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin12345
MINIO_BUCKET=uploads
```

---

## Database Schema

### Main Tables

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │     │     Course      │     │    Category     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID)       │────▶│ id (UUID)       │◀────│ id (INT)        │
│ email           │     │ instructorId    │     │ name            │
│ password        │     │ categoryId      │     │ slug            │
│ firstName       │     │ title           │     │ description     │
│ lastName        │     │ slug            │     │ icon            │
│ role            │     │ description     │     └─────────────────┘
│ avatarUrl       │     │ price           │
│ isActive        │     │ level           │
└─────────────────┘     │ status          │
                        └─────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    Section      │  │   Enrollment    │  │     Review      │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ id (UUID)       │  │ id (UUID)       │  │ id (UUID)       │
│ courseId        │  │ userId          │  │ userId          │
│ title           │  │ courseId        │  │ courseId        │
│ order           │  │ status          │  │ rating          │
└─────────────────┘  │ progress        │  │ comment         │
        │            └─────────────────┘  └─────────────────┘
        ▼
┌─────────────────┐
│     Lesson      │
├─────────────────┤
│ id (UUID)       │
│ sectionId       │
│ title           │
│ type            │
│ content         │
│ videoUrl        │
│ duration        │
└─────────────────┘
```

### Enums

```typescript
enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum CourseStatus {
  DRAFT
  PENDING_REVIEW
  PUBLISHED
  ARCHIVED
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  ALL_LEVELS
}

enum LessonType {
  VIDEO
  TEXT
  QUIZ
  ASSIGNMENT
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  REFUNDED
}
```

---

## Docker Services

### Container Status

```bash
# ดู containers ที่รันอยู่
docker ps

# Expected output:
CONTAINER ID   IMAGE              STATUS          PORTS
course_api     backend-backend    Up X minutes    0.0.0.0:3000->3000/tcp
course_db      backend-postgres   Up X minutes    0.0.0.0:5432->5432/tcp
pgweb          sosedoff/pgweb     Up X minutes    0.0.0.0:8082->8081/tcp
```

### Docker Commands

```bash
# Start services
cd /root/online-course-platform/backend
docker compose up -d

# Stop services
docker compose down

# Rebuild and start
docker compose up -d --build

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f postgres

# Execute command in container
docker exec -it course_api sh
docker exec -it course_db psql -U postgres

# Restart specific service
docker compose restart backend
```

---

## Deployment Guide

### Deploy Frontend (Vercel)

```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

### Deploy Backend (Docker)

```bash
# SSH to server
ssh root@192.168.1.13

# Pull latest code
cd /root/online-course-platform
git pull

# Rebuild and deploy
cd backend
docker compose down
docker compose up -d --build

# Run migrations (if needed)
docker exec course_api npx prisma db push

# Run seed (if needed)
docker exec course_api npx prisma db seed
```

### Update Cloudflare Tunnel

```bash
# Edit config
nano /etc/cloudflared/config.yml

# Restart tunnel
systemctl restart cloudflared

# Check status
systemctl status cloudflared
```

---

## API Usage Examples

### Authentication

#### Register
```bash
curl -X POST https://course-api.ovenx.shop/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST https://course-api.ovenx.shop/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Courses

#### Get All Courses
```bash
curl https://course-api.ovenx.shop/api/courses
```

#### Get Course by Slug
```bash
curl https://course-api.ovenx.shop/api/courses/react-complete-guide
```

#### Create Course (Instructor)
```bash
curl -X POST https://course-api.ovenx.shop/api/courses \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Course",
    "description": "Course description",
    "categoryId": 1,
    "price": 1990,
    "level": "BEGINNER"
  }'
```

### File Upload

#### Upload Image
```bash
curl -X POST https://course-api.ovenx.shop/api/upload/image \
  -H "Authorization: Bearer <access_token>" \
  -F "image=@/path/to/image.jpg"
```

#### Upload Video
```bash
curl -X POST https://course-api.ovenx.shop/api/upload/video \
  -H "Authorization: Bearer <access_token>" \
  -F "video=@/path/to/video.mp4"
```

---

## Database Management

### Access pgweb (Web UI)

1. Open https://db.ovenx.shop in browser
2. Database is pre-connected
3. Run SQL queries, view tables, export data

### Direct PostgreSQL Connection

```bash
# Via Docker
docker exec -it course_db psql -U postgres -d online_course_db

# Common commands
\dt                    # List tables
\d users               # Describe table
SELECT * FROM users;   # Query data
```

### Prisma Commands

```bash
# Generate client
npx prisma generate

# Push schema changes
npx prisma db push

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Seed database
npx prisma db seed
```

---

## MinIO Storage

### Access MinIO Console

1. Open https://console-minio.ovenx.shop
2. Login with:
   - Username: `admin`
   - Password: `admin12345`

### Bucket Structure

```
uploads/
├── images/          # Course images, avatars
├── videos/          # Lesson videos
├── thumbnails/      # Course thumbnails
├── attachments/     # Lesson attachments
└── files/           # Other files
```

### File URL Format

```
https://minio.ovenx.shop/uploads/{folder}/{timestamp}-{filename}
```

---

## Cloudflare Tunnel Configuration

### Config File Location
```
/etc/cloudflared/config.yml
```

### Current Configuration

```yaml
tunnel: 6aa42026-2845-4b40-9bad-11b0e9e0089e
credentials-file: /root/.cloudflared/6aa42026-2845-4b40-9bad-11b0e9e0089e.json
ingress:
  - hostname: n8n.ovenx.shop
    service: http://localhost:5678
  - hostname: course-api.ovenx.shop
    service: http://localhost:3000
  - hostname: db.ovenx.shop
    service: http://localhost:8082
  - hostname: code.ovenx.shop
    service: http://localhost:1123
  - hostname: minio.ovenx.shop
    service: http://localhost:9000
  - hostname: console-minio.ovenx.shop
    service: http://localhost:9001
  - service: http_status:404
```

### Add New Subdomain

```bash
# 1. Edit config
nano /etc/cloudflared/config.yml

# 2. Add new entry before "- service: http_status:404"
  - hostname: newservice.ovenx.shop
    service: http://localhost:PORT

# 3. Add DNS route
cloudflared tunnel route dns 6aa42026-2845-4b40-9bad-11b0e9e0089e newservice.ovenx.shop

# 4. Restart tunnel
systemctl restart cloudflared
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Database not ready - wait for postgres healthcheck
# 2. Prisma client not generated - run: docker exec course_api npx prisma generate
# 3. Port already in use - check: netstat -tlnp | grep 3000
```

### Database Connection Failed

```bash
# Check if postgres is running
docker ps | grep course_db

# Check postgres logs
docker compose logs postgres

# Test connection
docker exec course_db pg_isready -U postgres
```

### Cloudflare Tunnel Issues

```bash
# Check tunnel status
systemctl status cloudflared

# View tunnel logs
journalctl -u cloudflared -f

# Validate config
cloudflared tunnel ingress validate

# Common issues:
# 1. Invalid YAML - check indentation
# 2. Duplicate hostnames - remove duplicates
# 3. Service not running - check if local service is up
```

### File Upload Failed

```bash
# Check MinIO connection
curl -I https://minio.ovenx.shop/minio/health/live

# Check bucket exists
# Login to console-minio.ovenx.shop and verify "uploads" bucket

# Check CORS settings in MinIO
# Ensure frontend URL is allowed
```

---

## Security Considerations

### JWT Tokens
- Access Token: 15 minutes expiry
- Refresh Token: 7 days expiry
- Stored in HTTP-only cookies (recommended) or localStorage

### Database
- SSL enabled for external connections
- Strong passwords required
- Regular backups recommended

### File Upload
- File type validation
- File size limits (100MB default)
- Virus scanning recommended for production

### API Security
- Rate limiting recommended
- CORS configured for frontend origin
- Input validation on all endpoints

---

## Maintenance

### Daily
- Monitor error logs
- Check disk space
- Verify backups

### Weekly
- Update dependencies (npm update)
- Review security alerts
- Check SSL certificate expiry

### Monthly
- Database optimization (VACUUM, ANALYZE)
- Log rotation
- Performance review

---

## Support & Resources

### Repository
https://github.com/oven-ttta/online-course-platform

### Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MinIO](https://min.io/docs/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-27 | Initial release |

---

*Last Updated: 2025-12-27*
