import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Bookmark, Settings, Info, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [showInfo, setShowInfo] = useState(false);

  // Render sidebar regardless of authentication state.

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
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
            <div>
              <h1 className="text-2xl font-bold text-primary dark:text-primary-dark font-unifraktur">Keywords</h1>
              <p className="text-[10px] text-gray-500 mt-0.5">Your Curated Feed</p>
            </div>
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
        className="hidden md:flex flex-col justify-between fixed left-0 top-0 h-screen bg-white/50 dark:bg-zinc-950/20 backdrop-blur-md border-r border-gray-250/30 dark:border-zinc-900/30 z-40 p-4 transition-all duration-300 ease-in-out group w-[76px] hover:w-[260px] shadow-sm select-none"
      >
        <div>
          {/* Logo Section */}
          <div className="flex items-center px-2 py-4 mb-8 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center flex-shrink-0 shadow-inner">
              <span className="text-xl font-bold text-primary dark:text-primary-dark font-unifraktur">K</span>
            </div>
            <div className="ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
              <h1 className="text-xl font-bold text-primary dark:text-primary-dark font-unifraktur tracking-wide">
                Keywords
              </h1>
              <p className="text-[9px] text-gray-500">Your Curated Feed</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm overflow-hidden ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900/30'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0 ml-1.5" />
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="space-y-4">
          {/* Developer Info Button (Desktop) */}
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium overflow-hidden ${
                showInfo
                  ? 'bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900/30'
              }`}
            >
              <Info className="w-5 h-5 flex-shrink-0 ml-1.5" />
              <span className="ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                Developer Info
              </span>
            </button>
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  className="glass-card absolute bottom-0 left-full ml-4 p-4 rounded-xl shadow-xl z-50 min-w-[200px] border border-gray-250/20 dark:border-zinc-800/50"
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
          <div className="pt-4 border-t border-gray-250/30 dark:border-zinc-900/60 flex items-center overflow-hidden h-[57px]">
            {user ? (
              <>
                <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary-dark/10 flex items-center justify-center flex-shrink-0 text-primary dark:text-primary-dark font-semibold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                
                <div className="ml-3 flex-grow flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                  <div className="text-xs max-w-[120px]">
                    <div className="text-gray-500 truncate">Logged in:</div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300 truncate mt-0.5">{user.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors flex-shrink-0"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center px-1.5 py-2 text-xs font-semibold text-primary dark:text-primary-dark transition-colors overflow-hidden"
              >
                <LogOut size={18} className="flex-shrink-0 ml-1.5 transform rotate-180" />
                <span className="ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
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
