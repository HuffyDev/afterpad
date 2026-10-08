import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadEnv } from './env.js';
import { buildApp } from './app.js';
import { memoryStore, pgStore, type Store } from './db/store.js';
import { runMigrations } from './db/migrate.js';

const env = loadEnv();
mkdirSync(env.MEDIA_DIR, { recursive: true });

let store: Store;
if (env.DATABASE_URL) {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 10 });
  await runMigrations(pool);
  store = pgStore(pool);
} else {
  console.warn('[db] DATABASE_URL not set — using in-memory store (data is lost on restart)');
  store = memoryStore();
}

const here = path.dirname(fileURLToPath(import.meta.url));
// dev (tsx): server/ → ../dist/client ; prod: dist/server/server/ → ../../client
const clientDir = [path.resolve(here, '../../client'), path.resolve(here, '../dist/client')].find((d) =>
  existsSync(path.join(d, 'index.html')),
) ?? null;

const app = await buildApp({ env, store, clientDir });
await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`AFTER PAD on :${env.PORT} — DRY_RUN=${env.DRY_RUN} store=${store.kind}`);
