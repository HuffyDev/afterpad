import type { LaunchRecord, PublicConfig, TokenView } from '../../../shared/launch';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError('Network error — check your connection.', 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? `Request failed (${res.status})`, res.status, body.code);
  return body as T;
}

const json = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export interface UploadResponse {
  metadataUri: string;
  imageUri: string | null;
  bannerUri: string | null;
  provider: 'pump' | 'pinata' | 'local';
  warnings: string[];
}
export type BuildResponse =
  | { mode: 'tx'; tx: string; launch: LaunchRecord }
  | { mode: 'mock'; message: string; reason: string; launch: LaunchRecord };
export interface SendResponse {
  launch: LaunchRecord;
  simulation?: { logs: string[]; unitsConsumed: number | null; skipped?: string };
  error?: string;
}

export const api = {
  config: () => req<PublicConfig>('/api/config'),
  upload: (form: FormData) => req<UploadResponse>('/api/upload', { method: 'POST', body: form }),
  build: (body: unknown) => req<BuildResponse>('/api/launch/build', json(body)),
  send: (body: unknown) => req<SendResponse>('/api/launch/send', json(body)),
  launch: (id: string) => req<{ launch: LaunchRecord }>(`/api/launch/${id}`),
  tokens: (sort: 'new' | 'mcap') => req<{ tokens: TokenView[] }>(`/api/tokens?sort=${sort}`),
  token: (mint: string) => req<{ token: TokenView }>(`/api/tokens/${mint}`),
  waitlist: (xHandle: string, wallet: string) => req<{ status: 'added' | 'exists'; count: number }>('/api/waitlist', json({ xHandle, wallet })),
  waitlistCount: () => req<{ count: number }>('/api/waitlist/count'),
};
