# AFTER PAD — setup

Non-custodial pump.fun launchpad. Users sign in their own wallet; the server never sees a private key
(the mint keypair is generated in the browser too).

## Run on Replit

1. Import the repo. `.replit` already sets `npm run build && npm start`, Node 22, port 5000 → 80, VM deployment.
2. Add a Postgres database (Replit sets `DATABASE_URL`). Migrations run automatically on boot.
3. Add the secrets below in the **Secrets** tab.
4. Drop your images into `client/public/`:
   - `logo.png` — nav logo + apple-touch icon (the favicon is `favicon.svg`, a vector redraw of the logo)
   - `banner.jpg` — homepage hero background (hidden automatically if missing)
5. Run `npm run check:live` and make sure every check passes **before** setting `DRY_RUN=false`.

## Environment variables

| Var | Required | Default | What it does |
|---|---|---|---|
| `DATABASE_URL` | recommended | — | Postgres. Without it an in-memory store is used (data lost on restart). |
| `HELIUS_RPC_URL` | for live | — | Helius RPC URL incl. API key. Used to simulate (dry run) and send (live). Never exposed to the browser. |
| `DRY_RUN` | no | `true` | `true`: build + simulate, never broadcast. Only the literal `false`/`0`/`off`/`no` turns it off. |
| `MOCK_FALLBACK` | no | `true` | In dry run only: if PumpPortal/IPFS/RPC are unreachable, run a local mock (wallet signs a message, no tx). Ignored when `DRY_RUN=false`. |
| `AFTER_MINT` | no | `EzKfAPBJDBEMpwcgqVzGyAcVvtoRK8sNNvBHoXkSpump` | $AFTER contract address shown on the site. |
| `AFTER_X_URL` | no | — | Official X link (footer, $AFTER section). |
| `AFTER_TELEGRAM_URL` | no | — | Official Telegram link. |
| `PUBLIC_SITE_URL` | no | request origin | Canonical URL used in share links and dry-run media URLs. |
| `PINATA_JWT` | no | — | Fallback IPFS upload if pump.fun's IPFS endpoint rejects uploads. |
| `PORT` | no | `5000` | HTTP port. |
| `PUMPPORTAL_URL` | no | `https://pumpportal.fun/api/trade-local` | Override for testing. |
| `PUMP_IPFS_URL` | no | `https://pump.fun/api/ipfs` | Override for testing. |
| `DEXSCREENER_URL` | no | `https://api.dexscreener.com` | Override for testing. |
| `MEDIA_DIR` | no | `./data/media` | Where banners and dry-run media are stored. |

## Scripts

- `npm run dev` — API (tsx watch, :5000) + Vite (:5173, proxies `/api`)
- `npm run build && npm start` — production
- `npm test` — unit tests (tx building with fixtures, launch flow, validation). Set `TEST_DATABASE_URL` to also test migrations against Postgres.
- `npm run check:live` — read-only checks of Helius, PumpPortal (unsigned create probe), pump.fun IPFS, DexScreener
- `npm run db:generate` — new Drizzle migration after editing `server/db/schema.ts`

## Going live checklist

- [ ] `npm run check:live` all green (PumpPortal's create shape has changed before — if it fails, don't go live)
- [ ] One real launch with `DRY_RUN=true` on mainnet RPC: simulation passes
- [ ] Set `DRY_RUN=false`, launch one coin yourself with a 0 dev buy, verify on pump.fun/Solscan
- [ ] `AFTER_X_URL` set, `PUBLIC_SITE_URL` set

## Known limits (v1)

- Cost summary: pump.fun trade fee and rent are estimates (marked `*`).
- pump.fun metadata has no banner field; banners only show on AfterPad pages.
- After Mode is not built. The UI only shows it as COMING SOON + waitlist.
