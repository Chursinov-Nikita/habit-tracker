import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon на Vercel отдаёт пул соединений в DATABASE_URL и прямое
    // подключение в DATABASE_URL_UNPOOLED — миграциям нужно прямое.
    url: process.env.DATABASE_URL_UNPOOLED ?? env("DATABASE_URL"),
  },
});
