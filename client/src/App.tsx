import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import { Spinner } from './components/Icon';

const Launch = lazy(() => import('./pages/Launch'));
const Success = lazy(() => import('./pages/Success'));
const Feed = lazy(() => import('./pages/Feed'));
const Token = lazy(() => import('./pages/Token'));
const AfterMode = lazy(() => import('./pages/AfterMode'));
const AfterTokenPage = lazy(() => import('./pages/AfterTokenPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="grid min-h-[50vh] place-items-center text-glow">
            <Spinner size={18} />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/launch" element={<Launch />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/token/:mint" element={<Token />} />
          <Route path="/after-mode" element={<AfterMode />} />
          <Route path="/after" element={<AfterTokenPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
