import prisma from '../utils/prisma';
import { TransactionType, TransactionStatus } from '@prisma/client';

class WalletService {
    async deposit(userId: string, amount: number, provider: string = 'DEMO') {
        // In a real app, this would integrate with a payment gateway.
        // Here we simulate a successful deposit.
        return prisma.$transaction(async (tx) => {
            // Create transaction record
            const transaction = await tx.walletTransaction.create({
                data: {
                    userId,
                    amount,
                    type: TransactionType.DEPOSIT,
                    status: TransactionStatus.SUCCESS,
                    provider,
                    description: `เติมเงินจำนวน ${amount} บาท`,
                    referenceId: `DEP-${Date.now()}`,
                },
            });

            // Update user balance
            await tx.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            });

            return transaction;
        });
    }

    async getBalance(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true },
        });
        return user?.balance || 0;
    }

    async getTransactions(userId: string) {
        return prisma.walletTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async purchaseCourse(userId: string, courseId: string) {
        return prisma.$transaction(async (tx) => {
            const course = await tx.course.findUnique({
                where: { id: courseId },
            });

            if (!course) throw { statusCode: 404, message: 'Course not found' };

            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { balance: true },
            });

            if (!user) throw { statusCode: 404, message: 'User not found' };

            const price = Number(course.discountPrice || course.price);

            if (Number(user.balance) < price) {
                throw { statusCode: 400, code: 'INSUFFICIENT_BALANCE', message: 'ยอดเงินไม่เพียงพอ' };
            }

            // Deduct balance
            await tx.user.update({
                where: { id: userId },
                data: {
                    balance: {
                        decrement: price,
                    },
                },
            });

            // Create purchase transaction
            const transaction = await tx.walletTransaction.create({
                data: {
                    userId,
                    amount: price,
                    type: TransactionType.PURCHASE,
                    status: TransactionStatus.SUCCESS,
                    description: `ซื้อคอร์ส: ${course.title}`,
                    referenceId: `PUR-${courseId}-${Date.now()}`,
                },
            });

            // Create Payment record (to be compatible with existing logic)
            const payment = await tx.payment.create({
                data: {
                    userId,
                    courseId,
                    amount: price,
                    paymentMethod: 'WALLET',
                    paymentProvider: 'INTERNAL',
                    status: 'COMPLETED',
                    paidAt: new Date(),
                },
            });

            return { transaction, payment };
        });
    }
}

export default new WalletService();
