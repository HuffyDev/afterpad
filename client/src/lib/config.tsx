import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicConfig } from '../../../shared/launch';
import { api } from './api';

const fallback: PublicConfig = { dryRun: true, mockMode: true, afterMint: 'EzKfAPBJDBEMpwcgqVzGyAcVvtoRK8sNNvBHoXkSpump', afterX: null, afterTelegram: null, siteUrl: null };
const Ctx = createContext<PublicConfig>(fallback);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfg] = useState(fallback);
  useEffect(() => {
    api.config().then(setCfg).catch(() => {});
  }, []);
  return <Ctx.Provider value={cfg}>{children}</Ctx.Provider>;
}

export const useConfig = () => useContext(Ctx);
