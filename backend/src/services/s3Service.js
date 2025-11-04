/**
 * @fileoverview Upload documents using Amazon S3
 * @author EXACTUM-dev 
 * @version 1.0.0
 * @description Inlcudes basic S3 configuration
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import crypto from 'crypto';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

class S3Service {
  static async uploadFile(file, nombres) {
    const fileExt = path.extname(file.originalname);
    const key = `${nombres}/${crypto.randomUUID()}${fileExt}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));

      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
        { expiresIn: 3600 }
      );

      return url;
    } catch (error) {
      console.error('Error subiendo archivo a S3:', error);
      throw new Error('Error al subir archivo a S3');
    }
  }

  /**
   * Generate a presigned URL for viewing a file
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} Presigned URL
   */
  static async getPresignedUrl(key, expiresIn = 3600) {
    if (!key) return null;

    try {
      // If the key is already a full URL, extract the key
      let s3Key = key;
      if (key.includes('amazonaws.com')) {
        const url = new URL(key);
        s3Key = url.pathname.substring(1); // Remove leading '/'
      }

      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }),
        { expiresIn }
      );

      // Return both the object key (suitable for DB storage) and a signed URL for immediate preview/download
      return { key, url };
    } catch (error) {
      console.error('Error generando URL presignada:', error);
      return null;
    }
  }

  /**
   * Generate presigned URLs for multiple files
   * @param {Array<string>} keys - Array of S3 object keys
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<Array<string>>} Array of presigned URLs
   */
  static async getPresignedUrls(keys, expiresIn = 3600) {
    if (!keys || !Array.isArray(keys)) return [];

    try {
      const urlPromises = keys.map(key => this.getPresignedUrl(key, expiresIn));
      return await Promise.all(urlPromises);
    } catch (error) {
      console.error('Error generando URLs presignadas:', error);
      return [];
    }
  }

  static async getFileUrl(key, expiresIn = 3600) {
    if (!key) return null;
    try {
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3key }),
        { expiresIn }
      );
      return url;
    } catch (error) {
      console.error('Error generando URL presignada:', error);
      return null;
    }
  }

  /**
   * Generate presigned URLs for multiple files
   * @param {Array<string>} keys - Array of S3 object keys
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<Array<string>>} Array of presigned URLs
   */
  static async getPresignedUrls(keys, expiresIn = 3600) {
    if (!keys || !Array.isArray(keys)) return [];

    try {
      const urlPromises = keys.map(key => this.getPresignedUrl(key, expiresIn));
      return await Promise.all(urlPromises);
    } catch (error) {
      console.error('Error generando URLs presignadas:', error);
      return [];
    }
  }
}

export default S3Service;