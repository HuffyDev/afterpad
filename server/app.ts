import { existsSync } from 'node:fs';
import path from 'node:path';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import {
  BANNER_MAX_BYTES,
  IMAGE_MAX_BYTES,
  launchFieldsSchema,
  sendRequestSchema,
  waitlistSchema,
  type PublicConfig,
  type TokenView,
} from '../shared/launch.js';
import { mockAllowed, type Env } from './env.js';
import type { Store } from './db/store.js';
import { createLauncher, LaunchError } from './services/launcher.js';
import { getMarkets } from './services/dexscreener.js';
import type { FetchLike } from './services/http.js';
import { sniffImage } from './lib/image.js';
import { createLimiter } from './lib/rateLimit.js';

export interface AppDeps {
  env: Env;
  store: Store;
  fetchImpl?: FetchLike;
  clientDir?: string | null;
  logger?: boolean;
}

export async function buildApp({ env, store, fetchImpl, clientDir, logger = true }: AppDeps): Promise<FastifyInstance> {
  const app = Fastify({ logger: logger ? { level: 'info' } : false, bodyLimit: 2 * 1024 * 1024, trustProxy: true });
  const launcher = createLauncher({ env, store, fetchImpl, log: (m, x) => app.log.info({ x }, m) });
  const limit = createLimiter();
  const guard = (req: FastifyRequest, bucket: string, max: number, windowMs = 60_000) => {
    if (!limit(`${req.ip}:${bucket}`, max, windowMs)) throw new LaunchError('Slow down — too many requests.', 429, 'rate_limited');
  };

  await app.register(multipart, { limits: { fileSize: Math.max(IMAGE_MAX_BYTES, BANNER_MAX_BYTES), files: 2, fields: 12 } });

  app.setErrorHandler((err, _req, reply) => {
    const e = err as Error & { status?: number; code?: string; statusCode?: number };
    const status = e instanceof LaunchError ? e.status : e.statusCode && e.statusCode < 500 ? e.statusCode : 500;
    if (status >= 500) app.log.error(err);
    reply.status(status).send({ error: status >= 500 && !(e instanceof LaunchError) ? 'Internal error' : e.message, code: e.code ?? 'error' });
  });

  const origin = (req: FastifyRequest) => `${req.protocol}://${req.host}`;

  app.get('/api/health', async () => ({ ok: true, store: store.kind, dryRun: env.DRY_RUN }));

  app.get('/api/config', async (): Promise<PublicConfig> => ({
    dryRun: env.DRY_RUN,
    mockMode: mockAllowed(env),
    afterMint: env.AFTER_MINT || null,
    afterX: env.AFTER_X_URL || null,
    afterTelegram: env.AFTER_TELEGRAM_URL || null,
    siteUrl: env.PUBLIC_SITE_URL || null,
  }));

  app.post('/api/upload', async (req) => {
    guard(req, 'upload', 10);
    const fields: Record<string, string> = {};
    let image: { bytes: Buffer; filename: string } | null = null;
    let banner: { bytes: Buffer } | null = null;
    for await (const part of req.parts()) {
      if (part.type === 'file') {
        const bytes = await part.toBuffer();
        if (part.fieldname === 'image') image = { bytes, filename: part.filename || 'image' };
        else if (part.fieldname === 'banner') banner = { bytes };
      } else {
        fields[part.fieldname] = String(part.value ?? '');
      }
    }
    if (!image) throw new LaunchError('Image is required.');
    const mime = sniffImage(image.bytes);
    if (!mime) throw new LaunchError('Image must be PNG, JPG, WEBP or GIF.');
    if (image.bytes.length > IMAGE_MAX_BYTES) throw new LaunchError('Image is too large.');
    let bannerMime = null;
    if (banner) {
      bannerMime = sniffImage(banner.bytes);
      if (!bannerMime) throw new LaunchError('Banner must be PNG, JPG, WEBP or GIF.');
    }
    const parsed = launchFieldsSchema.safeParse(fields);
    if (!parsed.success) throw new LaunchError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
    const f = parsed.data;
    return launcher.upload(
      {
        image: { ...image, mime },
        name: f.name,
        symbol: f.ticker,
        description: f.description,
        website: f.website,
        twitter: f.twitter,
        telegram: f.telegram,
        banner: banner && bannerMime ? { bytes: banner.bytes, mime: bannerMime } : undefined,
      },
      origin(req),
    );
  });

  app.post('/api/launch/build', async (req) => {
    guard(req, 'build', 20);
    return launcher.build(req.body);
  });

  app.post('/api/launch/send', async (req) => {
    guard(req, 'send', 20);
    const parsed = sendRequestSchema.safeParse(req.body);
    if (!parsed.success) throw new LaunchError('Invalid request.');
    return launcher.send(parsed.data);
  });

  app.get<{ Params: { id: string } }>('/api/launch/:id', async (req) => {
    const l = await store.getLaunch(req.params.id);
    if (!l) throw new LaunchError('Not found', 404, 'not_found');
    return { launch: l };
  });

  const withMarket = async (rows: Awaited<ReturnType<Store['listPublic']>>): Promise<TokenView[]> => {
    const live = rows.filter((r) => r.status === 'confirmed').map((r) => r.mint);
    const markets = live.length ? await getMarkets(env.DEXSCREENER_URL, live, fetchImpl) : new Map();
    return rows.map((r) => ({ ...r, ...(markets.get(r.mint) ?? { marketCapUsd: null, priceUsd: null, priceChange24h: null }) }));
  };

  app.get<{ Querystring: { sort?: string } }>('/api/tokens', async (req) => {
    const rows = await store.listPublic({ includeSimulated: env.DRY_RUN, limit: 200 });
    const tokens = await withMarket(rows);
    if (req.query.sort === 'mcap') tokens.sort((a, b) => (b.marketCapUsd ?? -1) - (a.marketCapUsd ?? -1));
    return { tokens };
  });

  app.get<{ Params: { mint: string } }>('/api/tokens/:mint', async (req) => {
    const l = await store.getByMint(req.params.mint);
    if (!l || !['confirmed', 'simulated', 'sent'].includes(l.status)) throw new LaunchError('Token not found', 404, 'not_found');
    const [token] = await withMarket([l]);
    return { token };
  });

  app.post('/api/waitlist', async (req) => {
    guard(req, 'waitlist', 5);
    const parsed = waitlistSchema.safeParse(req.body);
    if (!parsed.success) throw new LaunchError(parsed.error.issues[0]?.message ?? 'Invalid input');
    const r = await store.addWaitlist(parsed.data.xHandle, parsed.data.wallet);
    return { status: r, count: await store.waitlistCount() };
  });

  app.get('/api/waitlist/count', async () => ({ count: await store.waitlistCount() }));

  // dry-run local media
  const mediaDir = path.resolve(env.MEDIA_DIR);
  await app.register(fastifyStatic, { root: mediaDir, prefix: '/media/', decorateReply: false, serve: true, allowedPath: () => true });

  if (clientDir && existsSync(clientDir)) {
    await app.register(fastifyStatic, { root: clientDir, prefix: '/', wildcard: false });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith('/api/') || req.url.startsWith('/media/')) return reply.status(404).send({ error: 'Not found' });
      return reply.type('text/html').sendFile('index.html', clientDir);
    });
  }

  return app;
}
