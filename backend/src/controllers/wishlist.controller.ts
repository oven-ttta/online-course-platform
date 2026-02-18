import { Request, Response, NextFunction } from 'express';
import wishlistService from '../services/wishlist.service';
import { sendSuccess } from '../utils/response';

export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.body;
        const userId = req.user!.userId;
        const item = await wishlistService.addToWishlist(userId, courseId);
        sendSuccess(res, item, 201);
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;
        const userId = req.user!.userId;
        await wishlistService.removeFromWishlist(userId, courseId);
        sendSuccess(res, { message: 'Removed from wishlist' });
    } catch (error) {
        next(error);
    }
};

export const getMyWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const items = await wishlistService.getUserWishlist(userId);
        sendSuccess(res, items);
    } catch (error) {
        next(error);
    }
};
