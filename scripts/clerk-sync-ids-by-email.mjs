#!/usr/bin/env node
/**
 * Launcher for backend sync script: syncs usuario.clerkID with the new Clerk instance by email.
 * Runs: node backend/scripts/sync-clerk-ids-by-email.mjs [options]
 *
 * Usage (from project root):
 *   node scripts/clerk-sync-ids-by-email.mjs
 *   node scripts/clerk-sync-ids-by-email.mjs --secret=sk_live_XXX
 *   node scripts/clerk-sync-ids-by-email.mjs --dry-run
 *   node scripts/clerk-sync-ids-by-email.mjs --user=42
 *
 * Options: same as backend script (--secret, --dry-run, --user=ID).
 * Env: CLERK_SECRET_KEY, DB_*, ENCRYPTION_KEY (from .env at root or backend).
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendScript = path.join(__dirname, '..', 'backend', 'scripts', 'sync-clerk-ids-by-email.mjs');
const args = process.argv.slice(2);

const child = spawn(process.execPath, [backendScript, ...args], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});
child.on('exit', (code) => process.exit(code ?? 0));
