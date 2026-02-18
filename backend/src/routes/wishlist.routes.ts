import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.getMyWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:courseId', wishlistController.removeFromWishlist);

export default router;
