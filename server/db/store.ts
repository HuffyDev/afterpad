import { desc, eq, sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import type { LaunchRecord, LaunchStatus } from '../../shared/launch.js';
import { launches, waitlist } from './schema.js';

export type NewLaunch = Omit<LaunchRecord, 'createdAt' | 'signature' | 'status' | 'simulated'>;

export interface Store {
  kind: 'postgres' | 'memory';
  upsertBuilding(l: NewLaunch): Promise<LaunchRecord>;
  getLaunch(launchId: string): Promise<LaunchRecord | null>;
  getByMint(mint: string): Promise<LaunchRecord | null>;
  /** atomically move a launch from one status to another; returns null if it was not in `from` */
  transition(launchId: string, from: LaunchStatus[], to: LaunchStatus, patch?: Partial<LaunchRecord>): Promise<LaunchRecord | null>;
  listPublic(opts: { includeSimulated: boolean; limit: number }): Promise<LaunchRecord[]>;
  addWaitlist(xHandle: string, wallet: string): Promise<'added' | 'exists'>;
  waitlistCount(): Promise<number>;
}

const toRecord = (r: typeof launches.$inferSelect): LaunchRecord => ({
  ...r,
  status: r.status as LaunchStatus,
  createdAt: r.createdAt.toISOString(),
});

export function pgStore(pool: Pool): Store {
  const db: NodePgDatabase = drizzle(pool);
  return {
    kind: 'postgres',
    async upsertBuilding(l) {
      const [row] = await db
        .insert(launches)
        .values({ ...l, status: 'building' })
        .onConflictDoUpdate({
          target: launches.launchId,
          set: { ...l },
          setWhere: sql`${launches.status} in ('building','failed')`,
        })
        .returning();
      return row ? toRecord(row) : (await this.getLaunch(l.launchId))!;
    },
    async getLaunch(id) {
      const [r] = await db.select().from(launches).where(eq(launches.launchId, id));
      return r ? toRecord(r) : null;
    },
    async getByMint(mint) {
      const [r] = await db.select().from(launches).where(eq(launches.mint, mint));
      return r ? toRecord(r) : null;
    },
    async transition(id, from, to, patch = {}) {
      const { createdAt: _c, launchId: _l, ...rest } = patch;
      const [r] = await db
        .update(launches)
        .set({ ...rest, status: to })
        .where(sql`${launches.launchId} = ${id} and ${launches.status} in ${from}`)
        .returning();
      return r ? toRecord(r) : null;
    },
    async listPublic({ includeSimulated, limit }) {
      const rows = await db
        .select()
        .from(launches)
        .where(includeSimulated ? sql`${launches.status} in ('confirmed','simulated')` : eq(launches.status, 'confirmed'))
        .orderBy(desc(launches.createdAt))
        .limit(limit);
      return rows.map(toRecord);
    },
    async addWaitlist(xHandle, wallet) {
      const r = await db.insert(waitlist).values({ xHandle: xHandle.toLowerCase(), wallet }).onConflictDoNothing().returning();
      return r.length ? 'added' : 'exists';
    },
    async waitlistCount() {
      const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(waitlist);
      return r.n;
    },
  };
}

/** Used when DATABASE_URL is not set (local UI work, tests). Not persistent. */
export function memoryStore(): Store {
  const rows = new Map<string, LaunchRecord>();
  const wl = new Map<string, string>();
  return {
    kind: 'memory',
    async upsertBuilding(l) {
      const cur = rows.get(l.launchId);
      if (cur && !['building', 'failed'].includes(cur.status)) return cur;
      const rec: LaunchRecord = { ...l, signature: null, status: 'building', simulated: false, createdAt: cur?.createdAt ?? new Date().toISOString() };
      rows.set(l.launchId, rec);
      return rec;
    },
    async getLaunch(id) {
      return rows.get(id) ?? null;
    },
    async getByMint(mint) {
      return [...rows.values()].find((r) => r.mint === mint) ?? null;
    },
    async transition(id, from, to, patch = {}) {
      const cur = rows.get(id);
      if (!cur || !from.includes(cur.status)) return null;
      const next = { ...cur, ...patch, launchId: id, status: to };
      rows.set(id, next);
      return next;
    },
    async listPublic({ includeSimulated, limit }) {
      return [...rows.values()]
        .filter((r) => r.status === 'confirmed' || (includeSimulated && r.status === 'simulated'))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    },
    async addWaitlist(x, w) {
      const k = x.toLowerCase();
      if (wl.has(k) || [...wl.values()].includes(w)) return 'exists';
      wl.set(k, w);
      return 'added';
    },
    async waitlistCount() {
      return wl.size;
    },
  };
}
