import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// MinIO Configuration
const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
};

const bucketName = process.env.MINIO_BUCKET || 'uploads';

// Create MinIO client
const minioClient = new Minio.Client(minioConfig);

// Initialize bucket
export const initializeBucket = async (): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket '${bucketName}' created successfully`);

      // Set bucket policy to allow public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    }
    console.log(`MinIO connected: ${minioConfig.endPoint}`);
  } catch (error) {
    console.error('MinIO initialization error:', error);
  }
};

// Generate file URL
export const getFileUrl = (fileName: string): string => {
  const protocol = minioConfig.useSSL ? 'https' : 'http';
  const portPart = (minioConfig.useSSL && minioConfig.port === 443) ||
                   (!minioConfig.useSSL && minioConfig.port === 80)
                   ? '' : `:${minioConfig.port}`;
  return `${protocol}://${minioConfig.endPoint}${portPart}/${bucketName}/${fileName}`;
};

// Upload file to MinIO
export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'general'
): Promise<{ fileName: string; url: string }> => {
  const ext = path.extname(file.originalname);
  const fileName = `${folder}/${uuidv4()}${ext}`;

  await minioClient.putObject(
    bucketName,
    fileName,
    file.buffer,
    file.size,
    {
      'Content-Type': file.mimetype,
    }
  );

  return {
    fileName,
    url: getFileUrl(fileName),
  };
};

// Upload multiple files
export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  folder: string = 'general'
): Promise<{ fileName: string; url: string }[]> => {
  const results = await Promise.all(
    files.map((file) => uploadFile(file, folder))
  );
  return results;
};

// Delete file from MinIO
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    await minioClient.removeObject(bucketName, fileName);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Delete multiple files
export const deleteMultipleFiles = async (fileNames: string[]): Promise<void> => {
  try {
    await minioClient.removeObjects(bucketName, fileNames);
  } catch (error) {
    console.error('Error deleting files:', error);
  }
};

// Get presigned URL for upload (client-side upload)
export const getPresignedUploadUrl = async (
  fileName: string,
  expiry: number = 60 * 60 // 1 hour
): Promise<string> => {
  return await minioClient.presignedPutObject(bucketName, fileName, expiry);
};

// Get presigned URL for download
export const getPresignedDownloadUrl = async (
  fileName: string,
  expiry: number = 60 * 60 // 1 hour
): Promise<string> => {
  return await minioClient.presignedGetObject(bucketName, fileName, expiry);
};

// Extract file name from URL
export const extractFileNameFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Remove bucket name from path
    if (pathParts[1] === bucketName) {
      return pathParts.slice(2).join('/');
    }
    return pathParts.slice(1).join('/');
  } catch {
    return null;
  }
};

export default minioClient;
