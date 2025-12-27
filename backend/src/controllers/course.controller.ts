import { Request, Response, NextFunction } from 'express';
import { CourseLevel } from '@prisma/client';
import courseService from '../services/course.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = '1',
      limit = '12',
      categoryId,
      level,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
      sortOrder = 'desc',
    } = req.query;

    const filters = {
      ...(categoryId && { categoryId: parseInt(categoryId as string) }),
      ...(level && { level: level as CourseLevel }),
      ...(minPrice && { minPrice: parseFloat(minPrice as string) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice as string) }),
      ...(search && { search: search as string }),
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    const { courses, total } = await courseService.findAll(filters, pagination);
    sendPaginated(res, courses, total, pagination.page, pagination.limit);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '6' } = req.query;
    const courses = await courseService.getFeatured(parseInt(limit as string));
    sendSuccess(res, courses);
  } catch (error) {
    next(error);
  }
};

export const getCourseBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId;
    const course = await courseService.findBySlug(slug, userId);
    sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const course = await courseService.findById(id);
    sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructorId = req.user!.userId;
    const courseData = {
      ...req.body,
      instructorId,
      price: parseFloat(req.body.price),
      discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : undefined,
    };

    const course = await courseService.create(courseData);
    sendSuccess(res, course, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const instructorId = req.user!.userId;

    const updateData = {
      ...req.body,
      ...(req.body.price && { price: parseFloat(req.body.price) }),
      ...(req.body.discountPrice && { discountPrice: parseFloat(req.body.discountPrice) }),
    };

    const course = await courseService.update(id, instructorId, updateData);
    sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const instructorId = req.user!.userId;
    const result = await courseService.delete(id, instructorId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const publishCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const instructorId = req.user!.userId;
    const course = await courseService.publish(id, instructorId);
    sendSuccess(res, course);
  } catch (error) {
    next(error);
  }
};
