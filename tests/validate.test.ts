import { describe, expect, it } from 'vitest';
import { launchFieldsSchema, tickerSchema, tradeParamsSchema, waitlistSchema } from '../shared/launch.js';
import { estimateCost } from '../shared/fees.js';
import { sniffImage } from '../server/lib/image.js';
import { loadEnv } from '../server/env.js';

describe('validation', () => {
  it('tickers', () => {
    expect(tickerSchema.parse(' after ')).toBe('AFTER');
    expect(tickerSchema.safeParse('$AFTER').success).toBe(false);
    expect(tickerSchema.safeParse('ABCDEFGHIJK').success).toBe(false);
    expect(tickerSchema.safeParse('').success).toBe(false);
  });
  it('links', () => {
    const ok = launchFieldsSchema.safeParse({ name: 'x', ticker: 'X', twitter: 'https://twitter.com/a', telegram: 'https://t.me/a', website: '' });
    expect(ok.success && ok.data.website).toBe(undefined);
    expect(launchFieldsSchema.safeParse({ name: 'x', ticker: 'X', twitter: 'https://evil.com/a' }).success).toBe(false);
    expect(launchFieldsSchema.safeParse({ name: 'x', ticker: 'X', website: 'javascript:alert(1)' }).success).toBe(false);
  });
  it('trade params allow a 0 dev buy', () => {
    expect(tradeParamsSchema.safeParse({ devBuySol: 0, slippagePct: 10, priorityFeeSol: 0.0005 }).success).toBe(true);
    expect(tradeParamsSchema.safeParse({ devBuySol: -1, slippagePct: 10, priorityFeeSol: 0 }).success).toBe(false);
  });
  it('waitlist normalizes handles', () => {
    const w = waitlistSchema.parse({ xHandle: 'https://x.com/after_pad', wallet: '11111111111111111111111111111111' });
    expect(w.xHandle).toBe('after_pad');
    expect(waitlistSchema.safeParse({ xHandle: '@a b', wallet: '11111111111111111111111111111111' }).success).toBe(false);
  });
  it('cost summary has no platform fee', () => {
    const c = estimateCost({ devBuySol: 1, priorityFeeSol: 0.001 });
    expect(c.platformFee).toBe(0);
    expect(c.total).toBeGreaterThan(1.001);
  });
  it('sniffs images by magic bytes', () => {
    expect(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('image/png');
    expect(sniffImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe(null);
  });
  it('DRY_RUN defaults on', () => {
    expect(loadEnv({}).DRY_RUN).toBe(true);
    expect(loadEnv({ DRY_RUN: 'false' }).DRY_RUN).toBe(false);
    expect(loadEnv({ DRY_RUN: 'nope' }).DRY_RUN).toBe(true);
  });
});
