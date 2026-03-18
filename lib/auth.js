import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "training.db");
const db = new Database(dbPath);

export const auth = betterAuth({
  database: db,
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-key",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
  ],
});
