import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { uploadFile, uploadMultipleFiles as uploadToMinio } from '../utils/minio';

// Use memory storage for MinIO uploads
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed mime types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB default
  },
});

// Middleware to upload single file to MinIO
export const uploadToMinioMiddleware = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const result = await uploadFile(req.file, folder);
        req.body.uploadedFile = result;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to upload multiple files to MinIO
export const uploadMultipleToMinioMiddleware = (folder: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const results = await uploadToMinio(req.files, folder);
        req.body.uploadedFiles = results;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Specific uploaders with MinIO integration
export const uploadImage = upload.single('image');
export const uploadVideo = upload.single('video');
export const uploadThumbnail = upload.single('thumbnail');
export const uploadAttachment = upload.single('attachment');
export const uploadMultipleFiles = upload.array('files', 10);

// Combined middleware: multer + MinIO upload
export const handleImageUpload = [
  upload.single('image'),
  uploadToMinioMiddleware('images'),
];

export const handleVideoUpload = [
  upload.single('video'),
  uploadToMinioMiddleware('videos'),
];

export const handleThumbnailUpload = [
  upload.single('thumbnail'),
  uploadToMinioMiddleware('thumbnails'),
];

export const handleAttachmentUpload = [
  upload.single('attachment'),
  uploadToMinioMiddleware('attachments'),
];

export const handleMultipleFilesUpload = [
  upload.array('files', 10),
  uploadMultipleToMinioMiddleware('files'),
];
