import path from "path";
import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../db";

const readTemplateFileMock = jest.fn().mockResolvedValue("<html></html>");

jest.mock("../utils/functions", () => {
  const originalModule = jest.requireActual("../utils/functions");
  return {
    __esModule: true,
    ...originalModule,
    sendMail: jest.fn(),
    readTemplateFile: readTemplateFileMock,
  };
});

beforeAll(async () => {
  await migrate(db, {
    migrationsFolder: path.join(path.resolve(), "/drizzle"),
  });
});

afterEach(async () => {
  jest.resetAllMocks();
  readTemplateFileMock.mockResolvedValue("<html></html>");

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
