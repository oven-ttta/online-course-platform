import { Request, Response, NextFunction } from 'express';
import reviewService from '../services/review.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;
    const { rating, comment } = req.body;

    const review = await reviewService.create(userId, courseId, { rating, comment });
    sendSuccess(res, review, 201);
  } catch (error) {
    next(error);
  }
};

export const getCourseReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const result = await reviewService.getCourseReviews(
      courseId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    sendPaginated(res, result.reviews, result.total, result.page, result.limit);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.userId;
    const { rating, comment } = req.body;

    const review = await reviewService.update(reviewId, userId, { rating, comment });
    sendSuccess(res, review);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    const result = await reviewService.delete(reviewId, userId, isAdmin);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const instructorId = req.user!.userId;
    const { reply } = req.body;

    const review = await reviewService.reply(reviewId, instructorId, reply);
    sendSuccess(res, review);
  } catch (error) {
    next(error);
  }
};
