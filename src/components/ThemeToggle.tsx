import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PRESETS = [
  { level: 20, label: 'Soft' },
  { level: 50, label: 'Studio' },
  { level: 85, label: 'Deep' },
  { level: 100, label: 'OLED' },
];

export const ThemeToggle: React.FC = () => {
  const { theme, darkness, toggleTheme, setTheme, setDarkness } = useTheme();
  const isDark = theme === 'dark';
  
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const startDarknessRef = useRef<number>(darkness);
  const knobRef = useRef<HTMLDivElement>(null);

  // Rotation range: -135deg (10%) to +135deg (100%) -> total 270deg span
  const currentAngle = isDark
    ? -135 + ((darkness - 10) / 90) * 270
    : -135;

  // Percentage label helper
  const getDarknessLabel = (level: number) => {
    if (level <= 25) return 'Soft Dusk';
    if (level <= 45) return 'Slate';
    if (level <= 65) return 'Studio Zinc';
    if (level <= 85) return 'Midnight';
    return 'True OLED';
  };

  // Pointer drag handler for rotating the knob
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag on primary click
    if (e.button !== 0) return;
    
    // Auto-activate dark mode if currently light
    if (!isDark) {
      setTheme('dark');
    }

    setIsDragging(true);
    startYRef.current = e.clientY;
    startDarknessRef.current = darkness;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    // Dragging up increases darkness, dragging down decreases
    const deltaY = startYRef.current - e.clientY;
    const stepChange = Math.round(deltaY * 0.7);
    const newLevel = Math.max(10, Math.min(100, startDarknessRef.current + stepChange));
    setDarkness(newLevel);
  }, [isDragging, setDarkness]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Mouse wheel handler to rotate the knob smoothly
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!isDark) {
      setTheme('dark');
    }
    const delta = e.deltaY < 0 ? 5 : -5;
    const next = Math.max(10, Math.min(100, darkness + delta));
    setDarkness(next);
  };

  // Keyboard navigation (Arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isDark) setTheme('dark');
      setDarkness(Math.min(100, darkness + 5));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isDark) setTheme('dark');
      setDarkness(Math.max(10, darkness - 5));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  // SVG circular arc math for 270deg arc
  const radius = 18;
  const circumference = 2 * Math.PI * radius; // ~113.1
  const arcLength = circumference * 0.75; // ~84.8
  const progressRatio = isDark ? (darkness - 10) / 90 : 0;
  const strokeDashoffset = arcLength - progressRatio * arcLength;

  return (
    <div 
      className="relative flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isDragging && setIsHovered(false)}
    >
      {/* Outer Dial Container */}
      <div
        ref={knobRef}
        role="slider"
        aria-label="Theme & Darkness Knob"
        aria-valuemin={10}
        aria-valuemax={100}
        aria-valuenow={isDark ? darkness : 0}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm"
        title={isDark ? `Darkness: ${darkness}% (Drag or scroll to adjust)` : 'Light Mode (Click to toggle dark mode)'}
      >
        {/* SVG Circular Progress Ring */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" 
          viewBox="0 0 44 44"
        >
          {/* Background track (270 degrees) */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            className="text-gray-200 dark:text-zinc-800 transition-colors"
            transform="rotate(-45 22 22)"
          />

          {/* Active Illuminated Ring */}
          {isDark && (
            <circle
              cx="22"
              cy="22"
              r={radius}
              fill="none"
              stroke="url(#knobGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-75"
              transform="rotate(-45 22 22)"
            />
          )}

          <defs>
            <linearGradient id="knobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Physical Brushed Metallic Rotary Knob Bezel */}
        <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-b from-gray-100 to-gray-250 dark:from-zinc-800 dark:to-zinc-950 border border-gray-300 dark:border-zinc-700/80 shadow-md flex items-center justify-center relative">
          
          {/* Rotating Notch Indicator on the knob perimeter */}
          <motion.div
            style={{ rotate: currentAngle }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute inset-0 flex items-start justify-center pointer-events-none"
          >
            <div className={`w-[2px] h-[6px] rounded-full mt-0.5 ${
              isDark 
                ? 'bg-gradient-to-b from-indigo-400 to-pink-500 shadow-sm shadow-indigo-500/50' 
                : 'bg-amber-500 shadow-xs'
            }`} />
          </motion.div>

          {/* Center Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className="w-5 h-5 rounded-full flex items-center justify-center text-gray-700 dark:text-zinc-200 hover:scale-110 active:scale-95 transition-transform outline-none"
            aria-label="Toggle light/dark"
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
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Floating Interactive Knob Console Popover on Hover / Drag */}
      <AnimatePresence>
        {(isHovered || isDragging) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 z-50 p-3 rounded-2xl glass-card border border-gray-200/80 dark:border-zinc-800 shadow-xl min-w-[210px] select-none"
          >
            {/* Header Readout */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Sparkles size={12} className="text-indigo-500" />
                <span className="text-[11px] font-bold text-gray-800 dark:text-zinc-200">
                  {isDark ? `${darkness}% Dark` : 'Light Mode'}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                {isDark ? getDarknessLabel(darkness) : 'Daylight'}
              </span>
            </div>

            {/* Live Slider Scrubber */}
            <div className="space-y-1.5 mb-2.5">
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={isDark ? darkness : 10}
                onChange={(e) => {
                  if (!isDark) setTheme('dark');
                  setDarkness(parseInt(e.target.value, 10));
                }}
                className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-gray-400 dark:text-zinc-500 px-0.5">
                <span>10% Soft</span>
                <span>50% Studio</span>
                <span>100% OLED</span>
              </div>
            </div>

            {/* Quick Snap Presets */}
            <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-gray-150 dark:border-zinc-800/60">
              {PRESETS.map((p) => {
                const isActive = isDark && Math.abs(darkness - p.level) <= 5;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => {
                      if (!isDark) setTheme('dark');
                      setDarkness(p.level);
                    }}
                    className={`py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-gray-100/80 dark:bg-zinc-850 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    {p.level}%
                  </button>
                );
              })}
            </div>

            <p className="text-[9px] text-gray-400 dark:text-zinc-500 mt-2 text-center leading-tight">
              Drag knob vertically or scroll to fine-tune
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;
