import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  DESC_MAX,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  NAME_MAX,
  PRIORITY_PRESETS,
  TICKER_MAX,
  launchFieldsSchema,
  tradeParamsSchema,
  type PriorityPreset,
} from '../../../shared/launch';
import { estimateCost, formatSol } from '../../../shared/fees';
import { TokenCard } from '../components/TokenCard';
import { ImageCropper } from '../components/ImageCropper';
import { Icon } from '../components/Icon';
import { SoonBadge } from '../components/bits';
import { LaunchProgress } from '../components/LaunchProgress';
import { useWalletModal } from '../wallet/WalletModal';
import { useLaunch, type LaunchInput } from '../lib/launch';
import { useConfig } from '../lib/config';

const DRAFT_KEY = 'afterpad:draft:v1';
const RAW_MAX_BYTES = 15 * 1024 * 1024;

interface Img {
  blob: Blob;
  url: string;
  name: string;
}

type Form = {
  name: string;
  ticker: string;
  description: string;
  website: string;
  twitter: string;
  telegram: string;
  devBuy: string;
  slippage: string;
  priority: PriorityPreset;
  customPriority: string;
};

const emptyForm: Form = { name: '', ticker: '', description: '', website: '', twitter: '', telegram: '', devBuy: '0', slippage: '10', priority: 'med', customPriority: '0.001' };

function loadDraft(): Form {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    return d ? { ...emptyForm, ...d } : emptyForm;
  } catch {
    return emptyForm;
  }
}

let imgSeq = 0;

export default function LaunchPage() {
  const [f, setF] = useState<Form>(loadDraft);
  const [image, setImage] = useState<(Img & { id: number }) | null>(null);
  const [banner, setBanner] = useState<(Img & { id: number }) | null>(null);
  const [crop, setCrop] = useState<{ file: File; kind: 'image' | 'banner' } | null>(null);
  const [imgError, setImgError] = useState<{ image?: string; banner?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const { publicKey } = useWallet();
  const { open: openWallet } = useWalletModal();
  const { dryRun } = useConfig();
  const { state, run, reset, busy } = useLaunch();
  const navigate = useNavigate();

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
    } catch {
      /* private mode */
    }
  }, [f]);

  const priorityFeeSol = f.priority === 'custom' ? parseFloat(f.customPriority) || 0 : PRIORITY_PRESETS[f.priority];
  const devBuySol = parseFloat(f.devBuy) || 0;
  const slippagePct = parseFloat(f.slippage) || 0;

  const fields = launchFieldsSchema.safeParse({
    name: f.name,
    ticker: f.ticker,
    description: f.description,
    website: f.website,
    twitter: f.twitter,
    telegram: f.telegram,
  });
  const trade = tradeParamsSchema.safeParse({ devBuySol, slippagePct, priorityFeeSol });
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!fields.success) for (const i of fields.error.issues) e[String(i.path[0])] ??= i.message;
    if (!trade.success) for (const i of trade.error.issues) e[String(i.path[0])] ??= i.message;
    if (f.devBuy.trim() === '' || Number.isNaN(Number(f.devBuy))) e.devBuySol = 'enter an amount (0 is fine)';
    if (!image) e.image = 'image required';
    return e;
  }, [fields, trade, image, f.devBuy]);
  const valid = Object.keys(errors).length === 0;
  const cost = estimateCost({ devBuySol, priorityFeeSol });

  const formKey = JSON.stringify([f.name, f.ticker, f.description, f.website, f.twitter, f.telegram, f.devBuy, f.slippage, priorityFeeSol, image?.id, banner?.id]);

  const pickFile = (kind: 'image' | 'banner') => (file: File | undefined) => {
    if (!file) return;
    const err = (m: string) => setImgError((p) => ({ ...p, [kind]: m }));
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) return err('Use PNG, JPG, WEBP or GIF.');
    if (file.size > RAW_MAX_BYTES) return err('File is over 15 MB.');
    setImgError((p) => ({ ...p, [kind]: undefined }));
    if (file.type === 'image/gif') {
      // cropping would flatten the animation; take GIFs as-is
      if (file.size > IMAGE_MAX_BYTES) return err('GIFs must be under 4 MB (they are not re-encoded).');
      const v = { blob: file, url: URL.createObjectURL(file), name: file.name, id: ++imgSeq };
      return kind === 'image' ? setImage(v) : setBanner(v);
    }
    setCrop({ file, kind });
  };

  const submit = () => {
    setSubmitted(true);
    if (!publicKey) return openWallet();
    if (!valid || busy || !fields.success || !trade.success || !image) {
      document.querySelector('[data-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const input: LaunchInput = {
      formKey,
      fields: fields.data,
      trade: trade.data,
      image: { blob: image.blob, name: image.name },
      banner: banner ? { blob: banner.blob, name: banner.name } : null,
    };
    setShowProgress(true);
    run(input);
  };

  useEffect(() => {
    if (state.status === 'done' && state.result) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      const t = setTimeout(() => navigate(`/success/${state.result!.launch.launchId}`), 900);
      return () => clearTimeout(t);
    }
  }, [state.status, state.result, navigate]);

  const err = (k: string) => (submitted ? errors[k] : undefined);
  const live = (k: string, raw: string) => (raw ? errors[k] : undefined) ?? err(k);

  const ctaLabel = !publicKey ? 'Connect wallet to launch' : busy ? 'Launching…' : dryRun ? 'Launch (dry run)' : 'Launch coin';

  return (
    <div className="pb-28 lg:pb-0">
      {/* header */}
      <section className="border-b border-ink-700/60">
        <div className="wrap flex flex-col gap-4 py-10 sm:py-14 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow flex items-center gap-2">
              <span className="text-glow">//</span> launch center
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tightest sm:text-5xl">
              Make the coin. <span className="text-ink-400">Then go.</span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-400">
              Everything is signed in your own wallet. We build the transaction, you approve it, it lands on pump.fun. No platform fee.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="badge"><Icon name="lock" size={11} /> non-custodial</span>
            <span className="badge">0% platform fee</span>
            <span className="badge">pump.fun</span>
          </div>
        </div>
      </section>

      <div className="wrap grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        {/* ── form ── */}
        <div className="order-2 space-y-12 lg:order-1">
          <Block n="01" title="Identity" sub="What people see first.">
            <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
              <Field label="Name" count={`${f.name.length}/${NAME_MAX}`} error={live('name', f.name)}>
                <input className="field" value={f.name} maxLength={NAME_MAX} onChange={(e) => set('name', e.target.value)} placeholder="Empty Desk" autoComplete="off" />
              </Field>
              <Field label="Ticker" count={`${f.ticker.length}/${TICKER_MAX}`} error={live('ticker', f.ticker)}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-glow">$</span>
                  <input
                    className="field-mono pl-7 uppercase"
                    value={f.ticker}
                    maxLength={TICKER_MAX}
                    onChange={(e) => set('ticker', e.target.value.replace(/^\$/, '').toUpperCase())}
                    placeholder="DESK"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                  />
                </div>
              </Field>
            </div>
            <Field label="Description" count={`${f.description.length}/${DESC_MAX}`} error={live('description', f.description)} className="mt-5">
              <textarea
                className="field min-h-[112px] resize-y leading-relaxed"
                value={f.description}
                maxLength={DESC_MAX}
                onChange={(e) => set('description', e.target.value)}
                placeholder="the dev left at 3am. the monitor is still on."
              />
            </Field>
          </Block>

          <Block n="02" title="Image" sub="Square, cropped here. Optional wide banner for AfterPad pages.">
            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
              <div data-invalid={!!err('image')}>
                <div className="label">
                  <span>Token image</span>
                  <span className="normal-case tracking-normal text-ink-500">1:1</span>
                </div>
                <Drop
                  aspect="square"
                  url={image?.url}
                  onFile={pickFile('image')}
                  onClear={() => setImage(null)}
                  error={imgError.image ?? err('image')}
                  hint="PNG · JPG · WEBP · GIF"
                />
              </div>
              <div>
                <div className="label">
                  <span>Banner <span className="text-ink-500">· optional</span></span>
                  <span className="normal-case tracking-normal text-ink-500">3:1</span>
                </div>
                <Drop aspect="wide" url={banner?.url} onFile={pickFile('banner')} onClear={() => setBanner(null)} error={imgError.banner} hint="1500 × 500 recommended" />
              </div>
            </div>
          </Block>

          <Block n="03" title="Links" sub="All optional. Shown on pump.fun and here.">
            <div className="grid gap-4 sm:grid-cols-3">
              <LinkField icon="globe" label="Website" value={f.website} onChange={(v) => set('website', v)} placeholder="https://" error={live('website', f.website)} />
              <LinkField icon="xlogo" label="X" value={f.twitter} onChange={(v) => set('twitter', v)} placeholder="https://x.com/…" error={live('twitter', f.twitter)} />
              <LinkField icon="telegram" label="Telegram" value={f.telegram} onChange={(v) => set('telegram', v)} placeholder="https://t.me/…" error={live('telegram', f.telegram)} />
            </div>
          </Block>

          <Block n="04" title="Launch settings" sub="Your first buy happens in the same transaction as the create.">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Dev buy" error={live('devBuySol', f.devBuy)}>
                <div className="relative">
                  <input className="field-mono pr-14" inputMode="decimal" value={f.devBuy} onChange={(e) => set('devBuy', e.target.value.replace(',', '.'))} placeholder="0" />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400">SOL</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['0', '0.1', '0.5', '1', '2'].map((v) => (
                    <Chip key={v} active={f.devBuy === v} onClick={() => set('devBuy', v)}>
                      {v === '0' ? 'none' : `${v}`}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Slippage" error={live('slippagePct', f.slippage)}>
                <div className="relative">
                  <input className="field-mono pr-10" inputMode="decimal" value={f.slippage} onChange={(e) => set('slippage', e.target.value.replace(',', '.'))} />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400">%</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['5', '10', '15', '25'].map((v) => (
                    <Chip key={v} active={f.slippage === v} onClick={() => set('slippage', v)}>
                      {v}%
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
            <div className="mt-6">
              <div className="label">
                <span>Priority fee</span>
                <span className="num normal-case tracking-normal text-ink-300">{formatSol(priorityFeeSol)} SOL</span>
              </div>
              <div className="grid grid-cols-4 gap-1 rounded-lg border border-ink-700 bg-ink-900 p-1">
                {(['low', 'med', 'high', 'custom'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('priority', p)}
                    className={`rounded-md px-2 py-2 text-center transition ${f.priority === p ? 'bg-ink-750 text-ink-100 shadow-[inset_0_0_0_1px_#34302a]' : 'text-ink-400 hover:text-ink-200'}`}
                  >
                    <div className="text-sm font-medium capitalize">{p}</div>
                    <div className="num text-[10.5px] text-ink-500">{p === 'custom' ? 'set' : formatSol(PRIORITY_PRESETS[p])}</div>
                  </button>
                ))}
              </div>
              {f.priority === 'custom' && (
                <Field label="" error={live('priorityFeeSol', f.customPriority)} className="mt-3">
                  <div className="relative">
                    <input className="field-mono pr-14" inputMode="decimal" value={f.customPriority} onChange={(e) => set('customPriority', e.target.value.replace(',', '.'))} autoFocus />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-400">SOL</span>
                  </div>
                </Field>
              )}
            </div>
          </Block>

          <Block n="05" title="After Mode" sub="Hand the coin to the AI once you leave.">
            <AfterModeToggle />
          </Block>
        </div>

        {/* ── preview + summary ── */}
        <aside className="order-1 lg:order-2">
          <div className="space-y-5 lg:sticky lg:top-20">
            <div>
              <div className="eyebrow mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon name="eye" size={12} /> live preview
                </span>
                <span className="text-ink-500">updates as you type</span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[40px] bg-glow/10 blur-3xl" />
                <TokenCard
                  preview
                  d={{
                    name: f.name,
                    ticker: f.ticker,
                    description: f.description,
                    image: image?.url,
                    banner: banner?.url,
                    website: fields.success ? fields.data.website : null,
                    twitter: fields.success ? fields.data.twitter : null,
                    telegram: fields.success ? fields.data.telegram : null,
                    creator: publicKey?.toBase58(),
                    devBuySol,
                  }}
                />
              </div>
            </div>

            <CostSummary cost={cost} />

            <div className="hidden lg:block">
              <LaunchButton label={ctaLabel} onClick={submit} disabled={busy} invalid={submitted && !valid} />
              <FinePrint dryRun={dryRun} />
            </div>
          </div>
        </aside>
      </div>

      {/* mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-700 bg-ink-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="wrap flex items-center gap-3 py-3">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-500">est. total</div>
            <div className="num text-lg text-ink-100">
              ≈ {formatSol(cost.total, 4)} <span className="text-xs text-ink-400">SOL</span>
            </div>
          </div>
          <button className="btn-glow ml-auto flex-1 py-3 text-[15px]" onClick={submit} disabled={busy}>
            {ctaLabel}
          </button>
        </div>
      </div>

      {crop && (
        <ImageCropper
          file={crop.file}
          aspect={crop.kind === 'image' ? 1 : 3}
          outWidth={crop.kind === 'image' ? 1000 : 1500}
          title={crop.kind === 'image' ? 'Crop token image' : 'Crop banner'}
          onCancel={() => setCrop(null)}
          onDone={(blob, url) => {
            const ext = blob.type === 'image/png' ? 'png' : 'jpg';
            const v = { blob, url, name: `${crop.kind}.${ext}`, id: ++imgSeq };
            if (blob.size > IMAGE_MAX_BYTES) setImgError((p) => ({ ...p, [crop.kind]: 'Cropped image is over 4 MB — try a smaller source.' }));
            else crop.kind === 'image' ? setImage(v) : setBanner(v);
            setCrop(null);
          }}
        />
      )}

      {showProgress && (
        <LaunchProgress
          state={state}
          dryRun={dryRun}
          onRetry={submit}
          onClose={() => {
            if (busy) return;
            setShowProgress(false);
            reset();
          }}
        />
      )}
    </div>
  );
}

/* ───────── pieces ───────── */

function Block({ n, title, sub, children }: { n: string; title: string; sub: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-baseline gap-4 border-b border-ink-700/70 pb-3">
        <span className="font-mono text-xs text-glow">{n}</span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-ink-500">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, count, error, children, className = '' }: { label: string; count?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`} data-invalid={!!error}>
      {label && (
        <span className="label">
          <span>{label}</span>
          {count && <span className="num normal-case tracking-normal text-ink-500">{count}</span>}
        </span>
      )}
      <span className={error ? '[&_.field]:border-bad/60 [&_.field-mono]:border-bad/60' : ''}>{children}</span>
      {error && <span className="mt-1.5 block text-xs text-bad">{error}</span>}
    </label>
  );
}

function LinkField({ icon, label, value, onChange, placeholder, error }: { icon: 'globe' | 'xlogo' | 'telegram'; label: string; value: string; onChange: (v: string) => void; placeholder: string; error?: string }) {
  return (
    <Field label={label} error={error}>
      <div className="relative">
        <Icon name={icon} size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input className="field pl-9 text-sm" value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder={placeholder} inputMode="url" autoComplete="off" spellCheck={false} />
      </div>
    </Field>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`num rounded-md border px-2.5 py-1 text-xs transition ${active ? 'border-glow/60 bg-glow/10 text-glow' : 'border-ink-700 text-ink-400 hover:border-ink-600 hover:text-ink-200'}`}
    >
      {children}
    </button>
  );
}

function Drop({ aspect, url, onFile, onClear, error, hint }: { aspect: 'square' | 'wide'; url?: string; onFile: (f?: File) => void; onClear: () => void; error?: string; hint: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onFile(e.dataTransfer.files[0]);
        }}
        className={`group relative w-full cursor-pointer overflow-hidden rounded-xl border border-dashed transition ${
          aspect === 'square' ? 'aspect-square' : 'aspect-[3/1] sm:h-[180px] sm:aspect-auto'
        } ${over ? 'border-glow bg-glow/5' : error ? 'border-bad/60 bg-bad/5' : 'border-ink-600 bg-ink-900 hover:border-ink-500'}`}
      >
        {url ? (
          <>
            <img src={url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <span className="rounded-md bg-ink-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-200">replace</span>
              <button
                type="button"
                className="rounded-md bg-ink-900/80 p-1.5 text-ink-200 hover:text-bad"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                aria-label="Remove image"
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-ink-700 bg-ink-850 text-ink-400 transition group-hover:text-glow">
              <Icon name="upload" />
            </span>
            <span className="text-sm text-ink-300">Drop or tap to upload</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">{hint}</span>
          </div>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {error && <p className="mt-1.5 text-xs text-bad">{error}</p>}
    </div>
  );
}

function CostSummary({ cost }: { cost: ReturnType<typeof estimateCost> }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
        <span className="eyebrow">cost before signing</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">* estimate</span>
      </div>
      <dl className="divide-y divide-ink-700/60 px-4 text-sm">
        {cost.lines.map((l) => (
          <div key={l.label} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="min-w-0">
              <div className="text-ink-200">
                {l.label}
                {l.estimate && <span className="text-ink-500">*</span>}
              </div>
              {l.hint && <div className="truncate text-[11.5px] text-ink-500">{l.hint}</div>}
            </dt>
            <dd className="num shrink-0 text-ink-200">{formatSol(l.sol)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5">
          <dt className="text-ink-200">Platform fee</dt>
          <dd className="num text-glow">0</dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between border-t border-ink-700 bg-ink-900/60 px-4 py-3.5">
        <span className="text-sm font-medium text-ink-100">Total ≈</span>
        <span className="num text-xl text-ink-100">
          {formatSol(cost.total, 5)} <span className="text-xs text-ink-400">SOL</span>
        </span>
      </div>
    </div>
  );
}

function LaunchButton({ label, onClick, disabled, invalid }: { label: string; onClick: () => void; disabled: boolean; invalid: boolean }) {
  return (
    <>
      <button className="btn-glow w-full py-3.5 text-[15px]" onClick={onClick} disabled={disabled}>
        <Icon name="bolt" />
        {label}
      </button>
      {invalid && <p className="mt-2 text-center text-xs text-bad">Fix the highlighted fields first.</p>}
    </>
  );
}

function FinePrint({ dryRun }: { dryRun: boolean }) {
  return (
    <p className="mt-3 text-center text-[11.5px] leading-relaxed text-ink-500">
      {dryRun ? 'Dry run is on: the transaction is built and simulated, never broadcast.' : 'Your wallet will ask you to approve one transaction.'} You launch at your own risk.
    </p>
  );
}

function AfterModeToggle() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-700 bg-ink-900 p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-56 rounded-full bg-glow/10 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold tracking-[0.12em] text-ink-100">AFTER MODE</span>
            <SoonBadge />
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-400">Hand this coin to the AI: it runs X, replies, the site, announcements and guarded buybacks after you leave.</p>
          <p className="mt-2 text-xs text-ink-500">Not available yet. Coins launched today will not be enrolled automatically.</p>
          <Link to="/after-mode#waitlist" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-glow hover:text-glow-hot">
            Join the waitlist <Icon name="arrow" size={14} />
          </Link>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={false}
          aria-disabled
          disabled
          title="Coming soon"
          className="relative mt-1 h-6 w-11 shrink-0 cursor-not-allowed rounded-full border border-ink-600 bg-ink-800 opacity-60"
        >
          <span className="absolute left-0.5 top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-ink-600">
            <Icon name="lock" size={10} className="text-ink-300" />
          </span>
        </button>
      </div>
    </div>
  );
}
