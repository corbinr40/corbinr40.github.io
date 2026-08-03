import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import Contact from './pages/Contact';
import ContentPage from './pages/ContentPage';
import BlogList from './pages/BlogList';
import RssPage from './pages/RssPage';

// Dev-only: import.meta.env.DEV is statically false in prod builds, so the
// dynamic import is dead code and Rollup drops the Editor + jszip chunks.
const Editor = import.meta.env.DEV ? lazy(() => import('./pages/Editor')) : null;

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects/:category/:slug" element={<ContentPage />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<ContentPage />} />
        <Route path="/rss" element={<RssPage />} />
        {Editor && (
          <Route
            path="/editor"
            element={
              <Suspense fallback={
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              }>
                <Editor />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
