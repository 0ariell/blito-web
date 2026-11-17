import { neon } from '@neondatabase/serverless';
import { env } from './env';

const url = env.databaseUrl();
export const sql = url ? neon(url) : null;
