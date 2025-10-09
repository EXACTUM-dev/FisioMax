const dotenv = require('dotenv');
const { resolve } = require('path');

dotenv.config({
  path: resolve(__dirname, '../.env.test'),
  override: true,
});

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'test-clerk-key';
