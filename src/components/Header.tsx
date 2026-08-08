import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogIn, Menu, Search, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { setIsSearchOpen } = useNews();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="glass-card backdrop-blur-md px-6 py-4 rounded-2xl flex items-center justify-between mb-8 shadow-sm border border-gray-200/40 dark:border-zinc-850/40 w-full relative z-30">
      
      {/* Brand Logo & Mobile Menu Toggle (Visible on mobile, hidden on desktop to avoid duplication) */}
      <div className="flex items-center space-x-1.5 md:hidden">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="p-2 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 transition-colors"
          title="Open Menu"
        >
          <Menu size={20} />
        </motion.button>
        
        <Link to="/">
          <h1 className="text-2xl font-bold text-primary dark:text-primary-dark font-unifraktur tracking-wide">
            Keywords
          </h1>
        </Link>
      </div>



      {/* Search Pill (Desktop) */}
      <div 
        onClick={() => setIsSearchOpen(true)}
        className="hidden md:flex items-center bg-zinc-200/30 dark:bg-zinc-800/15 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/40 border border-gray-250/30 dark:border-zinc-800/70 pl-5 pr-3 py-2 rounded-full cursor-pointer transition-all duration-300 w-72 text-zinc-400 dark:text-zinc-500 select-none shadow-sm group"
      >
        <span className="text-xs font-medium flex-1">Search news feed...</span>
        <div className="bg-white dark:bg-zinc-900 border border-gray-205/60 dark:border-zinc-800/80 p-1.5 rounded-full shadow-sm text-zinc-400 dark:text-zinc-500 group-hover:text-primary dark:group-hover:text-primary-dark group-hover:border-primary/20 dark:group-hover:border-primary-dark/20 transition-all duration-200">
          <Search size={12} />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Mobile Search Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSearchOpen(true)}
          className="flex md:hidden p-2 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 transition-colors"
          title="Search"
        >
          <Search size={20} />
        </motion.button>

        <ThemeToggle />

        {/* Authentication Actions */}
        {user ? (
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 dark:bg-primary-dark/10 dark:hover:bg-primary-dark/20 text-primary dark:text-primary-dark font-medium text-xs transition-colors border border-primary/20 dark:border-primary-dark/20"
            >
              <User size={14} />
              <span className="hidden sm:inline max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="glass-card absolute right-0 mt-2 w-48 rounded-xl shadow-xl z-50 p-2 border border-gray-250/50 dark:border-zinc-850/50"
                  >
                    <div className="px-3 py-2 text-xs border-b border-gray-250/50 dark:border-zinc-850/50 text-gray-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors mt-1"
                    >
                      <Settings size={14} className="mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="flex items-center w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors mt-1"
                    >
                      <LogIn size={14} className="mr-2 transform rotate-180" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="fab px-4 py-2 rounded-full text-white text-xs font-medium flex items-center"
            >
              <LogIn size={14} className="mr-1.5" />
              Sign In
            </motion.button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;