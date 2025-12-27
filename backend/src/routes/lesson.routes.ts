import { Router } from 'express';
import { body } from 'express-validator';
import * as lessonController from '../controllers/lesson.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Validation
const createLessonValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['VIDEO', 'TEXT', 'QUIZ']).withMessage('Invalid lesson type'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
];

// Get lesson
router.get('/:lessonId', optionalAuth, lessonController.getLesson);

// Section routes
router.put(
  '/sections/:sectionId',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.updateSection
);

router.delete(
  '/sections/:sectionId',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.deleteSection
);

// Lesson routes
router.post(
  '/sections/:sectionId/lessons',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  validate(createLessonValidation),
  lessonController.createLesson
);

router.put(
  '/:lessonId',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.updateLesson
);

router.delete(
  '/:lessonId',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.deleteLesson
);

router.put(
  '/sections/:sectionId/lessons/reorder',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.reorderLessons
);

// Quiz routes
router.post(
  '/:lessonId/quiz',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.createQuiz
);

router.post(
  '/quizzes/:quizId/questions',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  lessonController.addQuizQuestion
);

export default router;
