import { EnrollmentStatus, PaymentStatus, CourseStatus } from '@prisma/client';
import prisma from '../utils/prisma';

class EnrollmentService {
  async enroll(userId: string, courseId: string, paymentId?: string) {
    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw { statusCode: 404, code: 'COURSE_NOT_FOUND', message: 'Course not found' };
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw { statusCode: 400, code: 'COURSE_NOT_AVAILABLE', message: 'This course is not available for enrollment' };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw { statusCode: 400, code: 'ALREADY_ENROLLED', message: 'You are already enrolled in this course' };
    }

    // For paid courses, verify payment
    if (Number(course.price) > 0 && !paymentId) {
      throw { statusCode: 400, code: 'PAYMENT_REQUIRED', message: 'Payment is required for this course' };
    }

    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment || payment.status !== PaymentStatus.COMPLETED) {
        throw { statusCode: 400, code: 'PAYMENT_NOT_COMPLETED', message: 'Payment not completed' };
      }
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        paymentId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    // Update course statistics
    await this.updateCourseStatistics(courseId);

    return enrollment;
  }

  async getUserEnrollments(userId: string, status?: EnrollmentStatus) {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return prisma.enrollment.findMany({
      where,
      include: {
        course: {
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
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async getEnrollment(enrollmentId: string, userId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            sections: {
              orderBy: { sortOrder: 'asc' },
              include: {
                lessons: {
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    lessonProgress: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
        lessonProgress: true,
      },
    });

    if (!enrollment) {
      throw { statusCode: 404, code: 'ENROLLMENT_NOT_FOUND', message: 'Enrollment not found' };
    }

    if (enrollment.userId !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only view your own enrollments' };
    }

    return enrollment;
  }

  async updateProgress(userId: string, lessonId: string, data: { watchTime?: number; lastPosition?: number; isCompleted?: boolean }) {
    // Get enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      throw { statusCode: 404, code: 'LESSON_NOT_FOUND', message: 'Lesson not found' };
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      throw { statusCode: 403, code: 'NOT_ENROLLED', message: 'You are not enrolled in this course' };
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        userId,
        ...data,
        completedAt: data.isCompleted ? new Date() : undefined,
      },
      update: {
        ...data,
        completedAt: data.isCompleted ? new Date() : undefined,
      },
    });

    // Update enrollment progress percentage
    await this.updateEnrollmentProgress(enrollment.id);

    return progress;
  }

  async submitQuiz(userId: string, quizId: string, answers: Record<string, number[]>) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: { include: { course: true } },
        questions: true,
      },
    });

    if (!quiz) {
      throw { statusCode: 404, code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' };
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: quiz.lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      throw { statusCode: 403, code: 'NOT_ENROLLED', message: 'You are not enrolled in this course' };
    }

    // Check attempt limit
    if (quiz.maxAttempts) {
      const attemptCount = await prisma.quizAttempt.count({
        where: { userId, quizId },
      });

      if (attemptCount >= quiz.maxAttempts) {
        throw { statusCode: 400, code: 'MAX_ATTEMPTS_REACHED', message: 'You have reached the maximum number of attempts' };
      }
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id] || [];
      const correctAnswer = question.correctAnswers as number[];

      if (JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort())) {
        earnedPoints += question.points;
      }
    }

    const scorePercent = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = scorePercent >= quiz.passingScore;

    // Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        enrollmentId: enrollment.id,
        score: scorePercent,
        totalPoints,
        isPassed,
        answers,
        startedAt: new Date(),
        submittedAt: new Date(),
      },
    });

    // Update lesson progress if passed
    if (isPassed) {
      await prisma.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId: quiz.lessonId,
          },
        },
        create: {
          enrollmentId: enrollment.id,
          lessonId: quiz.lessonId,
          userId,
          isCompleted: true,
          completedAt: new Date(),
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      await this.updateEnrollmentProgress(enrollment.id);
    }

    return {
      attempt,
      score: scorePercent,
      totalPoints,
      earnedPoints,
      isPassed,
      passingScore: quiz.passingScore,
    };
  }

  async getQuizResults(userId: string, quizId: string) {
    return prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async updateEnrollmentProgress(enrollmentId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            lessons: {
              where: { isPublished: true },
            },
          },
        },
        lessonProgress: {
          where: { isCompleted: true },
        },
      },
    });

    if (!enrollment) return;

    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = enrollment.lessonProgress.length;
    const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPercent,
        completedAt: progressPercent >= 100 ? new Date() : null,
      },
    });
  }

  private async updateCourseStatistics(courseId: string) {
    const stats = await prisma.enrollment.aggregate({
      where: { courseId, status: EnrollmentStatus.ACTIVE },
      _count: true,
    });

    const reviewStats = await prisma.review.aggregate({
      where: { courseId, isApproved: true },
      _count: true,
      _avg: { rating: true },
    });

    const revenueStats = await prisma.payment.aggregate({
      where: { courseId, status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    });

    await prisma.courseStatistics.upsert({
      where: { courseId },
      create: {
        courseId,
        totalEnrollments: stats._count,
        totalReviews: reviewStats._count,
        averageRating: reviewStats._avg.rating || 0,
        totalRevenue: revenueStats._sum.amount || 0,
      },
      update: {
        totalEnrollments: stats._count,
        totalReviews: reviewStats._count,
        averageRating: reviewStats._avg.rating || 0,
        totalRevenue: revenueStats._sum.amount || 0,
        updatedAt: new Date(),
      },
    });
  }
}

export default new EnrollmentService();
