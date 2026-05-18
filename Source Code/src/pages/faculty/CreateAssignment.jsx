import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
  PlusIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  CalendarIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
  CogIcon,
  ChevronLeftIcon,
  Bars3BottomLeftIcon,
  ChartBarIcon,
  PaperClipIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    totalPoints: 100,
    attachments: [],
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.courses || response.data.data || [];
      setCourses(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, courseId: data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...Array.from(e.target.files)]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.toUpperCase());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('courseId', formData.courseId);
      formDataToSend.append('dueDate', formData.dueDate);
      formDataToSend.append('totalPoints', formData.totalPoints);

      formData.attachments.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      const response = await axios.post(`${API_BASE_URL}/assignments`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-8 md:p-8 lg:p-12 max-w-[1200px] mx-auto min-h-screen pt-24 md:pt-32 font-sans"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 lg:mb-20 gap-8">
        <div>
          <Link to="/faculty/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-indigo-600 transition-colors italic group">
            <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return to Intelligence Command
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
            Assignment <span className="text-indigo-600">Initialization</span>
          </h1>
          <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.3)]"></span>
            Defining New Deliverable Node
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
        <div className="lg:col-span-12 xl:col-span-8">
          <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] p-8 md:p-14 lg:p-20 shadow-3xl border border-slate-50 dark:border-dark-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-bl-[6rem] -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-12 flex items-center gap-5">
              <ClipboardDocumentListIcon className="w-8 h-8 text-indigo-600" /> Deliverable Vector Profile
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-10 p-6 bg-rose-50 dark:bg-rose-950/20 border-l-8 border-rose-500 rounded-2xl text-rose-700 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-4 italic"
              >
                <InformationCircleIcon className="w-6 h-6 flex-shrink-0" />
                SYSTEM_FAIL: {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Deliverable Title</label>
                <div className="relative group/input">
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none">
                    <Bars3BottomLeftIcon className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="E.G. DSA DATA STRUCTURE IMPLEMENTATION"
                    className="w-full pl-20 pr-10 py-6 rounded-[2.5rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-base font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Implementation Specs</label>
                <div className="relative group/input">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="DEFINE THE TECHNICAL REQUIREMENTS, LOGIC CONSTRAINTS, AND EVALUATION RUBRIC..."
                    rows="6"
                    className="w-full px-10 py-10 rounded-[3rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight leading-relaxed resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Sector Logic Node (Course)</label>
                  <div className="relative group/input">
                    <select
                      name="courseId"
                      value={formData.courseId}
                      onChange={handleChange}
                      className="w-full px-10 py-6 rounded-[2.5rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-xs font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 appearance-none cursor-pointer italic uppercase tracking-widest"
                      required
                    >
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.code} · {c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Synchronization Deadline</label>
                  <div className="relative group/input">
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full pl-20 pr-10 py-6 rounded-[2.5rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 italic"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Point Weighting (Precision)</label>
                <div className="relative group/input">
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none">
                    <ChartBarIcon className="w-6 h-6" />
                  </div>
                  <input
                    type="number"
                    name="totalPoints"
                    value={formData.totalPoints}
                    onChange={handleChange}
                    className="w-full pl-20 pr-10 py-6 rounded-[2.5rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-base font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 italic"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic">Node Attachments (Specs/Resources)</label>
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-4 w-full py-16 border-4 border-dashed border-slate-100 dark:border-dark-800 rounded-[3rem] cursor-pointer hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-dark-950/50 transition-all group/upload"
                  >
                    <PaperClipIcon className="w-10 h-10 text-slate-300 group-hover/upload:text-indigo-600 transition-colors" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic group-hover/upload:text-indigo-600">Inject Component Resources</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.attachments.map((file, i) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={i}
                      className="flex items-center justify-between p-5 bg-slate-50 dark:bg-dark-950 rounded-2xl border border-slate-100 dark:border-dark-800 group/file"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <DocumentTextIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase truncate italic">{file.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-10 py-8 bg-indigo-600 hover:bg-slate-900 text-white rounded-[2.5rem] md:rounded-[3.5rem] font-black uppercase tracking-[0.3em] text-xs md:text-sm shadow-3xl shadow-indigo-600/30 transition-all transform hover:-translate-y-2 flex items-center justify-center gap-4 italic disabled:opacity-50 group/submit"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Deliverable Vector
                    <PlusIcon className="w-6 h-6 group-hover/submit:rotate-90 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Side Guidance */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-10">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
              <InformationCircleIcon className="w-7 h-7 text-indigo-400" /> Deliverable Protocol
            </h3>
            <ul className="space-y-6 text-white/80">
              {[
                'DEADLINES ARE SYNCHRONIZED ACROSS ALL STUDENT INTERFACES.',
                'ATTACHMENTS ARE CLOUD-OPTIMIZED FOR DISTRIBUTED ACCESS.',
                'EVALUATION VECTORS ACTIVATE UPON DEADLINE COMPLETION.',
                'DESCRIPTIONS SHOULD BE MARKDOWN-READY FOR MAX READABILITY.'
              ].map((text, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="w-5 h-5 flex-shrink-0 bg-indigo-400 text-slate-900 rounded-lg flex items-center justify-center text-[10px] font-black italic mt-1">{i + 1}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-10 text-white shadow-3xl shadow-indigo-600/20 text-center relative overflow-hidden group">
            <SparklesIcon className="w-16 h-16 mx-auto mb-6 opacity-80 group-hover:scale-110 transition-transform" />
            <p className="text-xl font-black italic uppercase tracking-tighter mb-4">Real-Time Distribution</p>
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest leading-relaxed opacity-80 italic">Once initialized, this node becomes a part of the institutional syllabus matrix instantly.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
