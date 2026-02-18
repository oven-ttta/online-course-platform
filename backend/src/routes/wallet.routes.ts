import { Router } from 'express';
import * as walletController from '../controllers/wallet.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/balance', walletController.getBalance);
router.get('/transactions', walletController.getTransactions);
router.post('/purchase/:courseId', walletController.purchaseCourse);
router.post('/redeem', walletController.redeemVoucher);

export default router;
