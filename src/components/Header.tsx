import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogIn, Menu, Search, User, Command } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNews } from '../contexts/NewsContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const { setIsSearchOpen } = useNews();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isMac = typeof window !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;

  return (
    <header className="glass-card backdrop-blur-xl px-4 sm:px-6 py-3 rounded-2xl flex items-center justify-between mb-4 shadow-xs border border-gray-200/60 dark:border-zinc-800/60 w-full relative z-30 transition-all duration-200">
      {/* 1. Left: Brand Anchor */}
      <div className="flex items-center space-x-2 shrink-0">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-xl md:hidden hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors"
          title="Open Menu"
        >
          <Menu size={19} />
        </motion.button>
        
        <Link to="/" className="flex items-center space-x-2 group">
          <picture>
            <source srcSet="/keyword-logo.webp" type="image/webp" />
            <img
              src="/keyword-logo.png"
              alt="Keyword"
              width={120}
              height={28}
              className="h-6 sm:h-7 w-auto object-contain dark:invert transition-transform group-hover:scale-105 duration-200 select-none"
            />
          </picture>
        </Link>
      </div>

      {/* 2. Center: Quick Search Command Bar (Desktop & Tablet) */}
      <div className="hidden sm:flex flex-1 max-w-md mx-4 justify-center">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full max-w-sm flex items-center justify-between bg-gray-100/70 hover:bg-gray-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 border border-gray-200/80 dark:border-zinc-750/60 pl-3.5 pr-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 text-gray-500 dark:text-zinc-400 select-none group shadow-2xs hover:border-indigo-400/40 dark:hover:border-indigo-500/40"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <Search size={14} className="text-gray-400 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors shrink-0" />
            <span className="text-xs font-medium truncate">Search news feed...</span>
          </div>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-medium font-mono text-gray-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 px-1.5 py-0.5 rounded shadow-2xs">
            {isMac ? <Command size={10} /> : <span className="text-[9px]">Ctrl</span>}
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* 3. Right: Control Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Mobile Search Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSearchOpen(true)}
          className="flex sm:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors"
          title="Search"
        >
          <Search size={18} />
        </motion.button>

        <ThemeToggle />

        {/* User Account State */}
        {user ? (
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/15 dark:bg-primary-dark/15 dark:hover:bg-primary-dark/25 text-primary dark:text-primary-dark font-medium text-xs transition-colors border border-primary/20 dark:border-primary-dark/25"
            >
              <User size={14} />
              <span className="hidden md:inline max-w-[90px] truncate">{user.email?.split('@')[0]}</span>
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="glass-card absolute right-0 mt-2 w-52 rounded-xl shadow-xl z-50 p-1.5 border border-gray-200 dark:border-zinc-800"
                  >
                    <div className="px-3 py-2 text-xs border-b border-gray-100 dark:border-zinc-800/80 text-gray-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-3 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors mt-1"
                    >
                      <Settings size={14} className="mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="flex items-center w-full px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors mt-1"
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
              className="fab px-3.5 py-1.5 rounded-xl text-white text-xs font-medium flex items-center shadow-xs"
            >
              <LogIn size={13} className="mr-1.5" />
              Sign In
            </motion.button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;