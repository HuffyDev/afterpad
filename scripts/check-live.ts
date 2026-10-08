/**
 * Read-only live checks. Sends nothing, signs nothing, spends nothing.
 *   npm run check:live
 */
import { Keypair } from '@solana/web3.js';
import { loadEnv } from '../server/env.js';
import { Rpc } from '../server/services/rpc.js';
import { getMarkets } from '../server/services/dexscreener.js';
import { buildCreateBody, fetchCreateTx, inspectCreateTx } from '../server/services/pumpportal.js';

const env = loadEnv();
let failed = 0;
const ok = (m: string) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m: string) => (failed++, console.log(`  \x1b[31m✗\x1b[0m ${m}`));
const step = async (name: string, fn: () => Promise<void>) => {
  console.log(`\n${name}`);
  try {
    await fn();
  } catch (e) {
    bad((e as Error).message + ((e as { body?: string }).body ? ` — ${(e as { body?: string }).body}` : ''));
  }
};

console.log(`AFTER PAD live check · DRY_RUN=${env.DRY_RUN}`);

await step('Helius RPC', async () => {
  if (!env.HELIUS_RPC_URL) return bad('HELIUS_RPC_URL not set');
  const rpc = new Rpc(env.HELIUS_RPC_URL);
  ok(`getHealth: ${await rpc.call<string>('getHealth')}`);
  ok(`slot ${await rpc.call<number>('getSlot')}`);
});

await step('PumpPortal trade-local (create shape probe, unsigned — never sent)', async () => {
  // Uses a throwaway keypair as "creator"; it has no SOL, so the tx could never land even if sent.
  const creator = Keypair.generate();
  const mint = Keypair.generate();
  const body = buildCreateBody({
    launchId: '00000000-0000-4000-8000-000000000000',
    creator: creator.publicKey.toBase58(),
    mint: mint.publicKey.toBase58(),
    metadataUri: 'https://ipfs.io/ipfs/bafkreiaftercheckprobe',
    fields: { name: 'Check', ticker: 'CHECK', description: '' },
    trade: { devBuySol: 0, slippagePct: 10, priorityFeeSol: 0.0001 },
  });
  const bytes = await fetchCreateTx(env.PUMPPORTAL_URL, body);
  const r = inspectCreateTx(bytes, { creator: body.publicKey, mint: body.mint });
  ok(`returned a ${bytes.length}-byte v0 tx, ${r.instructions} instructions, signers = creator + mint`);
});

await step('pump.fun IPFS endpoint (reachability only, no upload)', async () => {
  const res = await fetch(env.PUMP_IPFS_URL, { method: 'OPTIONS' }).catch((e) => {
    throw new Error(`unreachable: ${e.message}`);
  });
  res.status < 500 ? ok(`reachable (HTTP ${res.status})`) : bad(`HTTP ${res.status}`);
  if (!env.PINATA_JWT) console.log('    (PINATA_JWT not set — no fallback if pump.fun IPFS rejects uploads)');
});

await step('DexScreener', async () => {
  const mint = env.AFTER_MINT;
  const m = await getMarkets(env.DEXSCREENER_URL, [mint]);
  const d = m.get(mint);
  d?.marketCapUsd != null ? ok(`$AFTER mcap $${Math.round(d.marketCapUsd).toLocaleString()}`) : bad(`no market data for ${mint} (new coin, or API unreachable)`);
});

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
