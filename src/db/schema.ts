import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar().notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  salt: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }).notNull(),
  role: varchar({
    enum: ["buyer", "seller", "mechanic", "admin"],
    length: 10,
  }).notNull(),
  city: varchar({ length: 100 }).notNull(),
  imageUrl: varchar("image_url"),
  createdAt: date("created_at").defaultNow().notNull(),
  updatedAt: date("updated_at").defaultNow().notNull(),
});
