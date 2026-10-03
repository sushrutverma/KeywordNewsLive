import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 relative select-none border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isDark 
          ? 'bg-zinc-800/90 border-zinc-700/80 shadow-inner' 
          : 'bg-zinc-200/90 border-zinc-300/80 shadow-inner'
      }`}
    >
      {/* Background track indicator icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        <Sun className={`w-3.5 h-3.5 text-amber-500 transition-opacity duration-200 ${isDark ? 'opacity-30' : 'opacity-0'}`} />
        <Moon className={`w-3.5 h-3.5 text-indigo-400 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-30'}`} />
      </div>

      {/* Hardware-accelerated sliding knob */}
      <motion.div
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className="w-6 h-6 rounded-full bg-white dark:bg-zinc-950 shadow-md flex items-center justify-center relative z-10"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme}
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/25" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
