import { ReactNode, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
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
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if profile is not completed
  const hasCompletedOnboarding = profile && profile.full_name && profile.occupation;
  if (!hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { user, profile, loading } = useAuth();
  const { setIsSearchOpen } = useNews();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isOnboardingPage = location.pathname === '/onboarding';
  const hideLayout = isAuthPage || isOnboardingPage;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to onboarding if logged in but onboarding is not completed
  const hasCompletedOnboarding = profile && profile.full_name && profile.occupation;
  if (user && !hasCompletedOnboarding && !isOnboardingPage && !isAuthPage) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Responsive unified Sidebar drawer / hover component */}
      {!hideLayout && (
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto ${!hideLayout ? 'md:pl-[76px]' : ''}`}>
        {!hideLayout && (
          <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-6">
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
          </div>
        )}
        <div className={`flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 ${!hideLayout ? 'pt-6 max-md:pt-24 pb-24 md:pb-12' : 'flex items-center justify-center'}`}>
          <Routes>
            <Route path="/login" element={user && hasCompletedOnboarding ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/signup" element={user && hasCompletedOnboarding ? <Navigate to="/" /> : <SignupPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
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