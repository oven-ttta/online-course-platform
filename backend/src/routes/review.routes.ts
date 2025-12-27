import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Update review
router.put('/:reviewId', authenticate, reviewController.updateReview);

// Delete review
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

// Reply to review (instructor only)
router.post(
  '/:reviewId/reply',
  authenticate,
  authorize('INSTRUCTOR'),
  reviewController.replyToReview
);

export default router;
