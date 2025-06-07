import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { carTable } from "./car";

export const carOriginTable = pgTable("car_origins", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  origin: varchar().notNull(),
});

export const carOriginRelations = relations(carOriginTable, ({ many }) => ({
  cars: many(carTable),
}));
