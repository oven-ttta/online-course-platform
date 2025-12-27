import prisma from '../utils/prisma';

interface CreateReviewData {
  rating: number;
  comment?: string;
}

class ReviewService {
  async create(userId: string, courseId: string, data: CreateReviewData) {
    // Check if enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw { statusCode: 403, code: 'NOT_ENROLLED', message: 'You must be enrolled in this course to write a review' };
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingReview) {
      throw { statusCode: 400, code: 'ALREADY_REVIEWED', message: 'You have already reviewed this course' };
    }

    const review = await prisma.review.create({
      data: {
        userId,
        courseId,
        enrollmentId: enrollment.id,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update course statistics
    await this.updateCourseStats(courseId);

    return review;
  }

  async getCourseReviews(courseId: string, page = 1, limit = 10) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { courseId, isApproved: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { courseId, isApproved: true } }),
    ]);

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { courseId, isApproved: true },
      _count: true,
    });

    const distribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: ratingDistribution.find((r) => r.rating === rating)?._count || 0,
    }));

    return { reviews, total, page, limit, ratingDistribution: distribution };
  }

  async update(reviewId: string, userId: string, data: { rating?: number; comment?: string }) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw { statusCode: 404, code: 'REVIEW_NOT_FOUND', message: 'Review not found' };
    }

    if (review.userId !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only update your own reviews' };
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update course statistics
    await this.updateCourseStats(review.courseId);

    return updatedReview;
  }

  async delete(reviewId: string, userId: string, isAdmin = false) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw { statusCode: 404, code: 'REVIEW_NOT_FOUND', message: 'Review not found' };
    }

    if (!isAdmin && review.userId !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only delete your own reviews' };
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Update course statistics
    await this.updateCourseStats(review.courseId);

    return { message: 'Review deleted successfully' };
  }

  async reply(reviewId: string, instructorId: string, reply: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        course: true,
      },
    });

    if (!review) {
      throw { statusCode: 404, code: 'REVIEW_NOT_FOUND', message: 'Review not found' };
    }

    if (review.course.instructorId !== instructorId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'You can only reply to reviews on your own courses' };
    }

    return prisma.review.update({
      where: { id: reviewId },
      data: {
        instructorReply: reply,
        repliedAt: new Date(),
      },
    });
  }

  private async updateCourseStats(courseId: string) {
    const stats = await prisma.review.aggregate({
      where: { courseId, isApproved: true },
      _count: true,
      _avg: { rating: true },
    });

    await prisma.courseStatistics.upsert({
      where: { courseId },
      create: {
        courseId,
        totalReviews: stats._count,
        averageRating: stats._avg.rating || 0,
      },
      update: {
        totalReviews: stats._count,
        averageRating: stats._avg.rating || 0,
        updatedAt: new Date(),
      },
    });
  }
}

export default new ReviewService();
