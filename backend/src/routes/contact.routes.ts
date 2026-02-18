import { Router } from 'express';
import { body } from 'express-validator';
import prisma from '../utils/prisma';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

const contactValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
];

// Submit contact form
router.post('/', validate(contactValidation), async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;
        const contact = await prisma.contact.create({
            data: { name, email, subject, message },
        });
        sendSuccess(res, contact, 201);
    } catch (error) {
        next(error);
    }
});

// Admin: Get all contacts
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' },
        });
        sendSuccess(res, contacts);
    } catch (error) {
        next(error);
    }
});

// Admin: Mark as read
router.put('/:id/read', authenticate, authorize('ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await prisma.contact.update({
            where: { id },
            data: { isRead: true },
        });
        sendSuccess(res, contact);
    } catch (error) {
        next(error);
    }
});

export default router;
