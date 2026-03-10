#!/usr/bin/env node
/**
 * @fileoverview Import users from a Clerk-exported CSV into a Clerk instance (dev or prod).
 * @version 1.0.0
 * @author EXACTUM-dev
 *
 * Usage:
 *   node clerk-import-users.mjs --secret=sk_live_XXX --csv=./users.csv [--delay=300] [--dry-run]
 *
 * Options:
 *   --secret   Clerk Secret Key of the TARGET instance  (sk_live_... or sk_test_...)
 *   --csv      Path to the CSV file exported from Clerk
 *   --delay    Milliseconds to wait between API calls (default: 300)
 *   --dry-run  Parse CSV and preview without creating users
 *
 * Requirements:
 *   Node.js 18+  (uses native fetch)
 *   npm install csv-parse   (only external dependency)
 *
 * Clerk CSV export columns handled:
 *   id, first_name, last_name, username, primary_email_address_id,
 *   email_address[N], email_verified[N],
 *   phone_number[N], phone_verified[N],
 *   password_enabled, banned, external_id,
 *   public_metadata, private_metadata, unsafe_metadata,
 *   created_at (Unix ms or ISO string)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Parse CLI arguments ────────────────────────────────────────────────────
const args = Object.fromEntries(
    process.argv.slice(2).flatMap((a) => {
        const m = a.match(/^--([^=]+)(?:=(.*))?$/);
        return m ? [[m[1], m[2] ?? true]] : [];
    })
);

const SECRET_KEY = args.secret || process.env.CLERK_SECRET_KEY;
const CSV_PATH = args.csv || process.env.CSV_FILE;
const DELAY_MS = parseInt(args.delay ?? '300', 10);
const DRY_RUN = args['dry-run'] === true || args['dry-run'] === 'true';
const LOG_FILE = args.log || './clerk-import-results.json';

if (!SECRET_KEY) {
    console.error('\n❌  Missing --secret=<CLERK_SECRET_KEY>\n');
    console.error('   Example: node clerk-import-users.mjs --secret=sk_live_XXX --csv=users.csv\n');
    process.exit(1);
}
if (!CSV_PATH) {
    console.error('\n❌  Missing --csv=<path/to/users.csv>\n');
    process.exit(1);
}
if (!existsSync(CSV_PATH)) {
    console.error(`\n❌  CSV file not found: ${resolve(CSV_PATH)}\n`);
    process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const CLERK_API = 'https://api.clerk.com/v1';

const headers = {
    'Authorization': `Bearer ${SECRET_KEY}`,
    'Content-Type': 'application/json',
};

/** Sleep for ms milliseconds */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Convert Clerk's created_at (Unix ms or ISO string) to ISO-8601 */
function toIso(value) {
    if (!value) return undefined;
    const num = Number(value);
    if (!isNaN(num) && num > 1_000_000_000) {
        // Unix timestamp in milliseconds
        return new Date(num).toISOString();
    }
    // Already ISO string
    const d = new Date(value);
    return isNaN(d) ? undefined : d.toISOString();
}

/**
 * Extract all email_address[N] columns from a CSV row.
 * Clerk CSV uses dynamic column names: email_address[0], email_address[1], …
 * It also uses flat names: email_addresses (JSON array) in some export versions.
 * Returns an array of { email, verified } objects.
 */
function extractEmails(row) {
    const emails = [];

    // Tu formato: primary_email_address + verified/unverified lists
    const seen = new Set();

    // Emails verificados
    if (row.verified_email_addresses) {
        row.verified_email_addresses.split(',').map(e => e.trim()).filter(Boolean).forEach(email => {
            if (!seen.has(email)) { seen.add(email); emails.push({ email, verified: true }); }
        });
    }

    // Emails no verificados
    if (row.unverified_email_addresses) {
        row.unverified_email_addresses.split(',').map(e => e.trim()).filter(Boolean).forEach(email => {
            if (!seen.has(email)) { seen.add(email); emails.push({ email, verified: false }); }
        });
    }

    // Fallback: primary_email_address
    if (!emails.length && row.primary_email_address) {
        emails.push({ email: row.primary_email_address.trim(), verified: true });
    }

    return emails;
}

/**
 * Extract phone numbers from a CSV row.
 * Handles phone_number[N] / phone_numbers (JSON) formats.
 */
function extractPhones(row) {
    const phones = [];

    let i = 0;
    while (true) {
        const key = `phone_number[${i}]`;
        if (!(key in row)) break;
        const phone = (row[key] || '').trim();
        if (phone) phones.push(phone);
        i++;
    }
    if (phones.length) return phones;

    if (row.phone_numbers) {
        try {
            const parsed = JSON.parse(row.phone_numbers);
            if (Array.isArray(parsed)) {
                parsed.forEach((p) => {
                    const num = typeof p === 'string' ? p : p.phone_number;
                    if (num) phones.push(num.trim());
                });
            }
        } catch { /* not JSON */ }
        if (!phones.length && row.phone_numbers) {
            phones.push(row.phone_numbers.trim());
        }
    }

    return phones;
}

/** Call Clerk API to create a user. Returns { ok, status, body }. */
async function createClerkUser(payload) {
    const res = await fetch(`${CLERK_API}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
}

/** Build the Clerk create-user payload from a CSV row */
function buildPayload(row) {
    const emails = extractEmails(row);
    const phones = extractPhones(row);

    if (!emails.length) return null; // skip rows without email

    const payload = {
        // Skip password requirements — users will reset via email on first login
        skip_password_checks: true,
        skip_password_requirement: true,

        email_address: emails.map((e) => e.email),
        first_name: (row.first_name || '').trim() || undefined,
        last_name: (row.last_name || '').trim() || undefined,
        username: (row.username || '').trim() || undefined,
        external_id: (row.external_id || '').trim() || undefined,
    };

    // Phone numbers
    if (phones.length) payload.phone_number = phones;

    // Metadata (only include if non-empty / non-null JSON)
    try {
        const pub = row.public_metadata ? JSON.parse(row.public_metadata) : null;
        const priv = row.private_metadata ? JSON.parse(row.private_metadata) : null;
        const uns = row.unsafe_metadata ? JSON.parse(row.unsafe_metadata) : null;
        if (pub && Object.keys(pub).length) payload.public_metadata = pub;
        if (priv && Object.keys(priv).length) payload.private_metadata = priv;
        if (uns && Object.keys(uns).length) payload.unsafe_metadata = uns;
    } catch { /* ignore malformed metadata */ }

    // Preserve original creation timestamp
    const createdAt = toIso(row.created_at);
    if (createdAt) payload.created_at = createdAt;

    // Clean undefined values
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    return payload;
}

// ─── Main ────────────────────────────────────────────────────────────────────
(async () => {
    console.log('\n════════════════════════════════════════════════');
    console.log('  Clerk User Import Script  v1.0.0');
    console.log('════════════════════════════════════════════════');
    console.log(`  CSV:      ${resolve(CSV_PATH)}`);
    console.log(`  Target:   ${SECRET_KEY.slice(0, 12)}${'*'.repeat(10)}`);
    console.log(`  Delay:    ${DELAY_MS}ms between requests`);
    console.log(`  Dry-run:  ${DRY_RUN ? 'YES (no users will be created)' : 'NO'}`);
    console.log('════════════════════════════════════════════════\n');

    // ── Parse CSV ──────────────────────────────────────────────────────────────
    const raw = readFileSync(CSV_PATH, 'utf8');
    let rows;
    try {
        rows = parse(raw, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true, // Clerk CSV can have variable email columns
        });
    } catch (err) {
        console.error('❌  Failed to parse CSV:', err.message);
        process.exit(1);
    }

    console.log(`📋  ${rows.length} rows found in CSV.\n`);

    if (DRY_RUN) {
        console.log('─── DRY RUN PREVIEW (first 5 rows) ───────────────');
        rows.slice(0, 5).forEach((row, i) => {
            const emails = extractEmails(row);
            console.log(`  [${i + 1}] ${row.first_name || ''} ${row.last_name || ''} | ${emails.map((e) => e.email).join(', ') || '⚠️ NO EMAIL'} | id: ${row.id || row.user_id || '—'}`);
        });
        console.log('\n✅  Dry-run complete. No users were created.');
        return;
    }

    // ── Iterate and import ─────────────────────────────────────────────────────
    const results = { created: [], skipped: [], failed: [] };
    let idx = 0;

    for (const row of rows) {
        idx++;
        const originalId = row.id || row.user_id || `row-${idx}`;
        const emails = extractEmails(row);

        if (!emails.length) {
            console.warn(`⚠️  [${idx}/${rows.length}] Skipping ${originalId} — no email found`);
            results.skipped.push({ originalId, reason: 'no email' });
            continue;
        }

        const primaryEmail = emails[0].email;
        const payload = buildPayload(row);

        process.stdout.write(`  [${idx}/${rows.length}] ${primaryEmail} ... `);

        try {
            const { ok, status, body } = await createClerkUser(payload);

            if (ok) {
                console.log(`✅  created → ${body.id}`);
                results.created.push({
                    originalId,
                    newClerkId: body.id,
                    email: primaryEmail,
                });
            } else if (status === 422 && body.errors?.some((e) => e.code === 'form_identifier_exists')) {
                // User already exists in the target instance
                console.log(`⏭️  already exists (skipped)`);
                results.skipped.push({ originalId, email: primaryEmail, reason: 'already exists' });
            } else if (status === 429) {
                // Rate limited — wait longer and retry once
                console.warn(`⏳  rate limited, waiting 5s...`);
                await sleep(5000);
                const retry = await createClerkUser(payload);
                if (retry.ok) {
                    console.log(`✅  created (after retry) → ${retry.body.id}`);
                    results.created.push({ originalId, newClerkId: retry.body.id, email: primaryEmail });
                } else {
                    console.error(`❌  failed after retry (${retry.status}): ${JSON.stringify(retry.body.errors)}`);
                    results.failed.push({ originalId, email: primaryEmail, status: retry.status, error: retry.body.errors });
                }
            } else {
                const errMsg = body.errors?.map((e) => e.message).join(', ') || JSON.stringify(body);
                console.error(`❌  error (${status}): ${errMsg}`);
                results.failed.push({ originalId, email: primaryEmail, status, error: body.errors || body });
            }
        } catch (err) {
            console.error(`❌  network error: ${err.message}`);
            results.failed.push({ originalId, email: primaryEmail, error: err.message });
        }

        // Throttle to avoid hitting Clerk rate limits
        await sleep(DELAY_MS);
    }

    // ── Final report ───────────────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════════════');
    console.log('  Import Complete');
    console.log('════════════════════════════════════════════════');
    console.log(`  ✅  Created:  ${results.created.length}`);
    console.log(`  ⏭️  Skipped:  ${results.skipped.length}`);
    console.log(`  ❌  Failed:   ${results.failed.length}`);
    console.log('');

    if (results.failed.length) {
        console.log('  Failed users:');
        results.failed.forEach((f) => {
            console.log(`    - ${f.email || f.originalId}: ${JSON.stringify(f.error)}`);
        });
        console.log('');
    }

    // Write full results to JSON log
    writeFileSync(LOG_FILE, JSON.stringify(results, null, 2));
    console.log(`  📄  Full results saved to: ${resolve(LOG_FILE)}`);
    console.log('════════════════════════════════════════════════\n');

    // Exit with error code if any failed
    process.exit(results.failed.length > 0 ? 1 : 0);
})();
