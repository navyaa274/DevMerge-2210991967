import React from 'react';
import { motion } from 'framer-motion';

export default function HamburgerMenu({ isOpen, onToggle, className = "", colors }) {
  const accentColor = colors?.accent || 'indigo';
  
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-10 flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 group ${className}`}
      aria-label="Toggle Menu"
    >
      <span 
        className={`h-0.5 bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-300 group-hover:bg-${accentColor}-600 ${
          isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'
        }`}
      />
      <span 
        className={`h-0.5 bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-300 group-hover:bg-${accentColor}-600 ${
          isOpen ? 'opacity-0' : 'w-4 mr-2'
        }`}
      />
      <span 
        className={`h-0.5 bg-slate-500 dark:bg-slate-400 rounded-full transition-all duration-300 group-hover:bg-${accentColor}-600 ${
          isOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-6'
        }`}
      />
    </button>
  );
}
