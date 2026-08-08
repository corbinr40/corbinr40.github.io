import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import BackToTop from './BackToTop';
import PageTransition from './PageTransition';
import ErrorBoundary from './ErrorBoundary';

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <ErrorBoundary>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </ErrorBoundary>
      <Footer />
      <BackToTop />
    </>
  );
}
