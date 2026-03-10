#!/usr/bin/env node
/**
 * @fileoverview Manage clerkID column in the usuario table.
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Modes:
 *
 *   --status               Show how many users have/don't have a clerkID
 *
 *   --backup               Save all clerkIDs to a JSON file (before clearing)
 *     [--out=FILE]         Output file  (default: ./clerk-ids-backup.json)
 *
 *   --clear                Set clerkID = NULL for every non-deleted user
 *     --confirm            Required safety flag to actually run the UPDATE
 *     [--user=ID]          Only clear ONE specific IDUsuario (optional)
 *
 *   --restore              Read backup JSON and UPDATE each user's clerkID
 *     --from=FILE          Backup file to read  (default: ./clerk-ids-backup.json)
 *     [--user=ID]          Only restore ONE specific IDUsuario (optional)
 *
 * DB connection is read from ../.env (root of the project) unless overridden
 * via individual env vars or --host / --port / --user / --password / --db flags.
 *
 * Usage examples:
 *   node clerk-manage-ids.mjs --status
 *   node clerk-manage-ids.mjs --backup --out=./backup-2026-03-05.json
 *   node clerk-manage-ids.mjs --clear --confirm
 *   node clerk-manage-ids.mjs --clear --confirm --user=42
 *   node clerk-manage-ids.mjs --restore --from=./backup-2026-03-05.json
 *   node clerk-manage-ids.mjs --restore --from=./backup-2026-03-05.json --user=42
 *
 * To sync clerkID from the NEW Clerk instance by email (after migration), use:
 *   node scripts/clerk-sync-ids-by-email.mjs [--secret=sk_live_xxx] [--dry-run] [--user=ID]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

// ─── Locate project root .env ─────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_ENV = join(__dirname, '..', '.env');
const BACKEND_ENV = join(__dirname, '..', 'backend', '.env');

/** Very small .env parser — no external dep needed */
function parseEnvFile(filePath) {
    if (!existsSync(filePath)) return {};
    const out = {};
    readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) return;
        let val = m[2].trim();
        // Strip surrounding quotes  ' or "
        if ((val.startsWith("'") && val.endsWith("'")) ||
            (val.startsWith('"') && val.endsWith('"'))) {
            val = val.slice(1, -1);
        }
        out[m[1]] = val;
    });
    return out;
}

// Merge: root .env < backend .env < actual process.env
const rootEnv = parseEnvFile(ROOT_ENV);
const backendEnv = parseEnvFile(BACKEND_ENV);
const env = { ...rootEnv, ...backendEnv, ...process.env };

// ─── Parse CLI arguments ───────────────────────────────────────────────────────
const args = Object.fromEntries(
    process.argv.slice(2).flatMap((a) => {
        const m = a.match(/^--([^=]+)(?:=(.*))?$/);
        return m ? [[m[1], m[2] ?? true]] : [];
    })
);

const MODE = ['status', 'backup', 'clear', 'restore'].find((m) => args[m] === true);
const CONFIRM = args.confirm === true;
const ONLY_USER = args.user ? parseInt(args.user, 10) : null;
const OUT_FILE = args.out || './clerk-ids-backup.json';
const FROM_FILE = args.from || './clerk-ids-backup.json';

// DB connection flags (override .env values)
const DB_HOST = args.host || env.DB_HOST || 'localhost';
const DB_PORT = args.port || env.DB_PORT || '3306';
const DB_USER = args['db-user'] || env.DB_USER || 'root';
const DB_PASS = args['db-pass'] || env.DB_PASSWORD || '';
const DB_NAME = args.db || env.DB_DATABASE || 'fisiomax';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

function printUsage() {
    console.log(`
${bold('clerk-manage-ids.mjs')} — Manage clerkID column in the usuario table

${bold('Modes:')}
  ${cyan('--status')}                     Show clerkID stats
  ${cyan('--backup')} [--out=FILE]        Backup all clerkIDs to JSON
  ${cyan('--clear')}  --confirm           Set clerkID = NULL for all users
           [--user=ID]          Only clear one user
  ${cyan('--restore')} --from=FILE        Restore clerkIDs from backup
            [--user=ID]         Only restore one user

${bold('DB connection (reads from .env automatically):')}
  --host, --port, --db-user, --db-pass, --db

${bold('Examples:')}
  node clerk-manage-ids.mjs --status
  node clerk-manage-ids.mjs --backup --out=backup.json
  node clerk-manage-ids.mjs --clear --confirm
  node clerk-manage-ids.mjs --clear --confirm --user=5
  node clerk-manage-ids.mjs --restore --from=backup.json
  node clerk-manage-ids.mjs --restore --from=backup.json --user=5

${bold('Sync clerkID from new Clerk instance by email (no login required):')}
  node clerk-sync-ids-by-email.mjs --secret=sk_live_XXX [--dry-run] [--user=5]
`);
}

function divider() { console.log('─'.repeat(52)); }
function header(title) {
    console.log('\n' + '═'.repeat(52));
    console.log(`  ${bold(title)}`);
    console.log('═'.repeat(52));
}

// ─── DB helpers ───────────────────────────────────────────────────────────────
async function openDb() {
    return mysql.createConnection({
        host: DB_HOST,
        port: parseInt(DB_PORT, 10),
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
    });
}

// ─── Modes ────────────────────────────────────────────────────────────────────

async function runStatus(db) {
    header('Status — clerkID in usuario table');

    const [rows] = await db.query(`
    SELECT
      COUNT(*) AS total,
      SUM(clerkID IS NOT NULL AND clerkID != '') AS with_id,
      SUM(clerkID IS NULL OR clerkID = '') AS without_id
    FROM usuario
    WHERE eliminado = 0 AND deletedAt IS NULL
  `);
    const { total, with_id, without_id } = rows[0];

    console.log(`  Total active users : ${bold(total)}`);
    console.log(`  ${green('✔')}  With clerkID    : ${bold(green(with_id))}`);
    console.log(`  ${yellow('○')}  Without clerkID : ${bold(yellow(without_id))}`);
    divider();

    if (ONLY_USER) {
        const [ur] = await db.query(
            `SELECT IDUsuario, clerkID FROM usuario WHERE IDUsuario = ? AND eliminado = 0 AND deletedAt IS NULL`,
            [ONLY_USER]
        );
        if (ur.length) {
            const u = ur[0];
            const status = u.clerkID ? green(`✔  "${u.clerkID}"`) : yellow('○  NULL');
            console.log(`  User ${bold(u.IDUsuario)} → clerkID: ${status}`);
        } else {
            console.log(red(`  User ${ONLY_USER} not found.`));
        }
        divider();
    }
}

async function runBackup(db) {
    header('Backup — exporting clerkIDs');

    const whereUser = ONLY_USER ? `AND IDUsuario = ${parseInt(ONLY_USER, 10)}` : '';
    const [rows] = await db.query(`
    SELECT IDUsuario, clerkID
    FROM usuario
    WHERE eliminado = 0 AND deletedAt IS NULL ${whereUser}
    ORDER BY IDUsuario
  `);

    const backup = {
        created_at: new Date().toISOString(),
        db_host: DB_HOST,
        db_name: DB_NAME,
        total: rows.length,
        entries: rows.map((r) => ({
            IDUsuario: r.IDUsuario,
            clerkID: r.clerkID || null,
        })),
    };

    writeFileSync(OUT_FILE, JSON.stringify(backup, null, 2), 'utf8');

    console.log(`  Users exported     : ${bold(rows.length)}`);
    console.log(`  With clerkID       : ${bold(green(rows.filter((r) => r.clerkID).length))}`);
    console.log(`  Without clerkID    : ${bold(yellow(rows.filter((r) => !r.clerkID).length))}`);
    console.log(`  ${green('✔')}  Saved to         : ${bold(resolve(OUT_FILE))}`);
    divider();
}

async function runClear(db) {
    header('Clear — setting clerkID = NULL');

    if (!CONFIRM) {
        console.log(yellow(`  ⚠️  This will set clerkID = NULL for all (or one) user(s).`));
        console.log(yellow(`  ⚠️  Run --backup first so you can restore later!\n`));
        console.log(`  Re-run with ${bold('--confirm')} to proceed:\n`);
        if (ONLY_USER) {
            console.log(cyan(`    node clerk-manage-ids.mjs --clear --confirm --user=${ONLY_USER}`));
        } else {
            console.log(cyan(`    node clerk-manage-ids.mjs --clear --confirm`));
        }
        console.log('');
        divider();
        return;
    }

    // Check how many will be affected before running
    const whereUser = ONLY_USER ? `AND IDUsuario = ${parseInt(ONLY_USER, 10)}` : '';
    const [[{ count }]] = await db.query(`
    SELECT COUNT(*) AS count FROM usuario
    WHERE eliminado = 0 AND deletedAt IS NULL
      AND (clerkID IS NOT NULL AND clerkID != '') ${whereUser}
  `);

    console.log(`  Users to clear     : ${bold(red(count))}`);

    if (count === 0) {
        console.log(yellow('  Nothing to do — all selected users already have clerkID = NULL.'));
        divider();
        return;
    }

    const [result] = await db.query(`
    UPDATE usuario
    SET clerkID = NULL
    WHERE eliminado = 0 AND deletedAt IS NULL ${whereUser}
  `);

    console.log(`  ${green('✔')}  Rows updated     : ${bold(green(result.affectedRows))}`);
    console.log(`\n  ${yellow('ℹ')}  Users will be re-linked by email on next login.`);
    divider();
}

async function runRestore(db) {
    header('Restore — re-applying clerkIDs from backup');

    if (!existsSync(FROM_FILE)) {
        console.error(red(`  ❌  Backup file not found: ${resolve(FROM_FILE)}`));
        divider();
        return;
    }

    let backup;
    try {
        backup = JSON.parse(readFileSync(FROM_FILE, 'utf8'));
    } catch (err) {
        console.error(red(`  ❌  Failed to parse backup file: ${err.message}`));
        divider();
        return;
    }

    let entries = backup.entries || [];

    // Filter to a specific user if requested
    if (ONLY_USER) {
        entries = entries.filter((e) => e.IDUsuario === ONLY_USER);
        if (!entries.length) {
            console.error(red(`  ❌  User ${ONLY_USER} not found in backup.`));
            divider();
            return;
        }
    }

    // Only restore entries that actually have a clerkID
    const toRestore = entries.filter((e) => e.clerkID);
    const skipped = entries.length - toRestore.length;

    console.log(`  Backup date        : ${bold(backup.created_at || '—')}`);
    console.log(`  Entries in backup  : ${bold(entries.length)}`);
    console.log(`  ${yellow('○')}  Skipped (no id)  : ${bold(yellow(skipped))}`);
    console.log(`  ${green('✔')}  To restore       : ${bold(green(toRestore.length))}`);
    divider();

    let updated = 0, failed = 0;

    for (const { IDUsuario, clerkID } of toRestore) {
        try {
            const [res] = await db.query(
                `UPDATE usuario SET clerkID = ? WHERE IDUsuario = ? AND eliminado = 0 AND deletedAt IS NULL`,
                [clerkID, IDUsuario]
            );
            if (res.affectedRows > 0) {
                process.stdout.write(green('  ✔'));
            } else {
                process.stdout.write(yellow('  ○'));  // user not found / already deleted
            }
            updated += res.affectedRows;
        } catch (err) {
            process.stdout.write(red('  ✘'));
            failed++;
        }
    }

    console.log('\n');
    divider();
    console.log(`  Updated            : ${bold(green(updated))}`);
    console.log(`  Failed             : ${bold(failed > 0 ? red(failed) : green(failed))}`);
    divider();
}

// ─── Entry point ──────────────────────────────────────────────────────────────
(async () => {
    if (!MODE) {
        printUsage();
        process.exit(0);
    }

    console.log('\n' + '═'.repeat(52));
    console.log(`  ${bold('clerk-manage-ids.mjs')}   mode: ${cyan(MODE)}`);
    console.log(`  DB: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    if (ONLY_USER) console.log(`  Targeting user ID: ${bold(ONLY_USER)}`);
    console.log('═'.repeat(52));

    let db;
    try {
        db = await openDb();
    } catch (err) {
        console.error(red(`\n❌  Cannot connect to DB: ${err.message}`));
        console.error(`   Check DB_HOST / DB_USER / DB_PASSWORD / DB_DATABASE in your .env\n`);
        process.exit(1);
    }

    try {
        if (MODE === 'status') await runStatus(db);
        if (MODE === 'backup') await runBackup(db);
        if (MODE === 'clear') await runClear(db);
        if (MODE === 'restore') await runRestore(db);
    } finally {
        await db.end();
    }
})();
