import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Sun, Moon, Check, ChevronRight, ChevronLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNews } from '../contexts/NewsContext';
import { topics } from '../services/newsSources';

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { followedTopics, toggleFollowTopic } = useNews();

  const handleNext = () => {
    setDirection(1);
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (followedTopics.length === 0) {
      setError('Please select at least one topic of interest.');
      setStep(2);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) throw signUpError;
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 bg-transparent select-none">
      <div className="w-full max-w-lg">
        {/* Step Indicator Dots */}
        <div className="flex justify-center space-x-2.5 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'w-10 bg-indigo-650 dark:bg-indigo-400' 
                  : s < step 
                    ? 'w-2 bg-indigo-650/50 dark:bg-indigo-400/40' 
                    : 'w-2 bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Wizard Main Container Card */}
        <div className="glass-card p-8 rounded-2xl shadow-xl border border-gray-250/30 dark:border-zinc-850/40 overflow-hidden relative min-h-[420px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Theme</h2>
                  <p className="text-sm text-gray-500 mt-1.5">Select how you want to read your daily curated news.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {/* Light Theme Card */}
                    <div
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`p-6 rounded-2xl border cursor-pointer flex flex-col items-center justify-center space-y-3 transition-all duration-300 ${
                        theme === 'light'
                          ? 'border-indigo-600 bg-indigo-600/5 dark:border-indigo-400/30'
                          : 'border-gray-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-gray-300'
                      }`}
                    >
                      <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold ${theme === 'light' ? 'text-indigo-600' : 'text-gray-500'}`}>Light Mode</span>
                    </div>

                    {/* Dark Theme Card */}
                    <div
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`p-6 rounded-2xl border cursor-pointer flex flex-col items-center justify-center space-y-3 transition-all duration-300 ${
                        theme === 'dark'
                          ? 'border-indigo-400 bg-indigo-400/5 dark:border-indigo-400/30'
                          : 'border-gray-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-gray-300'
                      }`}
                    >
                      <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-indigo-400' : 'text-gray-500'}`}>Dark Mode</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button
                    onClick={handleNext}
                    className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold"
                  >
                    Next Topic Selection
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Curate Your Feed</h2>
                  <p className="text-sm text-gray-500 mt-1.5">Pick the topics you want to show on your tabs feed (min. 1).</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {topics.map((topic) => {
                      const isSelected = followedTopics.includes(topic.id);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleFollowTopic(topic.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-indigo-650 bg-indigo-650/5 dark:border-indigo-400/30'
                              : 'border-gray-200/50 dark:border-zinc-800/40 hover:border-gray-300 bg-zinc-50/50 dark:bg-zinc-900/10'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">{topic.name}</h4>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-zinc-700'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-150/20 dark:border-zinc-900/40">
                  <button
                    onClick={handleBack}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1.5" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={followedTopics.length === 0}
                    className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Setup Credentials
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</h2>
                  <p className="text-sm text-gray-500 mt-1.5">Sign up to sync your preferences and access saved articles.</p>

                  <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    {error && (
                      <div className="flex items-center text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200/30">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-xs">{error}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="Email address"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                          placeholder="Password"
                        />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between pt-6 border-t border-gray-150/20 dark:border-zinc-900/40">
                    <button
                      onClick={handleBack}
                      disabled={loading}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm font-semibold disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1.5" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-1.5" />
                      )}
                      Complete Sign Up
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-500 mt-2">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                      Sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;