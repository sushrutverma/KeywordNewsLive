import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      onClick={toggleTheme}
      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 relative select-none ${
        isDark ? 'bg-zinc-800' : 'bg-zinc-200'
      }`}
      aria-label="Toggle theme"
    >
      {/* Background decorations inside switch */}
      <div className="absolute left-2 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-0 transition-opacity duration-300">
        <Sun className="w-3.5 h-3.5 text-amber-600" />
      </div>
      <div className="absolute right-2 flex items-center justify-center pointer-events-none opacity-0 dark:opacity-40 transition-opacity duration-300">
        <Moon className="w-3.5 h-3.5 text-indigo-400" />
      </div>

      {/* Spring Sliding Knob */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        style={{
          marginLeft: isDark ? 'auto' : '0px',
          marginRight: isDark ? '0px' : 'auto',
        }}
        className="w-6 h-6 rounded-full bg-white dark:bg-zinc-950 shadow flex items-center justify-center z-10"
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
    </div>
  );
};
