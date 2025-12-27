# Deployment Guide - Online Course Platform

## Overview

การ deploy ระบบนี้ประกอบด้วย 3 ส่วน:
1. **Database**: PostgreSQL (Railway / Supabase)
2. **Backend API**: Node.js (Railway / Render)
3. **Frontend**: React (Vercel)

---

## Option 1: Deploy ด้วย Railway (แนะนำ)

Railway ให้บริการทั้ง Database และ Backend ในที่เดียว

### ขั้นตอนที่ 1: สร้างบัญชี Railway

1. ไปที่ https://railway.app
2. Sign up ด้วย GitHub

### ขั้นตอนที่ 2: สร้าง PostgreSQL Database

1. คลิก **"New Project"**
2. เลือก **"Provision PostgreSQL"**
3. รอให้สร้างเสร็จ
4. คลิกที่ Database > **Variables** tab
5. Copy **DATABASE_URL** เก็บไว้

### ขั้นตอนที่ 3: Deploy Backend

1. ในโปรเจกต์เดียวกัน คลิก **"New"** > **"GitHub Repo"**
2. เลือก repository ของคุณ
3. ตั้งค่า Root Directory เป็น `/backend`
4. ไปที่ **Variables** tab แล้วเพิ่ม:

```
DATABASE_URL=<copy จาก PostgreSQL>
JWT_SECRET=<สร้าง random string 32+ ตัวอักษร>
JWT_REFRESH_SECRET=<สร้าง random string 32+ ตัวอักษร>
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

5. ไปที่ **Settings** > **Generate Domain**
6. Copy URL ที่ได้ (เช่น `https://xxx.railway.app`)

### ขั้นตอนที่ 4: รัน Database Migration

ใน Railway Terminal หรือ local:

```bash
# ถ้ารันจาก local
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

---

## Option 2: Deploy Backend ด้วย Render

### ขั้นตอนที่ 1: สร้าง PostgreSQL

1. ไปที่ https://render.com
2. **New** > **PostgreSQL**
3. เลือก Free tier
4. Copy **Internal Database URL**

### ขั้นตอนที่ 2: Deploy Backend

1. **New** > **Web Service**
2. เชื่อมต่อ GitHub repo
3. ตั้งค่า:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`

4. เพิ่ม Environment Variables:
```
DATABASE_URL=<Internal Database URL>
JWT_SECRET=<random string>
JWT_REFRESH_SECRET=<random string>
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

---

## Deploy Frontend ด้วย Vercel

### ขั้นตอนที่ 1: เตรียม Repository

ตรวจสอบว่ามีไฟล์ `frontend/vercel.json` แล้ว

### ขั้นตอนที่ 2: Deploy

1. ไปที่ https://vercel.com
2. Sign up ด้วย GitHub
3. คลิก **"Add New Project"**
4. Import repository ของคุณ
5. ตั้งค่า:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. เพิ่ม Environment Variable:
```
VITE_API_URL=https://your-backend.railway.app/api
```

7. คลิก **Deploy**

### ขั้นตอนที่ 3: อัปเดต Backend CORS

กลับไปที่ Railway/Render แล้วอัปเดต:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## Quick Deploy Commands

### สร้าง JWT Secrets (รันใน Terminal)

```bash
# Linux/Mac
openssl rand -base64 32

# หรือใช้ Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### ทดสอบ API

```bash
# Health Check
curl https://your-backend.railway.app/health

# Login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

---

## Environment Variables Summary

### Backend (Railway/Render)

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secret for access tokens | random-32-char-string |
| JWT_REFRESH_SECRET | Secret for refresh tokens | another-random-string |
| NODE_ENV | Environment | production |
| FRONTEND_URL | Frontend URL for CORS | https://app.vercel.app |
| PORT | Server port (auto-set) | 3000 |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | https://api.railway.app/api |

---

## Troubleshooting

### Database Connection Error

```bash
# ตรวจสอบ DATABASE_URL format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### CORS Error

1. ตรวจสอบ FRONTEND_URL ใน Backend env
2. ตรวจสอบว่า URL ไม่มี trailing slash

### Build Error

```bash
# ลอง build locally ก่อน
cd backend && npm run build
cd frontend && npm run build
```

### Prisma Error

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

---

## Cost Estimation (Free Tier)

| Service | Free Tier Limits |
|---------|-----------------|
| Railway | $5 credit/month, 500 hours |
| Render | 750 hours/month, sleeps after 15min inactivity |
| Vercel | Unlimited for hobby projects |
| Supabase | 500MB database, 2GB bandwidth |

---

## Production Checklist

- [ ] Database deployed and accessible
- [ ] Backend deployed with correct env vars
- [ ] Frontend deployed with correct API URL
- [ ] CORS configured properly
- [ ] Database migrations run
- [ ] Seed data created (optional)
- [ ] Test login with admin@example.com
- [ ] Test creating a course
- [ ] Test enrolling in a course
