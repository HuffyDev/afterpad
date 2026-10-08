import { AfterToken } from '../components/AfterToken';
import { Icon } from '../components/Icon';

export default function AfterTokenPage() {
  return (
    <div className="wrap py-12 sm:py-16">
      <div className="eyebrow flex items-center gap-2">
        <span className="text-glow">//</span> $after
      </div>
      <h1 className="mb-10 mt-3 text-4xl font-semibold tracking-tightest sm:text-5xl">The token behind the pad.</h1>
      <AfterToken />
      <div className="mt-8 flex gap-3 rounded-xl border border-ink-700 bg-ink-850 p-4 text-sm leading-relaxed text-ink-400">
        <Icon name="alert" className="mt-0.5 shrink-0 text-glow" />
        Only trust the contract address shown on this page and on our official X. Anyone DMing you a “new CA” or offering a presale is a scammer. Not financial advice.
      </div>
    </div>
  );
}
