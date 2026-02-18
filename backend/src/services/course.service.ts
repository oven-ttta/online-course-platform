import { CourseStatus, CourseLevel, Prisma } from '@prisma/client';
import prisma from '../utils/prisma';

interface CreateCourseData {
  instructorId: string;
  categoryId: number;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number;
  level?: CourseLevel;
  requirements?: string[];
  whatYouLearn?: string[];
}

interface UpdateCourseData {
  title?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: number;
  price?: number;
  discountPrice?: number;
  level?: CourseLevel;
  requirements?: string[];
  whatYouLearn?: string[];
  thumbnailUrl?: string;
  previewVideoUrl?: string;
}

interface CourseFilters {
  categoryId?: number;
  level?: CourseLevel;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  instructorId?: string;
  status?: CourseStatus;
  isFeatured?: boolean;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class CourseService {
  // Generate unique slug from title
  private async generateSlug(title: string): Promise<string> {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug exists
    let counter = 0;
    let uniqueSlug = slug;

    while (await prisma.course.findUnique({ where: { slug: uniqueSlug } })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    return uniqueSlug;
  }

  async create(data: CreateCourseData) {
    const slug = await this.generateSlug(data.title);

    const course = await prisma.course.create({
      data: {
        ...data,
        slug,
        price: data.price,
        discountPrice: data.discountPrice,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        category: true,
      },
    });

    // Create statistics entry
    await prisma.courseStatistics.create({
      data: {
        courseId: course.id,
      },
    });

    return course;
  }

  async findAll(filters: CourseFilters = {}, pagination: PaginationOptions = {}) {
    const {
      categoryId,
      level,
      minPrice,
      maxPrice,
      search,
      instructorId,
      status = CourseStatus.PUBLISHED,
      isFeatured,
    } = filters;

    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    const where: Prisma.CourseWhereInput = {
      status,
      ...(categoryId && { categoryId }),
      ...(level && { level }),
      ...(instructorId && { instructorId }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
          price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        }
        : {}),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          statistics: {
            select: {
              totalEnrollments: true,
              averageRating: true,
              totalReviews: true,
            },
          },
        },
        orderBy: this.getOrderBy(sortBy, sortOrder),
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total, page, limit };
  }

  private getOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): Prisma.CourseOrderByWithRelationInput {
    switch (sortBy) {
      case 'price':
        return { price: sortOrder };
      case 'title':
        return { title: sortOrder };
      case 'popular':
        return { statistics: { totalEnrollments: sortOrder } };
      case 'rating':
        return { statistics: { averageRating: sortOrder } };
      case 'newest':
      default:
        return { publishedAt: sortOrder };
    }
  }

  async findBySlug(slug: string, userId?: string) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
            _count: {
              select: { courses: true },
            },
          },
        },
        category: true,
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                videoDuration: true,
                isFree: true,
                isPublished: true,
                lessonProgress: userId ? {
                  where: { userId },
                  select: {
                    isCompleted: true,
                    watchTime: true,
                    lastPosition: true,
                  }
                } : false,
              },
            },
          },
        },
        statistics: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    // Check if user is enrolled
    let isEnrolled = false;
    let enrollment = null;

    if (userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
        select: {
          id: true,
          progressPercent: true,
          status: true,
        },
      });
      isEnrolled = !!enrollment;
    }

    // Map sections and lessons to flatten progress
    const sections = course.sections.map(section => ({
      ...section,
      lessons: section.lessons.map(lesson => {
        const progress = (lesson as any).lessonProgress?.[0] || null;
        const { lessonProgress, ...lessonData } = lesson as any;
        return {
          ...lessonData,
          progress
        };
      })
    }));

    return { ...course, sections, isEnrolled, enrollment };
  }

  async findById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        category: true,
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        statistics: true,
      },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    return course;
  }

  async update(id: string, instructorId: string, data: UpdateCourseData) {
    // Verify ownership
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    if (course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only update your own courses' };
    }

    return prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        category: true,
      },
    });
  }

  async delete(id: string, instructorId: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    if (course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only delete your own courses' };
    }

    if (course._count.enrollments > 0) {
      throw {
        statusCode: 400,
        code: 'COURSE_HAS_ENROLLMENTS',
        message: 'Cannot delete course with active enrollments',
      };
    }

    await prisma.course.delete({ where: { id } });

    return { message: 'Course deleted successfully' };
  }

  async publish(id: string, instructorId: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    if (course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only publish your own courses' };
    }

    // Validate course has content
    const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);

    if (totalLessons === 0) {
      throw {
        statusCode: 400,
        code: 'NO_LESSONS',
        message: 'Course must have at least one lesson before publishing',
      };
    }

    return prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.PENDING,
        totalLessons,
      },
    });
  }

  async getFeatured(limit = 6) {
    return prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        isFeatured: true,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        statistics: {
          select: {
            totalEnrollments: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
      orderBy: {
        statistics: {
          totalEnrollments: 'desc',
        },
      },
      take: limit,
    });
  }

  // Admin methods
  async getPendingCourses(page = 1, limit = 10) {
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { status: CourseStatus.PENDING },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where: { status: CourseStatus.PENDING } }),
    ]);

    return { courses, total, page, limit };
  }

  async approveCourse(id: string) {
    return prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async rejectCourse(id: string, reason?: string) {
    return prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.REJECTED,
      },
    });
  }
}

export default new CourseService();
