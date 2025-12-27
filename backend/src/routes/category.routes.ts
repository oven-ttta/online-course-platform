import { Router } from 'express';
import { body } from 'express-validator';
import prisma from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
        },
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
});

// Get category by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        courses: {
          where: { status: 'PUBLISHED' },
          take: 10,
          include: {
            instructor: {
              select: { id: true, firstName: true, lastName: true },
            },
            statistics: true,
          },
        },
      },
    });

    if (!category) {
      sendError(res, 'NOT_FOUND', 'Category not found', 404);
      return;
    }

    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
});

// Admin routes
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required'),
];

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(categoryValidation),
  async (req, res, next) => {
    try {
      const { name, slug, description, parentId } = req.body;
      const category = await prisma.category.create({
        data: { name, slug, description, parentId },
      });
      sendSuccess(res, category, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, isActive } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, slug, description, isActive },
    });
    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has courses
    const courseCount = await prisma.course.count({
      where: { categoryId: parseInt(id) },
    });

    if (courseCount > 0) {
      sendError(res, 'CATEGORY_HAS_COURSES', 'Cannot delete category with courses', 400);
      return;
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });
    sendSuccess(res, { message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
