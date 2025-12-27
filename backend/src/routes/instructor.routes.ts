import { Router } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendPaginated } from '../utils/response';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require instructor authentication
router.use(authenticate, authorize('INSTRUCTOR', 'ADMIN'));

// Dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const instructorId = req.user!.userId;

    const [courses, totalEnrollments, totalRevenue, recentEnrollments] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId },
        include: {
          statistics: true,
          _count: {
            select: { enrollments: true, reviews: true },
          },
        },
      }),
      prisma.enrollment.count({
        where: { course: { instructorId } },
      }),
      prisma.payment.aggregate({
        where: {
          course: { instructorId },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.enrollment.findMany({
        where: { course: { instructorId } },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
          course: {
            select: { title: true, slug: true },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate average rating
    const avgRating = courses.reduce((acc, course) => {
      return acc + (Number(course.statistics?.averageRating) || 0);
    }, 0) / (courses.length || 1);

    sendSuccess(res, {
      overview: {
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.status === 'PUBLISHED').length,
        draftCourses: courses.filter((c) => c.status === 'DRAFT').length,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageRating: avgRating.toFixed(2),
      },
      courses,
      recentEnrollments,
    });
  } catch (error) {
    next(error);
  }
});

// Get instructor's courses
router.get('/courses', async (req, res, next) => {
  try {
    const instructorId = req.user!.userId;
    const { page = '1', limit = '10', status } = req.query;

    const where: any = { instructorId };
    if (status) where.status = status;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: true,
          statistics: true,
          _count: {
            select: { enrollments: true, reviews: true, lessons: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.course.count({ where }),
    ]);

    sendPaginated(res, courses, total, parseInt(page as string), parseInt(limit as string));
  } catch (error) {
    next(error);
  }
});

// Get course students
router.get('/courses/:courseId/students', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user!.userId;
    const { page = '1', limit = '20' } = req.query;

    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.instructorId !== instructorId) {
      return sendSuccess(res, { error: 'Course not found or not owned' });
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          lessonProgress: {
            select: { isCompleted: true },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.enrollment.count({ where: { courseId } }),
    ]);

    sendPaginated(res, enrollments, total, parseInt(page as string), parseInt(limit as string));
  } catch (error) {
    next(error);
  }
});

// Get course stats
router.get('/courses/:courseId/stats', async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user!.userId;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        statistics: true,
        sections: {
          include: {
            lessons: {
              include: {
                _count: {
                  select: { lessonProgress: true },
                },
              },
            },
          },
        },
      },
    });

    if (!course || course.instructorId !== instructorId) {
      return sendSuccess(res, { error: 'Course not found' });
    }

    // Enrollment over time
    const enrollmentsByMonth = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', enrolled_at) as month,
        COUNT(*) as count
      FROM enrollments
      WHERE course_id = ${courseId}
      GROUP BY DATE_TRUNC('month', enrolled_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    // Review stats
    const reviewStats = await prisma.review.groupBy({
      by: ['rating'],
      where: { courseId },
      _count: true,
    });

    sendSuccess(res, {
      statistics: course.statistics,
      sections: course.sections,
      enrollmentsByMonth,
      reviewStats,
    });
  } catch (error) {
    next(error);
  }
});

// Earnings
router.get('/earnings', async (req, res, next) => {
  try {
    const instructorId = req.user!.userId;
    const { startDate, endDate } = req.query;

    const where: any = {
      course: { instructorId },
      status: 'COMPLETED',
    };

    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const [totalEarnings, earningsByMonth, earningsByCourse] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', p.created_at) as month,
          SUM(p.amount) as earnings
        FROM payments p
        JOIN courses c ON p.course_id = c.id
        WHERE c.instructor_id = ${instructorId}
          AND p.status = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', p.created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
      prisma.course.findMany({
        where: { instructorId },
        include: {
          statistics: {
            select: { totalRevenue: true, totalEnrollments: true },
          },
        },
        orderBy: {
          statistics: { totalRevenue: 'desc' },
        },
      }),
    ]);

    sendSuccess(res, {
      totalEarnings: totalEarnings._sum.amount || 0,
      totalSales: totalEarnings._count,
      earningsByMonth,
      earningsByCourse,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
