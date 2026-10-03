import { ReactNode, useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

const HomePage = lazy(() => import('./pages/HomePage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const SavedArticlesPage = lazy(() => import('./pages/SavedArticlesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh] p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Loading page...</span>
    </div>
  </div>
);
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { MarketTicker } from './components/MarketTicker';
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
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${!hideLayout ? 'md:pl-[76px]' : ''}`}>
        {!hideLayout ? (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-16 flex-1 flex flex-col">
            <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
            <div className="mb-4">
              <MarketTicker />
            </div>
            <div className="flex-1">
              <Suspense fallback={<PageLoader />}>
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
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        )}
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