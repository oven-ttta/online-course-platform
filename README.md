# Online Course Platform

ระบบแพลตฟอร์มเรียนออนไลน์ที่พัฒนาด้วย React, Node.js, Express, และ PostgreSQL

## สถาปัตยกรรมระบบ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   PostgreSQL    │
│   (React)       │     │   (Express)     │     │   Database      │
│   Port: 5173    │     │   Port: 3000    │     │   Port: 5432    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt (Password Hashing)
- Multer (File Upload)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios
- React Query
- React Hook Form

---

## การติดตั้งและใช้งาน

### ขั้นตอนที่ 1: Clone และติดตั้ง Dependencies

```bash
# Clone หรือเข้าไปยังโฟลเดอร์โปรเจกต์
cd online-course-platform

# ติดตั้ง Backend Dependencies
cd backend
bun install

# ติดตั้ง Frontend Dependencies
cd ../frontend
bun install
```

### ขั้นตอนที่ 2: ตั้งค่า Database

#### วิธีที่ 1: ใช้ Docker (แนะนำ)

```bash
# รันที่ root ของโปรเจกต์
docker-compose up -d
```

#### วิธีที่ 2: ติดตั้ง PostgreSQL เอง

1. ติดตั้ง PostgreSQL บนเครื่อง
2. สร้าง Database ชื่อ `online_course_db`

```sql
CREATE DATABASE online_course_db;
```

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

```bash
# Backend: สร้างไฟล์ .env ใน folder backend
cd backend
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/online_course_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-refresh-token-secret-key"
PORT=3000
```

### ขั้นตอนที่ 4: รัน Database Migration

```bash
cd backend

# สร้าง Database Tables
bun x prisma migrate dev --name init

# สร้างข้อมูลเริ่มต้น (Seed)
bun run seed
```

### ขั้นตอนที่ 5: รันระบบ

#### Terminal 1 - Backend
```bash
cd backend
bun run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
bun run dev
```

### ขั้นตอนที่ 6: เปิดใช้งาน

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

---


## โครงสร้างโปรเจกต์

```
online-course-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database Schema
│   │   └── seed.ts            # Seed Data
│   ├── src/
│   │   ├── controllers/       # Request Handlers
│   │   ├── middleware/        # Auth, Validation, etc.
│   │   ├── routes/            # API Routes
│   │   ├── services/          # Business Logic
│   │   ├── utils/             # Helper Functions
│   │   └── index.ts           # Entry Point
│   ├── uploads/               # Uploaded Files
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable Components
│   │   │   ├── common/        # Buttons, Inputs, etc.
│   │   │   ├── layout/        # Navbar, Sidebar, Footer
│   │   │   └── features/      # Feature-specific Components
│   │   ├── pages/             # Page Components
│   │   ├── hooks/             # Custom Hooks
│   │   ├── contexts/          # React Context
│   │   ├── services/          # API Calls
│   │   ├── types/             # TypeScript Types
│   │   ├── utils/             # Helper Functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | สมัครสมาชิก |
| POST | /api/auth/login | เข้าสู่ระบบ |
| POST | /api/auth/logout | ออกจากระบบ |
| POST | /api/auth/refresh | Refresh Token |
| GET | /api/auth/me | ข้อมูลผู้ใช้ปัจจุบัน |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses | รายการคอร์สทั้งหมด |
| GET | /api/courses/:slug | รายละเอียดคอร์ส |
| POST | /api/courses | สร้างคอร์ส (Instructor) |
| PUT | /api/courses/:id | แก้ไขคอร์ส (Instructor) |
| DELETE | /api/courses/:id | ลบคอร์ส (Instructor) |

### Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses/:courseId/lessons | รายการบทเรียน |
| GET | /api/lessons/:id | รายละเอียดบทเรียน |
| POST | /api/courses/:courseId/lessons | สร้างบทเรียน |
| PUT | /api/lessons/:id | แก้ไขบทเรียน |

### Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/courses/:courseId/enroll | ลงทะเบียนเรียน |
| GET | /api/enrollments | คอร์สที่ลงทะเบียน |
| PUT | /api/progress/:lessonId | อัปเดต Progress |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses/:courseId/reviews | รีวิวของคอร์ส |
| POST | /api/courses/:courseId/reviews | เขียนรีวิว |

---

## คำสั่งที่ใช้บ่อย

### Backend
```bash
# รัน Development Server
bun run dev

# Build Production
bun run build

# รัน Production
bun run start

# Prisma Commands
bun x prisma studio          # เปิด Database GUI
bun x prisma migrate dev     # รัน Migration
bun x prisma db push         # Push Schema ไป DB
bun x prisma generate        # Generate Prisma Client
bun run seed                 # รัน Seed Data
```

### Frontend
```bash
# รัน Development Server
bun run dev

# Build Production
bun run build

# Preview Production Build
bun run preview
```

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build
```

---

## Features

### สำหรับ Student
- [x] สมัครสมาชิก / เข้าสู่ระบบ
- [x] ดูรายการคอร์ส
- [x] ค้นหาและกรองคอร์ส
- [x] ดูรายละเอียดคอร์ส
- [x] ลงทะเบียนเรียน
- [x] เรียนบทเรียน (Video/Text)
- [x] ติดตาม Progress
- [x] ทำ Quiz
- [x] เขียน Review
- [x] ดู Dashboard ส่วนตัว

### สำหรับ Instructor
- [x] สร้าง/แก้ไข/ลบคอร์ส
- [x] เพิ่มบทเรียน (Video/Text/Quiz)
- [x] ดูสถิติผู้เรียน
- [x] ตอบ Review
- [x] ดูรายได้

### สำหรับ Admin
- [x] จัดการผู้ใช้
- [x] อนุมัติ/ปฏิเสธคอร์ส
- [x] จัดการหมวดหมู่
- [x] ดูรายงานรายได้
- [x] Dashboard ภาพรวม

---

## License

MIT License
