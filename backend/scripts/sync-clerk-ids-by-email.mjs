#!/usr/bin/env node
/**
 * @fileoverview Sync usuario.clerkID with the new Clerk instance by matching email.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Reads all active users from the DB (with decrypted correo), fetches all users
 * from the target Clerk instance, and updates each DB user's clerkID when the
 * email matches. Use this after migrating users to a new Clerk instance so the
 * DB has the new clerkIDs without waiting for users to log in again.
 *
 * Usage (from project root):
 *   node backend/scripts/sync-clerk-ids-by-email.mjs
 *   node backend/scripts/sync-clerk-ids-by-email.mjs --secret=sk_live_XXX
 *   node backend/scripts/sync-clerk-ids-by-email.mjs --dry-run
 *   node backend/scripts/sync-clerk-ids-by-email.mjs --user=42
 *
 * Or from backend directory:
 *   cd backend && node scripts/sync-clerk-ids-by-email.mjs
 *
 * Options:
 *   --secret   Clerk Secret Key of the TARGET (new) instance (or set CLERK_SECRET_KEY)
 *   --dry-run  Only show what would be updated, do not write to DB
 *   --user=ID  Only sync one user by IDUsuario
 *
 * Requires: DB_*, ENCRYPTION_KEY, CLERK_SECRET_KEY in .env (root or backend).
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load backend .env when run from project root (node backend/scripts/...)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Parse CLI args before loading Clerk (so --secret can override env)
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [[m[1], m[2] ?? true]] : [];
  })
);
if (args.secret && typeof args.secret === 'string') {
  process.env.CLERK_SECRET_KEY = args.secret;
}
const DRY_RUN = args['dry-run'] === true || args['dry-run'] === 'true';
const ONLY_USER = args.user ? parseInt(args.user, 10) : null;

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
function divider() {
  console.log('─'.repeat(56));
}
function header(title) {
  console.log('\n' + '═'.repeat(56));
  console.log(`  ${bold(title)}`);
  console.log('═'.repeat(56));
}

const CLERK_API = 'https://api.clerk.com/v1';

async function fetchAllClerkUsers(secretKey) {
  const map = new Map(); // normalizedEmail -> clerkId
  let offset = 0;
  const limit = 100;
  const headers = {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
  };

  while (true) {
    const res = await fetch(
      `${CLERK_API}/users?limit=${limit}&offset=${offset}`,
      { headers }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Clerk API ${res.status}: ${body}`);
    }
    const json = await res.json();
    const data = Array.isArray(json) ? json : (json.data || []);
    const totalCount = json.total_count ?? json.totalCount ?? data.length;

    for (const user of data) {
      const clerkId = user.id;
      const emails = user.email_addresses || [];
      for (const ea of emails) {
        const email = typeof ea === 'string' ? ea : (ea.email_address || ea.email || '');
        if (email) {
          const norm = email.toLowerCase().trim();
          map.set(norm, clerkId);
        }
      }
      if (emails.length === 0 && user.primary_email_address_id) {
        const primary = (user.email_addresses || []).find(
          (e) => e.id === user.primary_email_address_id
        );
        if (primary) {
          const email = primary.email_address || primary.email || '';
          if (email) map.set(email.toLowerCase().trim(), clerkId);
        }
      }
    }

    if (data.length < limit) break;
    offset += limit;
    if (offset >= totalCount) break;
  }

  return map;
}

(async () => {
  header('Sync clerkID from Clerk by email');

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error(
      red('\n❌  Missing CLERK_SECRET_KEY. Set it in .env or pass --secret=sk_live_xxx\n')
    );
    process.exit(1);
  }

  console.log(`  Target Clerk : ${secretKey.slice(0, 12)}${'*'.repeat(10)}`);
  console.log(`  Dry run      : ${DRY_RUN ? yellow('YES (no DB updates)') : green('NO')}`);
  if (ONLY_USER) console.log(`  Only user    : ${bold(ONLY_USER)}`);
  divider();

  let config;
  let dbPool;
  let decryptFields;
  let updateUserClerkId;

  try {
    const configMod = await import('../config.js');
    config = configMod.default;
    dbPool = configMod.dbPool;
    const encMod = await import('../src/services/encryptionService.js');
    decryptFields = encMod.decryptFields;
    const usersMod = await import('../src/models/users.model.js');
    updateUserClerkId = usersMod.updateUserClerkId;
  } catch (err) {
    console.error(red(`\n❌  Failed to load backend config/models: ${err.message}`));
    console.error('   Run from project root: node backend/scripts/sync-clerk-ids-by-email.mjs\n');
    process.exit(1);
  }

  if (!config.encryption?.key) {
    console.error(red('\n❌  ENCRYPTION_KEY is required in .env to decrypt correo.\n'));
    process.exit(1);
  }

  console.log('\n  Fetching users from Clerk (new instance)...');
  let emailToClerkId;
  try {
    emailToClerkId = await fetchAllClerkUsers(secretKey);
    console.log(`  ${green('✔')}  ${bold(emailToClerkId.size)} unique emails found in Clerk.`);
  } catch (err) {
    console.error(red(`\n❌  Clerk API error: ${err.message}\n`));
    process.exit(1);
  }

  const whereUser = ONLY_USER
    ? 'AND u.IDUsuario = ' + parseInt(ONLY_USER, 10)
    : '';
  const [rows] = await dbPool.query(
    `SELECT u.IDUsuario, u.clerkID, u.correo
     FROM usuario u
     WHERE u.eliminado = 0 AND u.deletedAt IS NULL ${whereUser}
     ORDER BY u.IDUsuario`
  );

  const toSync = [];
  for (const row of rows) {
    const decrypted = decryptFields({ ...row }, ['correo']);
    const email = decrypted.correo?.trim();
    if (!email) continue;
    const norm = email.toLowerCase();
    const newClerkId = emailToClerkId.get(norm);
    if (!newClerkId) continue;
    if (row.clerkID === newClerkId) continue;
    toSync.push({
      IDUsuario: row.IDUsuario,
      email: norm,
      currentClerkId: row.clerkID || null,
      newClerkId,
    });
  }

  console.log(`  DB users (with email) : ${bold(rows.length)}`);
  console.log(`  Matches to update      : ${bold(green(toSync.length))}`);
  divider();

  if (toSync.length === 0) {
    console.log('  Nothing to sync.');
    divider();
    process.exit(0);
  }

  if (DRY_RUN) {
    console.log('  [DRY RUN] Would update:');
    toSync.forEach(({ IDUsuario, email, currentClerkId, newClerkId }) => {
      console.log(
        `    ${bold(IDUsuario)} ${email}  ${currentClerkId || 'NULL'} → ${newClerkId}`
      );
    });
    divider();
    console.log('  Run without --dry-run to apply changes.');
    process.exit(0);
  }

  let updated = 0;
  let failed = 0;
  for (const { IDUsuario, newClerkId } of toSync) {
    try {
      const ok = await updateUserClerkId(IDUsuario, newClerkId);
      if (ok) {
        process.stdout.write(green('  ✔'));
        updated++;
      } else {
        process.stdout.write(yellow('  ○'));
      }
    } catch (err) {
      process.stdout.write(red('  ✘'));
      failed++;
      console.error(`\n    User ${IDUsuario}: ${err.message}`);
    }
  }

  console.log('\n');
  divider();
  console.log(`  Updated : ${bold(green(updated))}`);
  console.log(`  Failed  : ${bold(failed > 0 ? red(failed) : green(failed))}`);
  divider();
  process.exit(failed > 0 ? 1 : 0);
})();
