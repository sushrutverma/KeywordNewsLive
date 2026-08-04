import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Home, Bookmark, Settings } from 'lucide-react';



import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Navbar from './components/Navbar';
import ScrollNavigator from './components/ScrollNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { NewsProvider } from './contexts/NewsContext';
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

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar for Desktop navigation (only when user is logged in) */}
      {user && (
        <div className="hidden md:flex flex-col w-64 border-r border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md p-6 h-screen sticky top-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary dark:text-primary-dark font-unifraktur">Keywords</h1>
            <p className="text-xs text-gray-500 mt-1">Your Curated Feed</p>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </NavLink>
            <NavLink 
              to="/saved" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <Bookmark className="w-5 h-5 mr-3" />
              Saved Articles
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </NavLink>
          </nav>
          
          <div className="pt-6 border-t border-gray-200/50 dark:border-gray-800/50 text-xs text-gray-500">
            <div>Logged in as:</div>
            <div className="font-semibold text-gray-700 dark:text-gray-300 truncate mt-1">{user.email}</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-24 md:pb-12">
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
      
      {/* Floating capsule nav bar for mobile */}
      {user && <Navbar />}
      <ScrollNavigator />
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