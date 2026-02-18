import prisma from '../utils/prisma';

class WishlistService {
  async addToWishlist(userId: string, courseId: string) {
    return prisma.wishlist.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      create: {
        userId,
        courseId,
      },
      update: {},
    });
  }

  async removeFromWishlist(userId: string, courseId: string) {
    return prisma.wishlist.deleteMany({
      where: {
        userId,
        courseId,
      },
    });
  }

  async getUserWishlist(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
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
                slug: true,
              },
            },
            statistics: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new WishlistService();
