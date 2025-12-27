import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get my enrollments
router.get('/', enrollmentController.getMyEnrollments);

// Get specific enrollment
router.get('/:enrollmentId', enrollmentController.getEnrollment);

// Update lesson progress
router.put('/progress/:lessonId', enrollmentController.updateProgress);

// Quiz
router.post('/quiz/:quizId/submit', enrollmentController.submitQuiz);
router.get('/quiz/:quizId/results', enrollmentController.getQuizResults);

export default router;
