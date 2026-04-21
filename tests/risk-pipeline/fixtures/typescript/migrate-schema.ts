import type { Database } from "./db";

/**
 * Rename `users.email_addr` column to `users.email` in-place, backfill
 * existing rows, and update the unique index. Irreversible once committed.
 *
 * Runs as part of the 2026-Q2 schema migration sweep.
 *
 * @risk b-d!s.r!u- tagged:2026-04-21 model:sonnet conf:0.78
 * @risk-why "Data mutation + column rename = irreversible without backup."
 */
export async function migrateEmailColumn(db: Database): Promise<void> {
  const tx = await db.begin();
  try {
    await tx.run(`ALTER TABLE users RENAME COLUMN email_addr TO email`);
    await tx.run(`UPDATE users SET email = LOWER(email) WHERE email IS NOT NULL`);
    await tx.run(`DROP INDEX IF EXISTS idx_users_email_addr`);
    await tx.run(`CREATE UNIQUE INDEX idx_users_email ON users(email)`);
    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  }
}
