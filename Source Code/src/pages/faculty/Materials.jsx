import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function FacultyMaterials() {
  const { courseId } = useParams();
  const { token } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', type: 'pdf', url: '' });

  useEffect(() => {
    fetchCourseAndMaterials();
  }, [courseId]);

  const fetchCourseAndMaterials = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [courseRes, matRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/courses/${courseId}`, { headers }),
        axios.get(`${API_BASE_URL}/course-materials/course/${courseId}`, { headers })
      ]);

      setCourse(courseRes.data.data);
      setMaterials(matRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      await axios.post(`${API_BASE_URL}/course-materials/course/${courseId}`, formData, { headers });

      setIsModalOpen(false);
      setFormData({ title: '', type: 'pdf', url: '' });
      fetchCourseAndMaterials();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (matId) => {
    if (!window.confirm("Delete this academic material?")) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      await axios.delete(`${API_BASE_URL}/course-materials/${matId}`, { headers });
      fetchCourseAndMaterials();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
        <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans bg-slate-50 dark:bg-dark-950"
    >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
        <div className="w-full xl:w-auto">
          <Link to="/faculty/courses" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-violet-600 transition-colors italic group">
            <span className="w-5 h-5 group-hover:-translate-x-1 transition-transform">←</span>
            Return to Portfolio
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
            Material <span className="text-violet-600">Vault</span>
          </h1>
          <p className="text-violet-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
            <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.3)]"></span>
            {course?.title || 'Sector Knowledge Assets'} • Node Sync Online
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full xl:w-auto bg-violet-600 hover:bg-slate-900 text-white px-10 py-5 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-2xl shadow-violet-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 italic shrink-0"
        >
          Provision Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
        {materials.map((mat, idx) => (
          <motion.div
            key={mat._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-dark-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800 hover:border-violet-500/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-violet-50 dark:bg-violet-500/10 text-violet-600 rounded-2xl group-hover:rotate-12 transition-transform shadow-inner">
                  {mat.type === 'pdf' ? '📄' : mat.type === 'video' ? '🎬' : '🔗'}
                </div>
                <button 
                  onClick={() => handleDelete(mat._id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4 line-clamp-2 min-h-[3.5rem]">{mat.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2 italic">
                Vector: {mat.type.toUpperCase()} • {new Date(mat.createdAt).toLocaleDateString()}
              </p>

              <a
                href={mat.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-violet-600 font-black uppercase text-[10px] tracking-widest hover:gap-5 transition-all italic"
              >
                Access Data Node <span>→</span>
              </a>
            </div>
          </motion.div>
        ))}

        {materials.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center px-4">
            <p className="font-black uppercase tracking-widest text-xs">Knowledge Vault Empty</p>
            <p className="text-[10px] mt-2 font-bold max-w-xs">No supplemental materials have been provisioned for this course node yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-dark-800 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl border-t-[12px] border-violet-600"
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 tracking-tight">Provision Knowledge Asset</h2>

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Asset Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Week 1 Lecture Handout"
                    className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-violet-500/10 placeholder:opacity-30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Asset Type</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-violet-500/10"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="ppt">Presentation (PPT)</option>
                      <option value="notes">Lecture Notes</option>
                      <option value="link">External Resource Link</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Resource URL</label>
                    <input
                      required
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://cloud.storage/asset.pdf"
                      className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-violet-500/10 placeholder:opacity-30"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-violet-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition"
                  >
                    Commit to Vault
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
