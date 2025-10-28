/**
 * @fileoverview CloudFront signed URL generator
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Generates signed URLs for secure CloudFront content delivery
 */

import AWS from "aws-sdk";

/**
 * Generates a signed CloudFront URL from S3 multimedia ID
 * @param {string} multimediaId - IDMultimedia (unique identifier in S3)
 * @param {number} expirationMinutes - URL expiration time in minutes
 * @returns {string} Signed URL
 * @throws {Error} If CloudFront configuration is missing
 */
export function generateSignedUrl(multimediaId, expirationMinutes = 60) {
  if (!process.env.CLOUDFRONT_DOMAIN) {
    throw new Error("CLOUDFRONT_DOMAIN not configured");
  }

  if (
    !process.env.CLOUDFRONT_KEY_PAIR_ID ||
    !process.env.CLOUDFRONT_PRIVATE_KEY
  ) {
    throw new Error("CloudFront credentials not configured");
  }
  // Replace escaped newlines with actual newlines in the private key
  const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, "\n");
  // Create a new signer instance with the formatted private key
  const signer = new AWS.CloudFront.Signer(
    process.env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey
  );

  const cloudFrontUrl = `${process.env.CLOUDFRONT_DOMAIN}/${multimediaId}`;
  const expiration = Math.floor(Date.now() / 1000) + expirationMinutes * 60;

  try {
    const signedUrl = signer.getSignedUrl({
      url: cloudFrontUrl,
      expires: expiration,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}
