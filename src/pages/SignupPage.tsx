import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) throw signUpError;

      // Send custom welcome email via Netlify serverless function
      try {
        const siteOrigin = window.location.origin;
        await fetch('/.netlify/functions/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email,
            subject: 'Welcome to Keywords News!',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border-radius: 16px; background-color: #ffffff; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #4f46e5; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.025em;">Keywords News</h1>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 4px; margin-bottom: 0;">Your Personalized News Intelligence Feed</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 24px;" />
                <p style="font-size: 16px; color: #1f2937; line-height: 1.6; margin-top: 0;">Hello,</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Thank you for signing up for <strong>Keywords News</strong>! We're excited to help you customize your news reading experience.</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">You can now set up your target keywords, explore feeds, and view elevated glassmorphic cards configured to keep track of topics that matter to you.</p>
                <div style="text-align: center; margin: 36px 0;">
                  <a href="${siteOrigin}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);">Explore Your Feed</a>
                </div>
                <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 0;">Happy reading,<br />The Keywords News Team</p>
                <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-top: 32px; margin-bottom: 16px;" />
                <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
                  Developed by Sushrut Verma. If you did not create this account, please ignore this email.
                </p>
              </div>
            `
          })
        });
      } catch (emailErr) {
        console.error('Failed to dispatch welcome email:', emailErr);
      }

      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 glass-card p-8 rounded-xl"
      >
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center text-red-500 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign up'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;