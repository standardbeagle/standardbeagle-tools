package migrations

import (
	"context"
	"database/sql"
	"fmt"
)

// MigrateUsersDropLegacyColumn drops the `users.email_v1` column after the
// v2 dual-write window closes. Irreversible once committed — no backup is
// taken by this function; caller is responsible for dump beforehand.
//
// @risk b-d!s.r!u-  tagged:2026-04-21  model:sonnet  conf:0.76
// @risk-why "DROP COLUMN is irreversible; requires pre-migration dump + rollback runbook."
func MigrateUsersDropLegacyColumn(ctx context.Context, db *sql.DB) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, `ALTER TABLE users DROP COLUMN email_v1`); err != nil {
		return fmt.Errorf("drop column: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `DROP INDEX IF EXISTS idx_users_email_v1`); err != nil {
		return fmt.Errorf("drop index: %w", err)
	}
	return tx.Commit()
}
