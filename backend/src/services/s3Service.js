/**
 * @fileoverview Upload documents using Amazon S3
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Inlcudes basic S3 configuration
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateSignedUrl as generateCloudFrontUrl } from "../utils/cloudfront.js";
import path from "path";
import crypto from "crypto";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

class S3Service {
  static async uploadFile(file, nombres) {
    // Use the original filename to preserve timestamp-based naming
    const filename = path.basename(file.originalname);
    const key = `${nombres}/${filename}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));

      // Return the S3 key instead of the presigned URL
      return key;
    } catch (error) {
      throw new Error("Error al subir archivo a S3");
    }
  }

  /**
   * Generate a presigned URL for viewing a file via CloudFront
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} Presigned CloudFront URL
   */
  static async getPresignedUrl(key, expiresIn = 3600) {
    if (!key) return null;

    try {
      // If the key is already a full URL, extract the key
      let s3Key = key;
      if (key.includes("amazonaws.com")) {
        const url = new URL(key);
        s3Key = url.pathname.substring(1); // Remove leading '/'
      }

      // Convert seconds to minutes for CloudFront
      const expirationMinutes = Math.ceil(expiresIn / 60);

      // Generate CloudFront signed URL instead of S3
      const url = generateCloudFrontUrl(s3Key, expirationMinutes);

      return url;
    } catch (error) {
      console.error("Error generating CloudFront URL:", error);
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
      const urlPromises = keys.map((key) =>
        this.getPresignedUrl(key, expiresIn)
      );
      return await Promise.all(urlPromises);
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - S3 object key to delete
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async deleteFile(key) {
    if (!key) return false;

    try {
      // If the key is already a full URL, extract the key
      let s3Key = key;
      if (key.includes("amazonaws.com")) {
        const url = new URL(key);
        s3Key = url.pathname.substring(1); // Remove leading '/'
      }

      const params = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
      };

      await s3.send(new DeleteObjectCommand(params));
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Presign file for direct upload from the client
   * @param {string} key - S3 object key to delete
   * @param {string} contentType - File type of the content to be uploaded
   * @returns {Promise<json>} True if deleted successfully
   */
  static async getPresignedUploadUrl(key, contentType) {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1h
  }
}

export default S3Service;
