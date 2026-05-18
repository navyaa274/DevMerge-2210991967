import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Neural signature incomplete. 6-digit sequence required.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/otp/verify-otp`, {
        email,
        otp: otpCode
      });

      // Handle successful verification (token storage handled by store usually, but following the component logic)
      if (response.data.success) {
        // If the app uses a store, it should be updated here. 
        // For now, adhering to the original logic which was redirecting.
        navigate(`/${response.data.user.role}/dashboard`);
      }
    } catch (err) {
      setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Neural signature verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/otp/send-otp`, { email });
      setResendTimer(60);
      setCanResend(false);
      setError('');
    } catch (err) {
      setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Failed to re-transmit neural signature.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-500/30 mb-6 group hover:rotate-12 transition-transform duration-500">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Dev<span className="text-indigo-600">Merge</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">
            Neural Signature Verification
          </p>
        </div>

        {/* OTP Card */}
        <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-3xl border border-white/20 dark:border-dark-800 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[4rem] pointer-events-none"></div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8 flex items-center gap-3">
            <CpuChipIcon className="w-6 h-6 text-indigo-600" /> Identity Uplink
          </h2>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-8 italic">
            Sequence transmitted to: <span className="text-indigo-600 text-xs lowercase">{email}</span>
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-3"
            >
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
              {typeof error === 'string' ? error : error?.toString() || 'Unknown error occurred'}
            </motion.div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-10">
            {/* OTP Input Fields */}
            <div className="flex justify-between gap-2 md:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-16 md:w-14 md:h-20 text-center text-3xl font-black rounded-2xl bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-slate-900 dark:text-white transition-all focus:ring-4 ring-indigo-500/10 italic outline-none shadow-sm"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-5 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl shadow-indigo-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn italic disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Validate Sequence
                  <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-dark-800 text-center">
            {canResend ? (
              <button
                onClick={handleResendOtp}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest italic underline decoration-dotted underline-offset-4"
              >
                Re-transmit Neural Signature →
              </button>
            ) : (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                <ClockIcon className="w-4 h-4 animate-spin" />
                Next Transmission Window: <span className="text-slate-900 dark:text-white font-black">{resendTimer}s</span>
              </p>
            )}
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest italic transition-colors"
          >
            ← Terminate Procedure
          </Link>
        </div>

        {/* System Status Display (for aesthetic) */}
        <div className="mt-12 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mainframe: Nominal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Link: encrypted</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
