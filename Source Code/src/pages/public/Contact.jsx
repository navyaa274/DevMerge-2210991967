import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-dark-900 relative overflow-hidden py-12 md:py-24 flex items-center justify-center">
      <div className="absolute inset-0 z-0 bg-grid-slate-200/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-800/[0.04] dark:bg-bottom"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Contact Communication Subsystem */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-12"
          >
            <div>
              <p className="text-amber-500 font-bold tracking-widest uppercase text-[10px] md:text-xs mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Network Routing Active
              </p>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Ping <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-400">Node</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-sm md:text-base mt-6">
                Establish a direct link with the primary DevMerge administrative core. Protocol delays are minimized for high-priority academic pings.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { label: 'Admin Terminal', value: 'admin@devmerge.edu', icon: '💻' },
                { label: 'System Support Node', value: 'support@devmerge.edu', icon: '⚙️' },
                { label: 'Physical Server Base', value: 'DevMerge CyberHQ, TC 12345', icon: '📍' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white dark:hover:bg-dark-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-dark-700">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/10 text-amber-500 flex items-center justify-center text-2xl font-black shrink-0 shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</h3>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Transmission Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-amber-500/5 border border-slate-100 dark:border-dark-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-[100px] -mr-10 -mt-10 blur-xl"></div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-amber-500 flex items-center justify-center text-sm">📡</span> Transmission Port
              </h2>

              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-[1.5rem] mb-8 font-bold text-sm flex items-center gap-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    Payload delivered successfully. Awaiting asynchronous callback.
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Operator ID</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocused('name')}
                      onBlur={() => setFocused(null)}
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold text-slate-800 dark:text-white focus:ring-4 ring-amber-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      placeholder="Enter designation"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Return Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold text-slate-800 dark:text-white focus:ring-4 ring-amber-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      placeholder="ping@domain.net"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Message Payload</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocused('message')}
                    onBlur={() => setFocused(null)}
                    rows="5"
                    className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold text-slate-800 dark:text-white focus:ring-4 ring-amber-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none custom-scrollbar"
                    placeholder="Initialize handshake string..."
                    required
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 dark:bg-amber-600 text-white dark:text-black hover:bg-amber-600 dark:hover:bg-amber-400 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-amber-500/30 flex items-center justify-center gap-3"
                  >
                    Execute Transmission <span className="text-amber-500 dark:text-black">↗</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
