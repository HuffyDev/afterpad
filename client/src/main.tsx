import { Buffer } from 'buffer';
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer ??= Buffer;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { SolanaProviders } from './wallet/WalletProvider';
import { ConfigProvider } from './lib/config';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider>
        <SolanaProviders>
          <App />
        </SolanaProviders>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
);
