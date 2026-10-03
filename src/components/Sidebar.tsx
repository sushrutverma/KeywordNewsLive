import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bookmark, Settings, Info, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [showInfo, setShowInfo] = useState(false);

  // Render sidebar regardless of authentication state.

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      signOut();
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/saved', label: 'Saved Articles', icon: Bookmark },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-50 p-6 flex flex-col justify-between shadow-2xl border-r border-gray-200/50 dark:border-zinc-900/50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" onClick={onClose} className="block">
              <picture>
                <source srcSet="/keyword-logo.webp" type="image/webp" />
                <img
                  src="/keyword-logo.png"
                  alt="Keyword"
                  width={140}
                  height={32}
                  className="h-8 w-auto object-contain dark:invert select-none"
                />
              </picture>
              <p className="text-[10px] text-gray-500 mt-1">Driven by you, Curated for you</p>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-150 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900/40'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="space-y-4">
          {/* Developer Info Button (Mobile) */}
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                showInfo
                  ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900/40'
              }`}
            >
              <Info className="w-5 h-5 mr-3 flex-shrink-0" />
              Developer Info
            </button>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="glass-card absolute bottom-full left-0 right-0 mb-2 p-4 rounded-xl shadow-xl z-50 border border-gray-250/20 dark:border-zinc-800/50"
                >
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800 dark:text-zinc-200">Developed by</div>
                    <div className="mt-1 font-medium text-gray-700 dark:text-zinc-300">Sushrut Verma</div>
                    <a
                      href="https://www.linkedin.com/in/sushrutverma"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline dark:text-primary-dark text-xs mt-2 block"
                    >
                      linkedin.com/in/sushrutverma
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="pt-4 border-t border-gray-250/30 dark:border-zinc-900/60 flex items-center justify-between">
            {user ? (
              <>
                <div className="text-xs max-w-[150px]">
                  <div className="text-gray-500">Logged in as:</div>
                  <div className="font-semibold text-gray-700 dark:text-gray-300 truncate mt-0.5">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={onClose}
                className="flex items-center w-full px-3 py-2 text-xs font-semibold text-primary hover:text-indigo-600 dark:text-primary-dark dark:hover:text-indigo-400 transition-colors"
              >
                <LogOut size={16} className="mr-2 transform rotate-180" />
                Sign In / Sign Up
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* 3. Desktop Hover Sidebar */}
      <div
        className="hidden md:flex flex-col justify-between fixed left-0 top-0 h-screen bg-white/80 dark:bg-zinc-950/85 backdrop-blur-xl border-r border-gray-200/70 dark:border-zinc-800/70 z-40 p-3.5 transition-all duration-300 ease-in-out group w-[72px] hover:w-[250px] shadow-sm select-none"
      >
        <div>
          {/* Logo Section */}
          <Link to="/" className="flex items-center px-1.5 py-3 mb-6 overflow-hidden group/logo">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <picture>
                <source srcSet="/keyword-logo.webp" type="image/webp" />
                <img
                  src="/keyword-logo.png"
                  alt="Keyword"
                  width={32}
                  height={24}
                  className="h-6 w-auto max-w-[32px] object-contain dark:invert select-none"
                />
              </picture>
            </div>
            <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">Keyword</span>
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">Curated for you</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-2 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm overflow-hidden ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-850/60 hover:text-gray-900 dark:hover:text-zinc-200'
                  }`
                }
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="space-y-3">
          {/* Developer Info Button (Desktop) */}
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`flex items-center w-full px-2 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium overflow-hidden ${
                showInfo
                  ? 'bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-850/60'
              }`}
            >
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <span className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                Developer Info
              </span>
            </button>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 15 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 15 }}
                  transition={{ duration: 0.15 }}
                  className="glass-card absolute bottom-0 left-full ml-3 p-4 rounded-xl shadow-xl z-50 min-w-[210px] border border-gray-200 dark:border-zinc-800"
                >
                  <div className="text-xs">
                    <div className="font-semibold text-gray-900 dark:text-zinc-100">Developed by</div>
                    <div className="mt-1 font-medium text-gray-700 dark:text-zinc-300 text-sm">Sushrut Verma</div>
                    <a
                      href="https://www.linkedin.com/in/sushrutverma"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline dark:text-primary-dark text-xs mt-2 block font-medium"
                    >
                      linkedin.com/in/sushrutverma
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="pt-3 border-t border-gray-200/60 dark:border-zinc-850/80 flex items-center overflow-hidden h-[54px]">
            {user ? (
              <>
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/15 flex items-center justify-center shrink-0 text-primary dark:text-primary-dark font-semibold text-xs ml-0.5">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                
                <div className="ml-3 flex-grow flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                  <div className="text-xs max-w-[120px]">
                    <div className="text-gray-400 text-[10px]">Logged in as:</div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">{user.email?.split('@')[0]}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors shrink-0"
                    title="Sign Out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center px-2 py-2 text-xs font-semibold text-primary dark:text-primary-dark transition-colors overflow-hidden rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 w-full"
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <LogOut size={16} className="transform rotate-180" />
                </div>
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                  Sign In
                </span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
