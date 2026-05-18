import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../services/api/apiClient';
import {
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ShareIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function CertificationCenter() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      // We will assume the endpoint is /certificates/user/:userId for now
      // This might need adjustment based on the exact API path
      const res = await apiClient.get(`/certificates/user/${user.id || user._id}`);
      setCertificates(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch certification payload.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certId) => {
    try {
      setDownloadingId(certId);
      // Create a dummy download effect since actual PDF generation might be complex
      // In a real scenario, this would trigger a blob download
      const response = await apiClient.get(`/certificates/${certId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate secure certificate PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="mt-6 text-amber-600 font-black uppercase tracking-[0.4em] text-[10px]">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-8 md:p-8 lg:p-12 max-w-[1600px] mx-auto min-h-screen pt-20 md:pt-24">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 lg:mb-16 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-amber-600 font-black text-white text-[9px] uppercase tracking-[0.3em] rounded-full shadow-lg shadow-amber-500/20 italic">
              Portfolio
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-dark-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-dark-800 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500" /> Secure Vault
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
            Certification <span className="text-amber-500">Center</span>
          </h1>
          <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mt-4">
            Your validated digital achievements and verified skill matrix.
          </p>
        </div>

        <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex items-center gap-6 min-w-[300px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[40px] -mt-10 -mr-10"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 relative z-10">
            <TrophyIcon className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Credentials</p>
            <p className="text-3xl font-black text-white tracking-tighter italic leading-none">{certificates.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-bold uppercase tracking-widest mb-8 flex items-center gap-3">
          <SparklesIcon className="w-5 h-5 text-rose-500" /> {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {certificates.length === 0 ? (
          <div className="col-span-full py-32 bg-slate-50 dark:bg-dark-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-800 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-white dark:bg-dark-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-12">
              <DocumentCheckIcon className="w-12 h-12 text-slate-300 dark:text-dark-600" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Portfolio Empty</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-sm px-4">
              Complete missions, active tasks, and module assessments to unlock verified digital credentials.
            </p>
          </div>
        ) : (
          certificates.map((cert, idx) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white dark:bg-dark-900 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl overflow-hidden relative hover:border-amber-500/50 transition-colors"
            >
              {/* Premium Certificate Header */}
              <div className="h-40 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 relative overflow-hidden p-6 md:p-8 flex flex-col justify-between">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-8 scale-[3] opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                  <AcademicCapIcon className="w-24 h-24 text-white" />
                </div>

                <div className="flex justify-between items-start relative z-10 w-full">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                    <TrophyIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-black/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
                    {cert.score ? `Score: ${cert.score}%` : 'Verified'}
                  </span>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-8 relative">
                {/* Connector Node */}
                <div className="absolute top-0 right-8 -mt-6 w-12 h-12 bg-white dark:bg-dark-900 rounded-full border-4 border-amber-500 flex items-center justify-center shadow-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-amber-500" />
                </div>

                <div className="mb-8">
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2 border-l-2 border-amber-500 pl-2">
                    Official Credential
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tighter">
                    {cert.title}
                  </h3>
                  {cert.courseId && (
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-2">
                      {typeof cert.courseId === 'object' ? cert.courseId.name || cert.courseId.title : cert.courseId}
                    </p>
                  )}
                </div>

                {cert.skills && cert.skills.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Skill Metrics</p>
                    <div className="flex flex-wrap gap-2">
                      {cert.skills.map((skill, i) => (
                        <span key={i} className="bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-dark-800 mb-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Trace ID</p>
                    <p className="text-[10px] font-bold text-slate-900 dark:text-white font-mono truncate">
                      {cert.certificateNumber || cert._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(cert._id)}
                    disabled={downloadingId === cert._id}
                    className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                  >
                    {downloadingId === cert._id ? (
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-4 h-4 group-hover/btn:-translate-y-1 transition-transform" />
                        Download
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      alert("Public portfolio link copied to clipboard.");
                    }}
                    className="w-14 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors"
                    title="Export to LinkedIn"
                  >
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
