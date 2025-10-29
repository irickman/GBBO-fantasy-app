// Turso database client with Drizzle ORM
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create Turso client
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create Drizzle instance with schema
export const db = drizzle(turso, { schema });

// Export schema for use in queries
export { schema };
