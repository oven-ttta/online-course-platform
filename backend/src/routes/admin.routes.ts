import { Router } from 'express';
import prisma from '../utils/prisma';
import courseService from '../services/course.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize('ADMIN'));

// Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      recentUsers,
      pendingCourses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.course.count({ where: { status: 'PENDING' } }),
    ]);

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Monthly stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newUsersThisMonth, enrollmentsThisMonth, revenueThisMonth] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.enrollment.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
    ]);

    sendSuccess(res, {
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingCourses,
      },
      usersByRole,
      thisMonth: {
        newUsers: newUsersThisMonth,
        enrollments: enrollmentsThisMonth,
        revenue: revenueThisMonth._sum.amount || 0,
      },
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
});

// All courses (for admin management)
router.get('/courses', async (req, res, next) => {
  try {
    const { page = '1', limit = '20', status, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          category: { select: { id: true, name: true } },
          _count: { select: { lessons: true, enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    sendPaginated(res, courses, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
});

// Pending courses
router.get('/courses/pending', async (req, res, next) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const result = await courseService.getPendingCourses(
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendPaginated(res, result.courses, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
});

// Approve course
router.put('/courses/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await courseService.approveCourse(id);
    sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
});

// Reject course
router.put('/courses/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const course = await courseService.rejectCourse(id, reason);
    sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
});

// Revenue reports
router.get('/reports/revenue', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { status: 'COMPLETED' };
    if (startDate) where.createdAt = { gte: new Date(startDate as string) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

    const [totalRevenue, revenueByMonth, topCourses] = await Promise.all([
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          SUM(amount) as revenue,
          COUNT(*) as transactions
        FROM payments
        WHERE status = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
      prisma.course.findMany({
        include: {
          statistics: true,
          instructor: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: {
          statistics: { totalRevenue: 'desc' },
        },
        take: 10,
      }),
    ]);

    sendSuccess(res, {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions: totalRevenue._count,
      revenueByMonth,
      topCourses,
    });
  } catch (error) {
    next(error);
  }
});

// User reports
router.get('/reports/users', async (req, res, next) => {
  try {
    const [userStats, userGrowth] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as new_users
        FROM users
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    sendSuccess(res, { userStats, userGrowth });
  } catch (error) {
    next(error);
  }
});

export default router;
