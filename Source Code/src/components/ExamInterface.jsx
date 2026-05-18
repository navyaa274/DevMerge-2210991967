import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

export default function ExamInterface({ examId }) {
  const { user, token } = useAuthStore();
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [proctorWarning, setProctorWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [score, setScore] = useState(null);
  const [totalMarks, setTotalMarks] = useState(null);

  const answersRef = useRef({});

  // Synchronize ref with state for auto-save closure stability
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const autoSave = useCallback(async (proctoringEvent = null) => {
    if (submitted || !examId) return;
    setIsSaving(true);
    try {
      await axios.patch(`${API_BASE_URL}/exams/${examId}/save`, {
        answers: answersRef.current,
        proctoringLog: proctoringEvent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 1000);
    }
  }, [examId, token, submitted]);

  // Window Focus Detection (Proctoring)
  useEffect(() => {
    const handleBlur = () => {
      setProctorWarning(true);
      autoSave({ event: 'TAB_SWITCH', details: 'User switched away from exam tab' });
      setTimeout(() => setProctorWarning(false), 5000);
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [autoSave]);

  // Auto-save interval (30s)
  useEffect(() => {
    const interval = setInterval(() => autoSave(), 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const [examRes, submissionRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/exams/${examId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/exams/${examId}/my-submission`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (examRes.status === 'fulfilled') {
          setExam(examRes.value.data);
          setTimeLeft(examRes.value.data.duration * 60);

          // Populate existing answers if any
          if (submissionRes.status === 'fulfilled' && submissionRes.value.data.answers) {
            setAnswers(submissionRes.value.data.answers);
            if (submissionRes.value.data.submittedAt) {
              setScore(submissionRes.value.data.score);
              setTotalMarks(submissionRes.value.data.totalMarks);
              setSubmitted(true);
            }
          }
        }
      } catch (error) {
        console.error('Initial sync failed:', error);
      }
    };
    if (examId && token) fetchExam();
  }, [examId, token]);

  useEffect(() => {
    if (!exam || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, submitted]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/exams/${examId}/submit`, {
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScore(response.data.score);
      setTotalMarks(response.data.totalMarks);
      setSubmitted(true);
    } catch (error) {
      if (error.response?.status === 400) {
        setScore(error.response.data.submission?.score ?? null);
        setTotalMarks(error.response.data.submission?.totalMarks ?? null);
        setSubmitted(true);
      } else {
        alert('Submission failed. Persistent session saved.');
      }
    }
  };

  if (!exam) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Initializing Secure Proctoring Link...</p>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl text-center max-w-2xl">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <CheckBadgeIcon className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Exam Concluded</h2>
        <p className="text-slate-400 font-medium mb-10">Your artifacts have been securely transmitted and archived for evaluation.</p>

        {score !== null && (
          <div className="bg-slate-800/50 rounded-3xl p-10 mb-10 border border-slate-700">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cognitive Score Analysis</p>
            <p className="text-6xl font-black text-white italic tracking-tighter">{score} <span className="text-2xl text-slate-600">/ {totalMarks}</span></p>
          </div>
        )}

        <button
          onClick={() => window.location.href = '/exams'}
          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
        >
          Return to Hub
        </button>
      </motion.div>
    </div>
  );

  const question = exam.questions?.[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner - Proctoring Status */}
      <div className="h-1 bg-slate-800 w-full sticky top-0 z-[60]">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
          className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
        />
      </div>

      <AnimatePresence>
        {proctorWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-4 border-2 border-red-500"
          >
            <ExclamationTriangleIcon className="w-5 h-5 animate-pulse" />
            Security Breach Detected: Log Recorded
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-indigo-500" />
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Secure Assessment Interface // PROCTOR_ACTIVE</p>
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">{exam.title}</h1>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className={`px-8 py-4 rounded-3xl border transition-all flex flex-col items-center ${timeLeft < 300 ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-slate-900 border-slate-800 text-white'}`}>
              <div className="flex items-center gap-3">
                <ClockIcon className="w-6 h-6" />
                <span className="text-3xl font-black italic tabular-nums leading-none">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-50">Temporal Remaining</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-slate-800 text-[10px] font-black uppercase tracking-widest ${isSaving ? 'text-indigo-400' : 'text-slate-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-indigo-500 animate-ping' : 'bg-slate-700'}`} />
              {isSaving ? 'Syncing Artifacts...' : 'System Synced'}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-12 gap-10 overflow-hidden min-h-0 mb-8">
          {/* Main Question Terminal */}
          <div className="col-span-12 lg:col-span-9 flex flex-col overflow-y-auto pr-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              {question && (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-12 relative overflow-hidden flex-1"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-9xl font-black italic italic pointer-events-none">
                    Q{currentQuestion + 1}
                  </div>

                  <div className="relative z-10">
                    <p className="text-indigo-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6">Execution Objective:</p>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter mb-10 leading-tight">
                      {question.title || 'Inquiry Analysis'}
                    </h2>

                    <div className="prose prose-invert max-w-none mb-12">
                      <p className="text-lg text-slate-300 font-medium leading-relaxed italic border-l-4 border-indigo-500/30 pl-8">
                        {question.description}
                      </p>
                    </div>

                    {/* Interaction Zone */}
                    <div className="mt-12">
                      {question.type === 'mcq' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.options?.map((option, idx) => {
                            const isSelected = answers[question._id] === option;
                            return (
                              <button
                                key={idx}
                                onClick={() => handleAnswerChange(question._id, option)}
                                className={`group flex items-center p-6 border transition-all rounded-[1.5rem] text-left relative overflow-hidden ${isSelected
                                  ? 'bg-indigo-600 border-indigo-400 shadow-xl'
                                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                                  }`}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-6 transition-all ${isSelected ? 'bg-white border-white' : 'border-slate-700'}`}>
                                  {isSelected && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                </div>
                                <span className={`text-sm font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                  {option}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <textarea
                          value={answers[question._id] || ''}
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          className="w-full h-80 bg-slate-950 border-2 border-slate-800 rounded-[2rem] p-8 focus:outline-none focus:border-indigo-500 transition-all font-mono text-indigo-400 text-sm italic placeholder:text-slate-800 resize-none shadow-inner"
                          placeholder="// Type your descriptive proof here..."
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Matrix */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 h-full overflow-hidden">
            <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-8 flex-1 overflow-y-auto">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Logic Nodes Matrix</p>
              <div className="grid grid-cols-4 gap-3">
                {exam.questions?.map((q, idx) => {
                  const isAnswered = !!answers[q?._id];
                  const isCurrent = idx === currentQuestion;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`h-12 rounded-xl text-xs font-black transition-all transform hover:scale-105 ${isCurrent
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : isAnswered
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-6 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-500 hover:text-white transition-all shadow-2xl group flex items-center justify-center gap-3 italic"
            >
              Terminate & Submit
              <CloudArrowUpIcon className="w-5 h-5 group-hover:animate-bounce" />
            </button>
          </div>
        </div>

        {/* Footer Mobility Controls */}
        <div className="mt-auto flex justify-between items-center py-8 border-t border-slate-800">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-4 px-8 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all disabled:opacity-20"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Tactical Retreat
          </button>

          <div className="lg:hidden flex gap-2">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest" onClick={handleSubmit}>Submit</button>
          </div>

          <button
            onClick={() => currentQuestion === exam.questions.length - 1 ? handleSubmit() : setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))}
            className="flex items-center gap-4 px-10 py-3 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all select-none"
          >
            {currentQuestion === exam.questions.length - 1 ? 'Final Logic Check' : 'Execute Next Node'}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
