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

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isVerified: true,
      bio: 'ผู้ดูแลระบบ',
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Instructor',
      role: Role.INSTRUCTOR,
      isVerified: true,
      bio: 'Full-Stack Developer ประสบการณ์ 10 ปี เชี่ยวชาญ React, Node.js, และ Cloud Technologies',
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'instructor2@example.com' },
    update: {},
    create: {
      email: 'instructor2@example.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Teacher',
      role: Role.INSTRUCTOR,
      isVerified: true,
      bio: 'Data Scientist และ Machine Learning Engineer',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash,
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      role: Role.STUDENT,
      isVerified: true,
      bio: 'นักเรียนที่กำลังศึกษาการเขียนโปรแกรม',
    },
  });

  console.log('Users created: admin, instructor, instructor2, student');

  // Create Courses
  const course1 = await prisma.course.upsert({
    where: { slug: 'react-complete-guide' },
    update: {},
    create: {
      instructorId: instructor.id,
      categoryId: categories[0].id,
      title: 'React Complete Guide 2024',
      slug: 'react-complete-guide',
      description: `เรียนรู้ React.js ตั้งแต่พื้นฐานจนถึงขั้นสูง พร้อมสร้างโปรเจกต์จริง

ในคอร์สนี้คุณจะได้เรียนรู้:
- React Fundamentals & JSX
- Components & Props
- State Management
- Hooks (useState, useEffect, useContext, etc.)
- React Router
- Redux Toolkit
- API Integration
- Testing with Jest & React Testing Library
- Deployment

พร้อมสร้างโปรเจกต์จริง 5 โปรเจกต์`,
      shortDescription: 'เรียนรู้ React.js ตั้งแต่พื้นฐานจนถึงขั้นสูง พร้อมสร้างโปรเจกต์จริง 5 โปรเจกต์',
      price: 1990,
      discountPrice: 990,
      level: CourseLevel.BEGINNER,
      requirements: ['พื้นฐาน HTML, CSS, JavaScript', 'คอมพิวเตอร์ที่ติดตั้ง Node.js'],
      whatYouLearn: [
        'เข้าใจ React.js ตั้งแต่พื้นฐานถึงขั้นสูง',
        'สร้าง Single Page Application (SPA)',
        'จัดการ State ด้วย Redux Toolkit',
        'เชื่อมต่อ API และจัดการข้อมูล',
        'เขียน Test สำหรับ React Components',
      ],
      totalDuration: 36000,
      totalLessons: 45,
      status: CourseStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date(),
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: 'nodejs-api-masterclass' },
    update: {},
    create: {
      instructorId: instructor.id,
      categoryId: categories[0].id,
      title: 'Node.js API Masterclass',
      slug: 'nodejs-api-masterclass',
      description: `เรียนรู้การสร้าง RESTful API ด้วย Node.js และ Express.js อย่างมืออาชีพ

หัวข้อที่จะได้เรียน:
- Node.js Fundamentals
- Express.js Framework
- RESTful API Design
- MongoDB & Mongoose
- Authentication & Authorization
- File Upload
- Error Handling
- Testing
- Deployment to Cloud`,
      shortDescription: 'สร้าง RESTful API ด้วย Node.js และ Express.js อย่างมืออาชีพ',
      price: 2490,
      discountPrice: 1290,
      level: CourseLevel.INTERMEDIATE,
      requirements: ['พื้นฐาน JavaScript', 'ความเข้าใจ HTTP และ API เบื้องต้น'],
      whatYouLearn: [
        'สร้าง RESTful API ที่มีโครงสร้างดี',
        'ใช้ MongoDB และ Mongoose ORM',
        'ระบบ Authentication ด้วย JWT',
        'จัดการไฟล์อัปโหลด',
        'Deploy บน Cloud Platform',
      ],
      totalDuration: 28800,
      totalLessons: 38,
      status: CourseStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date(),
    },
  });

  const course3 = await prisma.course.upsert({
    where: { slug: 'python-data-science' },
    update: {},
    create: {
      instructorId: instructor2.id,
      categoryId: categories[2].id,
      title: 'Python for Data Science',
      slug: 'python-data-science',
      description: `เริ่มต้นเรียนรู้ Data Science ด้วย Python ตั้งแต่พื้นฐาน

หัวข้อที่จะได้เรียน:
- Python Basics
- NumPy & Pandas
- Data Visualization (Matplotlib, Seaborn)
- Statistical Analysis
- Machine Learning Basics
- Real-world Projects`,
      shortDescription: 'เริ่มต้นเรียนรู้ Data Science ด้วย Python',
      price: 2990,
      discountPrice: 1490,
      level: CourseLevel.BEGINNER,
      requirements: ['ไม่จำเป็นต้องมีพื้นฐานเขียนโปรแกรม'],
      whatYouLearn: [
        'เขียน Python ได้อย่างคล่องแคล่ว',
        'วิเคราะห์ข้อมูลด้วย Pandas',
        'สร้าง Data Visualization',
        'เข้าใจ Machine Learning เบื้องต้น',
      ],
      totalDuration: 43200,
      totalLessons: 52,
      status: CourseStatus.PUBLISHED,
      isFeatured: false,
      publishedAt: new Date(),
    },
  });

  const course4 = await prisma.course.upsert({
    where: { slug: 'flutter-mobile-app' },
    update: {},
    create: {
      instructorId: instructor.id,
      categoryId: categories[1].id,
      title: 'Flutter Mobile App Development',
      slug: 'flutter-mobile-app',
      description: 'สร้างแอปมือถือสำหรับ iOS และ Android ด้วย Flutter',
      shortDescription: 'พัฒนาแอป Cross-platform ด้วย Flutter',
      price: 1990,
      level: CourseLevel.INTERMEDIATE,
      requirements: ['พื้นฐาน OOP Programming'],
      whatYouLearn: ['สร้างแอปมือถือ Cross-platform', 'ใช้ Dart Programming'],
      totalDuration: 32400,
      totalLessons: 40,
      status: CourseStatus.DRAFT,
    },
  });

  console.log('Courses created:', 4);

  // Create Sections and Lessons for Course 1
  const section1 = await prisma.section.create({
    data: {
      courseId: course1.id,
      title: 'เริ่มต้นกับ React',
      description: 'พื้นฐาน React ที่ต้องรู้',
      sortOrder: 1,
    },
  });

  const section2 = await prisma.section.create({
    data: {
      courseId: course1.id,
      title: 'React Hooks',
      description: 'เรียนรู้ React Hooks ทั้งหมด',
      sortOrder: 2,
    },
  });

  const section3 = await prisma.section.create({
    data: {
      courseId: course1.id,
      title: 'State Management',
      description: 'จัดการ State ด้วย Redux',
      sortOrder: 3,
    },
  });

  // Create Lessons
  const lessons = await Promise.all([
    // Section 1 Lessons
    prisma.lesson.create({
      data: {
        sectionId: section1.id,
        courseId: course1.id,
        title: 'React คืออะไร?',
        type: LessonType.VIDEO,
        content: 'บทนำเกี่ยวกับ React.js',
        videoUrl: 'https://example.com/videos/react-intro.mp4',
        videoDuration: 600,
        sortOrder: 1,
        isFree: true,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: section1.id,
        courseId: course1.id,
        title: 'ติดตั้ง Development Environment',
        type: LessonType.VIDEO,
        content: 'วิธีติดตั้ง Node.js และสร้างโปรเจกต์ React',
        videoUrl: 'https://example.com/videos/setup.mp4',
        videoDuration: 900,
        sortOrder: 2,
        isFree: true,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: section1.id,
        courseId: course1.id,
        title: 'JSX และ Components',
        type: LessonType.VIDEO,
        videoDuration: 1200,
        sortOrder: 3,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: section1.id,
        courseId: course1.id,
        title: 'Props และ State เบื้องต้น',
        type: LessonType.TEXT,
        content: `# Props และ State

## Props คืออะไร?
Props (Properties) คือข้อมูลที่ส่งจาก Parent Component ไปยัง Child Component

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

## State คืออะไร?
State คือข้อมูลภายใน Component ที่สามารถเปลี่ยนแปลงได้

\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\``,
        sortOrder: 4,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: section1.id,
        courseId: course1.id,
        title: 'แบบทดสอบบทที่ 1',
        type: LessonType.QUIZ,
        sortOrder: 5,
        isPublished: true,
      },
    }),
    // Section 2 Lessons
    prisma.lesson.create({
      data: {
        sectionId: section2.id,
        courseId: course1.id,
        title: 'useState Hook',
        type: LessonType.VIDEO,
        videoDuration: 1500,
        sortOrder: 1,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: section2.id,
        courseId: course1.id,
        title: 'useEffect Hook',
        type: LessonType.VIDEO,
        videoDuration: 1800,
        sortOrder: 2,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: section2.id,
        courseId: course1.id,
        title: 'useContext Hook',
        type: LessonType.VIDEO,
        videoDuration: 1200,
        sortOrder: 3,
        isPublished: true,
      },
    }),
    // Section 3 Lessons
    prisma.lesson.create({
      data: {
        sectionId: section3.id,
        courseId: course1.id,
        title: 'Redux Toolkit เบื้องต้น',
        type: LessonType.VIDEO,
        videoDuration: 2400,
        sortOrder: 1,
        isPublished: true,
      },
    }),
    prisma.lesson.create({
      data: {
        sectionId: section3.id,
        courseId: course1.id,
        title: 'สร้าง Store และ Slice',
        type: LessonType.VIDEO,
        videoDuration: 1800,
        sortOrder: 2,
        isPublished: true,
      },
    }),
  ]);

  console.log('Sections and Lessons created');

  // Create Quiz for lesson 5
  const quizLesson = lessons[4];
  const quiz = await prisma.quiz.create({
    data: {
      lessonId: quizLesson.id,
      passingScore: 70,
      timeLimit: 600,
      maxAttempts: 3,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz.id,
        question: 'React ถูกพัฒนาโดยบริษัทใด?',
        questionType: 'single',
        options: JSON.stringify(['Google', 'Facebook (Meta)', 'Microsoft', 'Amazon']),
        correctAnswers: JSON.stringify([1]),
        explanation: 'React ถูกพัฒนาโดย Facebook (ปัจจุบันคือ Meta)',
        points: 10,
        sortOrder: 1,
      },
      {
        quizId: quiz.id,
        question: 'JSX คืออะไร?',
        questionType: 'single',
        options: JSON.stringify([
          'JavaScript XML',
          'Java Syntax Extension',
          'JSON XML',
          'JavaScript Extension',
        ]),
        correctAnswers: JSON.stringify([0]),
        explanation: 'JSX ย่อมาจาก JavaScript XML',
        points: 10,
        sortOrder: 2,
      },
      {
        quizId: quiz.id,
        question: 'Props ใน React มีลักษณะอย่างไร?',
        questionType: 'single',
        options: JSON.stringify([
          'สามารถเปลี่ยนแปลงค่าได้ภายใน Component',
          'เป็น Read-only ไม่สามารถแก้ไขได้',
          'ใช้ได้เฉพาะกับ Class Component',
          'ต้องเป็น String เท่านั้น',
        ]),
        correctAnswers: JSON.stringify([1]),
        explanation: 'Props เป็น Read-only ไม่สามารถแก้ไขค่าได้ภายใน Component ที่รับมา',
        points: 10,
        sortOrder: 3,
      },
    ],
  });

  console.log('Quiz created with questions');

  // Create Enrollments
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      progressPercent: 20,
      status: 'ACTIVE',
    },
  });

  console.log('Enrollment created');

  // Create Lesson Progress
  await prisma.lessonProgress.createMany({
    data: [
      {
        enrollmentId: enrollment.id,
        lessonId: lessons[0].id,
        userId: student.id,
        isCompleted: true,
        watchTime: 600,
        completedAt: new Date(),
      },
      {
        enrollmentId: enrollment.id,
        lessonId: lessons[1].id,
        userId: student.id,
        isCompleted: true,
        watchTime: 900,
        completedAt: new Date(),
      },
      {
        enrollmentId: enrollment.id,
        lessonId: lessons[2].id,
        userId: student.id,
        isCompleted: false,
        watchTime: 300,
        lastPosition: 300,
      },
    ],
  });

  console.log('Lesson progress created');

  // Create Reviews
  await prisma.review.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      enrollmentId: enrollment.id,
      rating: 5,
      comment: 'คอร์สดีมากครับ อธิบายเข้าใจง่าย เหมาะสำหรับมือใหม่ แนะนำเลย!',
    },
  });

  console.log('Review created');

  // Create Course Statistics
  await prisma.courseStatistics.create({
    data: {
      courseId: course1.id,
      totalEnrollments: 1,
      totalReviews: 1,
      averageRating: 5.0,
      totalRevenue: 990,
    },
  });

  console.log('Course statistics created');

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
