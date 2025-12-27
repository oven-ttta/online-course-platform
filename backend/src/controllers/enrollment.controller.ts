import { Request, Response, NextFunction } from 'express';
import { EnrollmentStatus } from '@prisma/client';
import enrollmentService from '../services/enrollment.service';
import { sendSuccess } from '../utils/response';

export const enroll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;
    const { paymentId } = req.body;

    const enrollment = await enrollmentService.enroll(userId, courseId, paymentId);
    sendSuccess(res, enrollment, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const enrollments = await enrollmentService.getUserEnrollments(
      userId,
      status as EnrollmentStatus | undefined
    );
    sendSuccess(res, enrollments);
  } catch (error) {
    next(error);
  }
};

export const getEnrollment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user!.userId;

    const enrollment = await enrollmentService.getEnrollment(enrollmentId, userId);
    sendSuccess(res, enrollment);
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.userId;
    const { watchTime, lastPosition, isCompleted } = req.body;

    const progress = await enrollmentService.updateProgress(userId, lessonId, {
      watchTime,
      lastPosition,
      isCompleted,
    });
    sendSuccess(res, progress);
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const userId = req.user!.userId;
    const { answers } = req.body;

    const result = await enrollmentService.submitQuiz(userId, quizId, answers);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const getQuizResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const userId = req.user!.userId;

    const results = await enrollmentService.getQuizResults(userId, quizId);
    sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
};
