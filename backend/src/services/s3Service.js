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

      // Return both the object key (suitable for DB storage) and a signed URL for immediate preview/download
      return { key, url };
    } catch (error) {
      console.error('Error subiendo archivo a S3:', error);
      throw new Error('Error al subir archivo a S3');
    }
  }

  static async getFileUrl(key, expiresIn = 3600) {
    if (!key) return null;
    try {
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
        { expiresIn }
      );
      return url;
    } catch (err) {
      console.error('Error generando signed URL para key:', key, err);
      return null;
    }
  }
}

export default S3Service;