import { PrismaClient, Role, CourseStatus, CourseLevel, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'เรียนรู้การพัฒนาเว็บไซต์ตั้งแต่พื้นฐานจนถึงขั้นสูง',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mobile-development' },
      update: {},
      create: {
        name: 'Mobile Development',
        slug: 'mobile-development',
        description: 'พัฒนาแอปพลิเคชันมือถือสำหรับ iOS และ Android',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        slug: 'data-science',
        description: 'เรียนรู้การวิเคราะห์ข้อมูลและ Machine Learning',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: 'Design',
        slug: 'design',
        description: 'ออกแบบ UI/UX และกราฟิกดีไซน์',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'ทักษะการบริหารธุรกิจและการตลาด',
      },
    }),
  ]);

  console.log('Categories created:', categories.length);

  // Code to create users, courses, etc. removed as requested.
  console.log('Test accounts and data seeding skipped.');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
