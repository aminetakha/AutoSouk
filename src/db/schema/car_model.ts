import {
  date,
  foreignKey,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { makeTable } from "./car_make";

export const carModelTable = pgTable(
  "model",
  {
    id: integer().primaryKey(),
    makeId: integer("make_id")
      .references(() => makeTable.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar().notNull(),
    createdAt: date("created_at").defaultNow().notNull(),
    updatedAt: date("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      name: "make_fk",
      columns: [table.makeId],
      foreignColumns: [makeTable.id],
    }).onDelete("cascade"),
  ]
);
