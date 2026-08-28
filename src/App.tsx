import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import FamilyPage from './pages/FamilyPage';
import GalleryPage from './pages/GalleryPage';
import EventsPage from './pages/EventsPage';
import StoriesPage from './pages/StoriesPage';
import SignInPage from './pages/SignInPage';
import RequestAccessPage from './pages/RequestAccessPage';
import PortalPage from './pages/PortalPage';

export default function App() {
  const { currentPage, initAuth } = useStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;

      case 'family':
        return <FamilyPage />;

      case 'gallery':
        return <GalleryPage />;

      case 'events':
        return <EventsPage />;

      case 'stories':
        return <StoriesPage />;

      case 'signin':
        return <SignInPage />;

      case 'request-access':
        return <RequestAccessPage />;

      case 'portal':
        return <PortalPage />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {renderPage()}
      </main>
    </div>
  );
}