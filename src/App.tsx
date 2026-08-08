import { ReactNode, useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ScrollNavigator from './components/ScrollNavigator';
import { SearchModal } from './components/SearchModal';
import { ThemeProvider } from './contexts/ThemeContext';
import { NewsProvider, useNews } from './contexts/NewsContext';
import { SearchHistoryProvider } from './contexts/SearchHistoryContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();
  const { setIsSearchOpen } = useNews();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Listen for global Cmd+K / Ctrl+K events to open search modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [setIsSearchOpen]);

  // Monitor scroll movements to hide/show header on mobile viewport
  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = () => {
      // Only trigger on mobile viewports (< 768px)
      if (window.innerWidth >= 768) {
        setIsHeaderVisible(prev => prev ? prev : true);
        return;
      }

      // Hide header immediately on scroll start (only update if it is currently visible)
      setIsHeaderVisible(prev => {
        if (prev) return false;
        return prev;
      });

      window.clearTimeout(scrollTimeout);

      // Show header when scrolling has stopped
      scrollTimeout = window.setTimeout(() => {
        setIsHeaderVisible(prev => {
          if (!prev) return true;
          return prev;
        });
      }, 250);
    };

    // Use capture phase (true) to capture scroll events on any nested scrollable container
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.clearTimeout(scrollTimeout);
    };
  }, [location.pathname]); // Re-run when navigation routes change

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Responsive unified Sidebar drawer / hover component */}
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto md:pl-[76px]"
      >
        {!isAuthPage && (
          <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-6">
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)} visible={isHeaderVisible} />
          </div>
        )}
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-6 max-md:pt-24 pb-24 md:pb-12">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedArticlesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
      <ScrollNavigator />
      <SearchModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NewsProvider>
            <SearchHistoryProvider>
              <Router>
                <AppContent />
              </Router>
            </SearchHistoryProvider>
          </NewsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;