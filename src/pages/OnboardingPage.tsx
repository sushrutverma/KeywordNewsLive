import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, BookOpen, Laptop, GraduationCap, Globe, Clock, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNews } from '../contexts/NewsContext';
import { topics } from '../services/newsSources';

const OCCUPATIONS = [
  { id: 'UPSC Aspirant', name: 'UPSC / BPSC Aspirant', icon: BookOpen, desc: 'Focus heavily on Government policy, Budget, and Editorials.' },
  { id: 'Software Engineer', name: 'Developer / Designer', icon: Laptop, desc: 'Prioritize Tech, design, gadgets, and system changes.' },
  { id: 'Student', name: 'Academic Student', icon: GraduationCap, desc: 'Get a balanced knowledge mix of competitive studies and global news.' },
  { id: 'General Reader', name: 'General News Reader', icon: Globe, desc: 'Keep track of daily news, style, sports, and world events.' }
];

const READING_GOALS = [
  { id: 15, name: '15 Minutes', desc: 'Fast updates to scan the headlining stories.', icon: Clock },
  { id: 30, name: '30 Minutes', desc: 'Balanced daily reading for thorough coverage.', icon: Clock },
  { id: 60, name: '60 Minutes', desc: 'Deep dive, comprehensive studies & exam prep.', icon: Clock }
];

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [fullName, setFullName] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(15);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { upsertProfile, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { followedTopics, toggleFollowTopic } = useNews();
  const navigate = useNavigate();

  // If user somehow already has finished onboarding, redirect to homepage
  useEffect(() => {
    if (profile && profile.full_name && profile.occupation) {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleNext = () => {
    if (step === 1 && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (step === 1 && !selectedOccupation) {
      setError('Please select your focus / occupation.');
      return;
    }
    if (step === 3 && followedTopics.length === 0) {
      setError('Please select at least one topic.');
      return;
    }
    setError('');
    setDirection(1);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setDirection(-1);
    setStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    if (followedTopics.length === 0) {
      setError('Please select at least one topic.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: upsertError } = await upsertProfile({
        full_name: fullName,
        occupation: selectedOccupation,
        reading_goal: selectedGoal,
        followed_topics: followedTopics
      });

      if (upsertError) throw upsertError;
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0
    })
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 bg-transparent select-none">
      <div className="w-full max-w-2xl">
        
        {/* Step Indicator Progress Bar */}
        <div className="flex justify-between items-center mb-8 px-2 max-w-md mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-initial">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-sm transition-all duration-300 ${
                s === step 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105' 
                  : s < step 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-500'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`h-1 flex-1 mx-2 rounded-full transition-colors duration-300 ${
                  s < step ? 'bg-emerald-500' : 'bg-gray-250 dark:bg-zinc-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Wizard Main Container Card */}
        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-250/30 dark:border-zinc-850/40 relative overflow-hidden min-h-[480px] flex flex-col justify-between">
          
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
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Tell Us About Yourself</h2>
                  <p className="text-sm text-gray-500 mt-2">Let's start by personalizing your feed content.</p>

                  <div className="space-y-6 mt-6">
                    {error && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3.5 rounded-xl border border-red-200/30 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Your Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-11 w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white text-sm"
                          placeholder="E.g. Sushrut Verma"
                        />
                      </div>
                    </div>

                    {/* Focus/Occupation Selection Grid */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Select Your Focus / Goal</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {OCCUPATIONS.map((occ) => {
                          const IconComp = occ.icon;
                          const isSelected = selectedOccupation === occ.id;
                          return (
                            <div
                              key={occ.id}
                              onClick={() => setSelectedOccupation(occ.id)}
                              className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-600/5 dark:border-indigo-400/30 shadow-sm'
                                  : 'border-gray-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-650 dark:text-indigo-400' : 'text-gray-800 dark:text-zinc-200'}`}>
                                  {occ.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed">{occ.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-gray-150/20 dark:border-zinc-900/40">
                  <button
                    onClick={handleNext}
                    className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-md"
                  >
                    Next: Reading Goal
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
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Choose Your Daily Target</h2>
                  <p className="text-sm text-gray-500 mt-2">Setting a reading habit helps you stay productive without burnouts.</p>

                  <div className="space-y-4 mt-8">
                    {READING_GOALS.map((goal) => {
                      const isSelected = selectedGoal === goal.id;
                      const IconComp = goal.icon;
                      return (
                        <div
                          key={goal.id}
                          onClick={() => setSelectedGoal(goal.id)}
                          className={`p-5 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600/5 dark:border-indigo-400/30'
                              : 'border-gray-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200">{goal.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">{goal.desc}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected ? 'bg-indigo-650 border-indigo-650' : 'border-gray-300 dark:border-zinc-700'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-gray-150/20 dark:border-zinc-900/40">
                  <button
                    onClick={handleBack}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1.5" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-md"
                  >
                    Next: Preferences
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
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Curate Topics & Theme</h2>
                  <p className="text-sm text-gray-500 mt-2">Finish setting up your dashboard layout.</p>

                  <div className="space-y-6 mt-6">
                    {error && (
                      <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200/30 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {error}
                      </div>
                    )}

                    {/* Vibe Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Choose Theme</label>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => theme === 'dark' && toggleTheme()}
                          className={`flex-1 py-3 px-4 border rounded-xl flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                            theme === 'light'
                              ? 'border-indigo-600 bg-indigo-600/5 text-indigo-650'
                              : 'border-gray-250/50 dark:border-zinc-800 text-gray-500 bg-transparent hover:border-gray-300'
                          }`}
                        >
                          <Sun className="w-4 h-4" />
                          <span>Light Mode</span>
                        </button>

                        <button
                          onClick={() => theme === 'light' && toggleTheme()}
                          className={`flex-1 py-3 px-4 border rounded-xl flex items-center justify-center space-x-2 text-xs font-bold transition-all ${
                            theme === 'dark'
                              ? 'border-indigo-400 bg-indigo-400/5 text-indigo-400'
                              : 'border-gray-250/50 dark:border-zinc-800 text-gray-500 bg-transparent hover:border-gray-300'
                          }`}
                        >
                          <Moon className="w-4 h-4" />
                          <span>Dark Mode</span>
                        </button>
                      </div>
                    </div>

                    {/* Checkbox Grid for Topics */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">Select Curated Topics</label>
                      <div className="grid grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
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
                              <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate pr-1">{topic.name}</span>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0 transition-colors ${
                                isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-zinc-700'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-gray-150/20 dark:border-zinc-900/40">
                  <button
                    onClick={handleBack}
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm font-semibold disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1.5" />
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={submitting || followedTopics.length === 0}
                    className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Check className="w-4 h-4 mr-1.5" />
                    )}
                    Complete Setup
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
