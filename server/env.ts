import { z } from 'zod';

const bool = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? def : !['false', '0', 'off', 'no'].includes(v.toLowerCase())));

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().default(5000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().optional(),
  HELIUS_RPC_URL: z.string().optional(),
  /** Build + simulate only, never broadcast. ON unless explicitly "false". */
  DRY_RUN: bool(true),
  /**
   * In DRY_RUN, fall back to a fully local mock launch (wallet signs a message,
   * no transaction) when PumpPortal / IPFS / RPC are unreachable. Ignored when DRY_RUN=false.
   */
  MOCK_FALLBACK: bool(true),
  AFTER_MINT: z.string().optional(),
  AFTER_X_URL: z.string().optional(),
  AFTER_TELEGRAM_URL: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  PUBLIC_SITE_URL: z.string().optional(),
  PUMPPORTAL_URL: z.string().default('https://pumpportal.fun/api/trade-local'),
  PUMP_IPFS_URL: z.string().default('https://pump.fun/api/ipfs'),
  DEXSCREENER_URL: z.string().default('https://api.dexscreener.com'),
  MEDIA_DIR: z.string().default('./data/media'),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    throw new Error('Invalid environment: ' + parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  }
  return parsed.data;
}

/** mock mode is only ever possible while DRY_RUN is on */
export const mockAllowed = (env: Env) => env.DRY_RUN && env.MOCK_FALLBACK;
