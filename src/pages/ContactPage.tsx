import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle2, Building, Clock } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';

const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Editorial Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Wire contact form submission to backend / Edge function / Resend endpoint
    setSubmitted(true);
  };

  return (
    <div className="flex-1 min-h-0 py-2 sm:py-4">
      <SEOHead
        title="Contact Keyword – Editorial & Support"
        description="Get in touch with Keyword News for editorial corrections, partnership inquiries, and platform support."
        canonicalPath="/contact"
        noindex={false}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact Us' },
          ]}
          className="px-1"
        />

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-card rounded-3xl p-8 sm:p-12 border border-gray-200/60 dark:border-zinc-800/80 shadow-xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark text-xs font-semibold mb-4">
            <MessageSquare size={14} />
            Get in Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Have an editorial question, report a broken feed, or discuss syndication? Our team is here to assist.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-4">
            <div className="glass-card p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                <Mail size={18} />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Email Departments</h2>
              <div className="text-xs space-y-2 text-gray-600 dark:text-zinc-400">
                <p>
                  <strong className="block text-gray-800 dark:text-zinc-200">Editorial Corrections:</strong>
                  <span>TODO: editorial@keywordnews.netlify.app</span>
                </p>
                <p>
                  <strong className="block text-gray-800 dark:text-zinc-200">Partnerships:</strong>
                  <span>TODO: partners@keywordnews.netlify.app</span>
                </p>
                <p>
                  <strong className="block text-gray-800 dark:text-zinc-200">General Support:</strong>
                  <span>TODO: support@keywordnews.netlify.app</span>
                </p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                <Clock size={18} />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Response Window</h2>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                Editorial corrections and factual disputes are triaged within 24 business hours.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
                <Building size={18} />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Office Location</h2>
              <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                TODO: Registered Office Address Placeholder, Landmark, Postal Code
              </p>
            </div>
          </div>

          {/* Interactive Contact Form Column */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-gray-200/60 dark:border-zinc-800/60">
              {submitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Message Received</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm">
                    Thank you for reaching out. We have logged your submission and our editorial desk will review it shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'Editorial Inquiry', message: '' });
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Send us a direct message</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-100/70 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-100/70 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-100/70 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="Editorial Inquiry">Editorial & Source Inquiry</option>
                      <option value="Factual Correction">Factual Correction or Typo Report</option>
                      <option value="Syndication">Content Syndication / Publisher Query</option>
                      <option value="Technical Bug">Technical Bug / Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your inquiry or correction in detail..."
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-100/70 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="fab px-5 py-2.5 rounded-xl text-white text-xs font-semibold inline-flex items-center"
                  >
                    <Send size={14} className="mr-2" />
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
