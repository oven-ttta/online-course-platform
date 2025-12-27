import { Router } from 'express';
import { body } from 'express-validator';
import * as courseController from '../controllers/course.controller';
import * as lessonController from '../controllers/lesson.controller';
import * as enrollmentController from '../controllers/enrollment.controller';
import * as reviewController from '../controllers/review.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Validation rules
const createCourseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
];

const createReviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
];

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/featured', courseController.getFeaturedCourses);
router.get('/:slug', optionalAuth, courseController.getCourseBySlug);
router.get('/:courseId/reviews', reviewController.getCourseReviews);

// Protected routes - Instructor
router.post(
  '/',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  validate(createCourseValidation),
  courseController.createCourse
);

router.put(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  courseController.updateCourse
);

router.delete(
  '/:id',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  courseController.deleteCourse
);

router.put(
  '/:id/publish',
  authenticate,
  authorize('INSTRUCTOR'),
  courseController.publishCourse
);

// Sections
router.post(
  '/:courseId/sections',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.createSection
);

router.put(
  '/:courseId/sections/reorder',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.reorderSections
);

// Enrollment
router.post(
  '/:courseId/enroll',
  authenticate,
  authorize('STUDENT'),
  enrollmentController.enroll
);

// Reviews
router.post(
  '/:courseId/reviews',
  authenticate,
  authorize('STUDENT'),
  validate(createReviewValidation),
  reviewController.createReview
);

export default router;
