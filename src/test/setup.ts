import path from "path";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.TEST_DB_CONNECTION_STRING,
});
const db = drizzle(pool);

beforeAll(async () => {
  await migrate(db, {
    migrationsFolder: path.join(path.resolve(), "/drizzle"),
  });
});

beforeEach(async () => {
  // clear all data from tables in public schema
  await db.execute(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
          ) LOOP
            EXECUTE 'DELETE FROM ' || quote_ident(r.tablename);
          END LOOP;
        END $$;
      `);
});

afterAll(async () => {
  await pool.end();
});
