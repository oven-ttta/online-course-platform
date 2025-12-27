import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  upload,
  uploadToMinioMiddleware,
  uploadMultipleToMinioMiddleware,
} from '../middleware/upload.middleware';
import { deleteFile, getPresignedUploadUrl } from '../utils/minio';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload single image
router.post(
  '/image',
  upload.single('image'),
  uploadToMinioMiddleware('images'),
  async (req: Request, res: Response) => {
    if (!req.body.uploadedFile) {
      return sendError(res, 'NO_FILE', 'No file uploaded', 400);
    }
    sendSuccess(res, req.body.uploadedFile);
  }
);

// Upload single video
router.post(
  '/video',
  upload.single('video'),
  uploadToMinioMiddleware('videos'),
  async (req: Request, res: Response) => {
    if (!req.body.uploadedFile) {
      return sendError(res, 'NO_FILE', 'No file uploaded', 400);
    }
    sendSuccess(res, req.body.uploadedFile);
  }
);

// Upload course thumbnail
router.post(
  '/thumbnail',
  upload.single('thumbnail'),
  uploadToMinioMiddleware('thumbnails'),
  async (req: Request, res: Response) => {
    if (!req.body.uploadedFile) {
      return sendError(res, 'NO_FILE', 'No file uploaded', 400);
    }
    sendSuccess(res, req.body.uploadedFile);
  }
);

// Upload attachment/document
router.post(
  '/attachment',
  upload.single('attachment'),
  uploadToMinioMiddleware('attachments'),
  async (req: Request, res: Response) => {
    if (!req.body.uploadedFile) {
      return sendError(res, 'NO_FILE', 'No file uploaded', 400);
    }
    sendSuccess(res, req.body.uploadedFile);
  }
);

// Upload multiple files
router.post(
  '/files',
  upload.array('files', 10),
  uploadMultipleToMinioMiddleware('files'),
  async (req: Request, res: Response) => {
    if (!req.body.uploadedFiles || req.body.uploadedFiles.length === 0) {
      return sendError(res, 'NO_FILE', 'No files uploaded', 400);
    }
    sendSuccess(res, req.body.uploadedFiles);
  }
);

// Get presigned URL for direct upload (for large files)
router.post('/presigned-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName, folder = 'uploads' } = req.body;

    if (!fileName) {
      return sendError(res, 'VALIDATION_ERROR', 'fileName is required', 400);
    }

    const fullPath = `${folder}/${Date.now()}-${fileName}`;
    const uploadUrl = await getPresignedUploadUrl(fullPath);

    sendSuccess(res, {
      uploadUrl,
      fileName: fullPath,
    });
  } catch (error) {
    next(error);
  }
});

// Delete file
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return sendError(res, 'VALIDATION_ERROR', 'fileName is required', 400);
    }

    await deleteFile(fileName);
    sendSuccess(res, { deleted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
