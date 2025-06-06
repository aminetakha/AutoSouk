import { relations } from "drizzle-orm";
import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { carModelTable } from "./car_model";

export const makeTable = pgTable("make", {
  id: integer().primaryKey(),
  name: varchar().notNull(),
  createdAt: date("created_at").defaultNow().notNull(),
  updatedAt: date("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(makeTable, ({ many }) => ({
  models: many(carModelTable),
}));
