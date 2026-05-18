import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { DocumentTextIcon, FolderIcon, TableCellsIcon, StarIcon, CheckCircleIcon, SparklesIcon, CalendarIcon, AcademicCapIcon, ClipboardDocumentCheckIcon, DocumentCheckIcon, ExclamationCircleIcon, ArrowDownTrayIcon, GlobeAltIcon, WindowIcon, CodeBracketSquareIcon, SwatchIcon, VariableIcon, AdjustmentsHorizontalIcon, CubeIcon, ChevronLeftIcon, ClockIcon, CheckBadgeIcon, UserCircleIcon, EnvelopeIcon, ArrowsRightLeftIcon, CodeBracketIcon, Bars3CenterLeftIcon } from '@heroicons/react/24/outline';

export default function Grading() {
  const { assignmentId } = useParams();
  const { token } = useAuthStore();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({
    grade: '',
    feedback: '',
    rubricScores: {}
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail' for mobile

  useEffect(() => {
    fetchAssignmentAndSubmissions();
  }, [assignmentId]);

  const fetchAssignmentAndSubmissions = async () => {
    try {
      const [assignmentRes, submissionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/submissions/assignment/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAssignment(assignmentRes.data);
      const subs = submissionsRes.data.submissions || submissionsRes.data.data || [];
      setSubmissions(subs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      grade: submission.grade || '',
      feedback: submission.feedback || '',
      rubricScores: submission.rubricScores || {}
    });
    setViewMode('detail');
  };

  const handleGradeChange = (e) => {
    setGradeData({ ...gradeData, [e.target.name]: e.target.value });
  };

  const handleRubricChange = (criterion, score) => {
    setGradeData({
      ...gradeData,
      rubricScores: { ...gradeData.rubricScores, [criterion]: score }
    });
  };

  const submitGrade = async () => {
    if (!selectedSubmission) return;
    setSubmitting(true);
    try {
      await axios.put(
        `${API_BASE_URL}/submissions/${selectedSubmission._id}/grade`,
        gradeData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAssignmentAndSubmissions();
      setSelectedSubmission(null);
      setViewMode('list');
    } catch (error) {
      console.error('Error submitting grade:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/30',
      graded: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/30',
      late: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/30'
    };
    return colors[status] || 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-950/30 dark:border-slate-900/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-6 font-black text-indigo-600 uppercase tracking-[0.4em] text-[10px]">Synchronizing Evaluation Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-24 md:pt-32 font-sans"
    >
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 lg:mb-16 gap-8">
        <div className="w-full xl:w-auto">
          <Link to="/faculty/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-indigo-600 transition-colors italic group">
            <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return to Intelligence Command
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic truncate max-w-4xl">
            {assignment?.title}
          </h1>
          <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.3)]"></span>
            Evaluation Bench • {submissions.length} Synchronized Assets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative overflow-hidden">

        {/* Submission Queue (List) */}
        <div className={`lg:col-span-12 xl:col-span-4 ${viewMode === 'detail' ? 'hidden xl:block' : 'block'}`}>
          <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] shadow-3xl border border-slate-50 dark:border-dark-800 overflow-hidden flex flex-col h-full max-h-[80vh]">
            <div className="p-8 md:p-10 border-b border-slate-50 dark:border-dark-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
                <Bars3CenterLeftIcon className="w-7 h-7 text-indigo-600" /> Matrix Queue
              </h2>
              <span className="px-4 py-1.5 bg-slate-50 dark:bg-dark-950 rounded-full text-[10px] font-black text-slate-400 uppercase italic border border-slate-100 dark:border-dark-800">{submissions.length} Assets</span>
            </div>
            <div className="overflow-y-auto divide-y divide-slate-50 dark:divide-dark-800/50 grow custom-scrollbar">
              {submissions.length > 0 ? submissions.map((sub, idx) => (
                <motion.button
                  key={sub._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => selectSubmission(sub)}
                  className={`w-full p-8 text-left transition-all relative group/sub ${selectedSubmission?._id === sub._id
                    ? 'bg-indigo-50 dark:bg-indigo-950/20'
                    : 'bg-transparent hover:bg-slate-50 dark:hover:bg-dark-950/40'
                    }`}
                >
                  {selectedSubmission?._id === sub._id && (
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600 shadow-[2px_0_10px_rgba(79,70,229,0.5)]" />
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-12 h-12 rounded-[1.2rem] bg-slate-900 dark:bg-dark-950 text-white flex items-center justify-center text-lg font-black italic shadow-xl shrink-0 group-hover/sub:rotate-12 transition-transform">
                        {(sub.student?.name || 'S').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none truncate pr-4">
                          {sub.student?.name || 'Student Asset'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase italic border flex items-center gap-1 ${getStatusColor(sub.status)}`}>
                            {sub.status === 'graded' ? <CheckBadgeIcon className="w-3 h-3" /> : sub.status === 'late' ? <ExclamationCircleIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
                            {sub.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {sub.grade !== undefined && (
                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-indigo-600 italic leading-none">{sub.grade}</p>
                        <p className="text-[8px] font-black text-slate-300 uppercase italic">MATRIX_PTS</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">
                    <span className="flex items-center gap-1 truncate"><CalendarIcon className="w-3.5 h-3.5" /> SYNC: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                    <span className="group-hover/sub:translate-x-1 transition-transform whitespace-nowrap">INSPECT NODE →</span>
                  </div>
                </motion.button>
              )) : (
                <div className="p-20 text-center flex flex-col items-center justify-center">
                  <div className="text-4xl mb-6 grayscale">🌫️</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Zero submissions detected in this vector node.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Workbench (Detail) */}
        <div className={`lg:col-span-12 xl:col-span-8 h-full ${viewMode === 'list' && 'hidden xl:block'}`}>
          <AnimatePresence mode="wait">
            {selectedSubmission ? (
              <motion.div
                key={selectedSubmission._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-8 md:space-y-12 pb-20"
              >
                {/* Student Profile Identity */}
                <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-14 lg:p-20 shadow-3xl border border-slate-50 dark:border-dark-800 relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-bl-[8rem] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                  <button
                    onClick={() => setViewMode('list')}
                    className="xl:hidden inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 hover:text-indigo-600 transition-colors italic group/back"
                  >
                    <ChevronLeftIcon className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
                    Return to Matrix Queue
                  </button>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-16">
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[4rem] bg-slate-900 dark:bg-dark-950 text-white flex items-center justify-center text-4xl md:text-6xl font-black italic shadow-3xl shadow-slate-900/30 shrink-0 group-hover:rotate-6 transition-transform">
                      {(selectedSubmission.student?.name || 'S').charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-left min-w-0">
                      <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-6 truncate max-w-lg">
                        {selectedSubmission.student?.name}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest italic opacity-80">
                        <span className="flex items-center gap-2"><EnvelopeIcon className="w-5 h-5 text-indigo-500" /> {selectedSubmission.student?.email}</span>
                        <span className="flex items-center gap-2"><ClockIcon className="w-5 h-5 text-indigo-500" /> SYNCED: {new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                        <span className={`px-4 py-1.5 rounded-full border shadow-sm ${getStatusColor(selectedSubmission.status)}`}>{selectedSubmission.status.toUpperCase()} NODE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Node Logic Display (File/Code/Answer) */}
                <div className="bg-slate-900 dark:bg-dark-950 rounded-[4rem] p-1 overflow-hidden shadow-3xl shadow-slate-900/40">
                  <div className="p-8 md:p-12 lg:p-16">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic flex items-center gap-3">
                        <CodeBracketIcon className="w-6 h-6" /> Node Logic Profile
                      </h3>
                      {selectedSubmission.fileUrl && (
                        <a
                          href={selectedSubmission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest italic transition-all flex items-center gap-3"
                        >
                          <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
                          View Source Artifact
                        </a>
                      )}
                    </div>

                    {selectedSubmission.code && (
                      <pre className="custom-scrollbar bg-black/40 backdrop-blur-3xl text-sm font-mono p-10 md:p-14 rounded-[3rem] overflow-x-auto max-h-[600px] border border-white/5 text-indigo-300 leading-relaxed no-scrollbar selection:bg-indigo-500/30">
                        <code>{selectedSubmission.code}</code>
                      </pre>
                    )}

                    {selectedSubmission.answer && (
                      <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                        <p className="text-base md:text-lg text-slate-200 font-bold italic leading-relaxed whitespace-pre-wrap">{selectedSubmission.answer}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rubric Matrix Evaluation */}
                {assignment?.rubric && assignment.rubric.length > 0 && (
                  <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-16 lg:p-24 shadow-3xl border border-slate-50 dark:border-dark-800 group">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-14 flex items-center gap-5">
                      <CheckBadgeIcon className="w-10 h-10 text-emerald-500" /> Criterion Calibration
                    </h2>

                    <div className="space-y-12">
                      {assignment.rubric.map((criterion, idx) => (
                        <div key={idx} className="group/crit">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
                            <div className="max-w-xl">
                              <p className="text-xl font-black text-slate-900 dark:text-white italic leading-none mb-3">{criterion.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-70 leading-relaxed">{criterion.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-2">Threshold Max</p>
                              <p className="text-2xl font-black text-indigo-600 italic leading-none">{criterion.maxScore}</p>
                            </div>
                          </div>
                          <div className="relative group/score">
                            <input
                              type="number"
                              min="0"
                              max={criterion.maxScore}
                              value={gradeData.rubricScores[criterion.name] || ''}
                              onChange={(e) => handleRubricChange(criterion.name, e.target.value)}
                              className="w-full px-10 py-6 rounded-2xl bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/20 text-base font-black text-indigo-600 transition-all outline-none italic placeholder:opacity-5 text-right font-mono"
                              placeholder={`0 / ${criterion.maxScore}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Global Performance Synthesis (Grade & Feedback) */}
                <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-16 lg:p-24 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.2)] border border-slate-50 dark:border-dark-800 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/5 rounded-br-[8rem] -ml-16 -mt-16 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-16 flex items-center gap-5">
                    <SparklesIcon className="w-10 h-10 text-indigo-600" /> Evaluation Synthesis
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
                    <div className="md:col-span-4 space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 italic mb-2 block">Matrix Synthesis (0-{assignment?.maxGrade || 100})</label>
                      <div className="relative group/input">
                        <input
                          type="number"
                          name="grade"
                          min="0"
                          max={assignment?.maxGrade || 100}
                          value={gradeData.grade}
                          onChange={handleGradeChange}
                          className="w-full px-10 py-12 rounded-[3rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-6xl font-black text-indigo-600 transition-all focus:ring-8 ring-indigo-500/5 placeholder:opacity-10 text-center outline-none italic"
                          placeholder="00"
                        />
                        <p className="text-center mt-6 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Weighted Node Accumulation</p>
                      </div>
                    </div>
                    <div className="md:col-span-8 space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-8 italic mb-2 block">Pedagogical Feedback Vector</label>
                      <textarea
                        name="feedback"
                        value={gradeData.feedback}
                        onChange={handleGradeChange}
                        rows="8"
                        placeholder="ENTER QUANTITATIVE AND QUALITATIVE PERFORMANCE VECTORS FOR THE STUDENT ASSET..."
                        className="w-full px-10 py-10 rounded-[3.5rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm md:text-base font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight leading-relaxed resize-none outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={submitGrade}
                    disabled={submitting || !gradeData.grade}
                    className="w-full mt-20 py-10 bg-indigo-600 hover:bg-slate-900 text-white rounded-[3rem] md:rounded-[5rem] font-black uppercase tracking-[0.4em] text-sm md:text-base shadow-3xl shadow-indigo-600/30 transition-all transform hover:-translate-y-2 flex items-center justify-center gap-6 italic disabled:opacity-50 group/btn"
                  >
                    {submitting ? (
                      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Synchronize Evaluation Node
                        <ClipboardDocumentCheckIcon className="w-8 h-8 group-hover/btn:rotate-12 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] p-20 shadow-3xl border border-slate-50 dark:border-dark-800 flex flex-col items-center justify-center h-full min-h-[700px] text-center">
                <div className="w-32 h-32 bg-slate-50 dark:bg-dark-950 rounded-full flex items-center justify-center text-6xl mb-12 shadow-inner group/empty hover:scale-110 transition-transform">
                  <SparklesIcon className="w-16 h-16 text-slate-200 group-hover:text-indigo-500 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">Zero Node Selected</h3>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] max-w-sm italic opacity-60 leading-loose">Synchronize with an individual asset node from the Matrix Queue to initiate pedagogical evaluation vectors for this assignment.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* System Uplink Badge */}
      <div className="mt-20 flex justify-center opacity-30 gap-10">
        <div className="flex items-center gap-3">
          <ExclamationCircleIcon className="w-5 h-5 text-indigo-600" />
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Telemetry: Active</span>
        </div>
        <div className="flex items-center gap-3">
          <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Institutional Standard Node-A1</span>
        </div>
      </div>
    </motion.div>
  );
}
