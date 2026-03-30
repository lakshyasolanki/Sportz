import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('Database connection string is not defined')
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_CONNECTION_STRING!,
  },
});
