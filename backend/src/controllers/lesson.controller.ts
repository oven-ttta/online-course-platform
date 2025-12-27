import { Request, Response, NextFunction } from 'express';
import { LessonType } from '@prisma/client';
import lessonService from '../services/lesson.service';
import { sendSuccess } from '../utils/response';

// Section Controllers
export const createSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user!.userId;
    const section = await lessonService.createSection({ ...req.body, courseId }, instructorId);
    sendSuccess(res, section, 201);
  } catch (error) {
    next(error);
  }
};

export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.params;
    const instructorId = req.user!.userId;
    const section = await lessonService.updateSection(sectionId, instructorId, req.body);
    sendSuccess(res, section);
  } catch (error) {
    next(error);
  }
};

export const deleteSection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.params;
    const instructorId = req.user!.userId;
    const result = await lessonService.deleteSection(sectionId, instructorId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const reorderSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const { sectionIds } = req.body;
    const instructorId = req.user!.userId;
    const result = await lessonService.reorderSections(courseId, instructorId, sectionIds);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

// Lesson Controllers
export const createLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.params;
    const { courseId } = req.body;
    const instructorId = req.user!.userId;

    const lessonData = {
      sectionId,
      courseId,
      title: req.body.title,
      type: req.body.type as LessonType,
      content: req.body.content,
      videoUrl: req.body.videoUrl,
      videoDuration: req.body.videoDuration,
      isFree: req.body.isFree,
    };

    const lesson = await lessonService.createLesson(lessonData, instructorId);
    sendSuccess(res, lesson, 201);
  } catch (error) {
    next(error);
  }
};

export const getLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.userId;
    const lesson = await lessonService.getLesson(lessonId, userId);
    sendSuccess(res, lesson);
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const instructorId = req.user!.userId;
    const lesson = await lessonService.updateLesson(lessonId, instructorId, req.body);
    sendSuccess(res, lesson);
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const instructorId = req.user!.userId;
    const result = await lessonService.deleteLesson(lessonId, instructorId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const reorderLessons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sectionId } = req.params;
    const { lessonIds } = req.body;
    const instructorId = req.user!.userId;
    const result = await lessonService.reorderLessons(sectionId, instructorId, lessonIds);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

// Quiz Controllers
export const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lessonId } = req.params;
    const instructorId = req.user!.userId;
    const quiz = await lessonService.createQuiz(lessonId, instructorId, req.body);
    sendSuccess(res, quiz, 201);
  } catch (error) {
    next(error);
  }
};

export const addQuizQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user!.userId;
    const question = await lessonService.addQuizQuestion(quizId, instructorId, req.body);
    sendSuccess(res, question, 201);
  } catch (error) {
    next(error);
  }
};
