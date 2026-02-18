import { Router } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendPaginated, sendError } from '../utils/response';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Update my profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { firstName, lastName, bio, avatarUrl, phone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        bio,
        avatarUrl,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        role: true,
      },
    });

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

// Get user profile (public)
router.get('/:id/profile', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
        courses: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            price: true,
            discountPrice: true,
            statistics: true,
          },
        },
        _count: {
          select: {
            courses: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      sendError(res, 'NOT_FOUND', 'User not found', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

// Admin: Get all users
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { page = '1', limit = '20', role, search } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              courses: true,
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      }),
      prisma.user.count({ where }),
    ]);

    sendPaginated(res, users, total, parseInt(page as string), parseInt(limit as string));
  } catch (error) {
    next(error);
  }
});

// Admin: Update user status
router.put('/:id/status', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

// Admin: Update user role
router.put('/:id/role', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
      sendError(res, 'INVALID_ROLE', 'Invalid role', 400);
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
});

export default router;
