import { short } from './format';

const loadImg = (src: string) =>
  new Promise<HTMLImageElement | null>((res) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });

/** 1200×675 share card, rendered client-side. */
export async function renderCard(d: { name: string; ticker: string; mint: string; image?: string | null; simulated?: boolean }): Promise<Blob> {
  await document.fonts?.ready;
  const W = 1200;
  const H = 675;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#0b0a09';
  x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(860, 300, 20, 860, 300, 620);
  g.addColorStop(0, 'rgba(243,166,73,0.30)');
  g.addColorStop(0.5, 'rgba(243,166,73,0.06)');
  g.addColorStop(1, 'rgba(243,166,73,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.fillStyle = 'rgba(255,255,255,0.02)';
  for (let y = 0; y < H; y += 3) x.fillRect(0, y, W, 1);

  // image
  const img = d.image ? await loadImg(d.image) : null;
  const S = 360;
  const ix = W - 80 - S;
  const iy = (H - S) / 2;
  x.save();
  x.shadowColor = 'rgba(243,166,73,0.45)';
  x.shadowBlur = 80;
  x.fillStyle = '#151311';
  roundRect(x, ix, iy, S, S, 28);
  x.fill();
  x.restore();
  x.save();
  roundRect(x, ix, iy, S, S, 28);
  x.clip();
  if (img) x.drawImage(img, ix, iy, S, S);
  x.restore();
  x.strokeStyle = 'rgba(243,166,73,0.5)';
  x.lineWidth = 2;
  roundRect(x, ix, iy, S, S, 28);
  x.stroke();

  // text
  x.fillStyle = '#8a8379';
  x.font = '500 20px "JetBrains Mono", monospace';
  x.fillText(d.simulated ? 'AFTER·PAD  //  DRY RUN' : 'AFTER·PAD  //  JUST LAUNCHED', 80, 110);
  x.fillStyle = '#efe9df';
  x.font = '700 76px "Inter Tight", sans-serif';
  wrap(x, d.name, 80, 220, 600, 82, 2);
  x.fillStyle = '#f3a649';
  x.font = '600 44px "JetBrains Mono", monospace';
  x.fillText(`$${d.ticker}`, 80, 400);
  x.fillStyle = '#5a544c';
  x.font = '400 20px "JetBrains Mono", monospace';
  x.fillText(`CA ${short(d.mint, 10)}`, 80, 460);
  x.fillStyle = '#b3ab9f';
  x.font = '500 26px "Inter Tight", sans-serif';
  x.fillText('the dev leaves. the AI stays.', 80, 590);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('render failed'))), 'image/png'));
}

function roundRect(x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(X + r, Y);
  x.arcTo(X + w, Y, X + w, Y + h, r);
  x.arcTo(X + w, Y + h, X, Y + h, r);
  x.arcTo(X, Y + h, X, Y, r);
  x.arcTo(X, Y, X + w, Y, r);
  x.closePath();
}

function wrap(x: CanvasRenderingContext2D, text: string, X: number, Y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(/\s+/);
  let line = '';
  let n = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (x.measureText(test).width > maxW && line) {
      if (++n >= maxLines) {
        x.fillText(line + '…', X, Y);
        return;
      }
      x.fillText(line, X, Y);
      line = words[i];
      Y += lh;
    } else line = test;
  }
  x.fillText(line, X, Y);
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
