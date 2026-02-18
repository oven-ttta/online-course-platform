import { Request, Response, NextFunction } from 'express';
import walletService from '../services/wallet.service';
import { sendSuccess } from '../utils/response';

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const balance = await walletService.getBalance(userId);
        sendSuccess(res, { balance });
    } catch (error) {
        next(error);
    }
};


export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const transactions = await walletService.getTransactions(userId);
        sendSuccess(res, transactions);
    } catch (error) {
        next(error);
    }
};

export const purchaseCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { courseId } = req.params;
        const result = await walletService.purchaseCourse(userId, courseId);
        sendSuccess(res, result);
    } catch (error) {
        next(error);
    }
};

export const redeemVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const { voucherUrl } = req.body;
        if (!voucherUrl) {
            return res.status(400).json({ error: 'Voucher URL is required' });
        }
        const transaction = await walletService.redeemVoucher(userId, voucherUrl);
        sendSuccess(res, transaction);
    } catch (error) {
        next(error);
    }
};
