import {
  foreignKey,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const emailVerificationTokensTable = pgTable(
  "email_verification_tokens",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    token: varchar().notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      name: "user_fk",
      columns: [table.userId],
      foreignColumns: [usersTable.id],
    }).onDelete("cascade"),
  ]
);
