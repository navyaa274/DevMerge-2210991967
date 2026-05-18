import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import problemService from '../../services/api/problemService';
import apiClient from '../../services/api/apiClient';
import {
  ChevronLeftIcon,
  PlayIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  CpuChipIcon,
  CommandLineIcon,
  ArrowPathIcon,
  BeakerIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function ProblemSolve() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const contentContext = location.state;
  const { token, user } = useAuthStore();

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [hints, setHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [learningPath, setLearningPath] = useState(null);

  // AI Generation State
  const [aiConfig, setAiConfig] = useState({
    subject: 'Data Structures and Algorithms',
    topic: 'Arrays',
    difficulty: 'Medium',
    questionType: 'Coding',
    problemType: 'LeetCode Style'
  });
  const [aiLoading, setAiLoading] = useState(false);

  // LeetCode-style problem templates
  const leetcodeCategories = [
    'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 
    'Dynamic Programming', 'Sorting', 'Searching', 'Hash Tables',
    'Stacks', 'Queues', 'Recursion', 'Backtracking', 'Greedy',
    'Divide and Conquer', 'Bit Manipulation', 'Math', 'Geometry'
  ];

  const problemTemplates = [
    {
      name: 'Two Sum',
      subject: 'Arrays',
      topic: 'Hash Tables',
      difficulty: 'Easy',
      description: 'Given an array of integers and a target, return indices of two numbers that add up to target.'
    },
    {
      name: 'Binary Tree Level Order Traversal',
      subject: 'Trees',
      topic: 'Breadth-First Search',
      difficulty: 'Medium',
      description: 'Return the level order traversal of a binary tree\'s nodes values.'
    },
    {
      name: 'Longest Palindromic Substring',
      subject: 'Strings',
      topic: 'Dynamic Programming',
      difficulty: 'Hard',
      description: 'Given a string, return the longest palindromic substring in the string.'
    }
  ];
  const [generatedProblems, setGeneratedProblems] = useState([]);

  const isSolved = Array.isArray(mySubmissions) ? mySubmissions.some(s => s.status === 'accepted') : false;

  const getCodeTemplate = useCallback((lang, currentProblem) => {
    let baseCode = '';
    if (currentProblem?.starterCode && currentProblem.starterCode[lang]) {
      baseCode = currentProblem.starterCode[lang];
    } else {
      const templates = {
        javascript: `function solution(input) {\n  // Write your logic here\n  return result;\n}`,
        python: `def solution(input):\n    # Write your logic here\n    return result`,
        java: `public class Solution {\n    public static void main(String[] args) {\n        // Write your logic here\n    }\n}`,
        cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your logic here\n    return 0;\n}`
      };
      baseCode = templates[lang] || templates.javascript;
    }

    if (currentProblem?.examples?.length > 0) {
      baseCode += '\n\n/* -----------------------------------\n * Integration Test Vectors\n * ----------------------------------- */\n';
      currentProblem.examples.forEach((ex, idx) => {
        baseCode += `// TestCase ${idx + 1}:\n// Input: ${ex.input}\n// Target: ${ex.output}\n`;
      });
    }
    return baseCode;
  }, []);

  const fetchProblem = useCallback(async () => {
    try {
      const problemData = await problemService.getProblemById(id);
      setProblem(problemData.data);
      setCode(getCodeTemplate(language, problemData.data));

      const subs = await problemService.getMySubmissions(id);
      setMySubmissions(subs.data || []);
    } catch (error) {
      console.error('Core problem sync failed:', error);
    }
  }, [id, language, getCodeTemplate]);

  useEffect(() => {
    fetchProblem();
    if (contentContext?.pathId) {
      problemService.getLearningPath(contentContext.pathId)
        .then(setLearningPath)
        .catch(console.error);
    }
  }, [id, contentContext?.pathId, fetchProblem]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (!code || code === getCodeTemplate(language, problem)) {
      setCode(getCodeTemplate(newLang, problem));
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await problemService.executeCode({ code, language, problemId: id });
      const executionData = res.data || {};
      setTestResults(executionData.testResults || []);
      setResult({ status: 'Run_Sync_Complete', ...executionData });
    } catch (error) {
      setResult({ status: 'Link_Error', message: error });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const execRes = await problemService.executeCode({ code, language, problemId: id });
      const executionData = execRes.data;

      const submitRes = await problemService.submitSolution({
        problem: id,
        code,
        language,
        status: executionData.status,
        runtime: executionData.runtime,
        memory: executionData.memory,
        testResults: executionData.testResults
      });

      setResult(submitRes);
      setTestResults(submitRes.testResults || []);

      const updatedSubs = await problemService.getMySubmissions(id);
      setMySubmissions(updatedSubs.data || []);

      if (submitRes.data?.status === 'accepted' || submitRes.status === 'accepted') {
        await problemService.markComplete(contentContext.pathId, {
          contentType: 'problem',
          contentId: id,
          moduleIndex: contentContext.moduleIndex,
          contentIndex: contentContext.contentIndex,
          score: 100
        });
      }
    } catch (error) {
      setResult({ status: 'Deployment_Failed', message: error });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestHint = async () => {
    if (hints.length >= 3) return;
    setLoadingHint(true);
    try {
      const res = await problemService.requestHint({
        problemDescription: problem?.description || '',
        language
      });
      setHints(prev => [...prev, res.hint]);
    } catch (error) {
      console.error('Heuristic retrieval failed:', error);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleGenerateAIProblem = async () => {
    if (!aiConfig.subject || !aiConfig.topic) {
      alert('Please specify both subject and topic');
      return;
    }

    setAiLoading(true);
    try {
      const config = {
        course: 'Data Structures and Algorithms',
        semester: 1,
        subject: aiConfig.subject,
        topic: aiConfig.topic,
        bloomsLevel: 'Apply',
        questionType: aiConfig.questionType,
        problemMode: 'Practice',
        difficulty: aiConfig.difficulty,
        realWorldContext: true,
        leetcodeStyle: true,
        includeTestCases: true,
        includeConstraints: true,
        includeTimeComplexity: true,
        includeSpaceComplexity: true
      };

      const res = await apiClient.post('/ultimate-problem-generator/generate-test', config);
      let problemData = res.data.data;
      
      // Handle HTML format responses by converting to LeetCode-style structure
      if (problemData.isHtmlFormat || typeof problemData.description === 'string' && problemData.description.includes('<div')) {
        console.log('Converting HTML format to LeetCode style');
        
        // Extract title from HTML
        const titleMatch = problemData.description.match(/<h4[^>]*>(.*?)<\/h4>/);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : `${aiConfig.topic} Problem`;
        
        // Extract problem statement
        const statementMatch = problemData.description.match(/<h4[^>]*>Problem Statement<\/h4>(.*?)(?=<h4|$)/s);
        const description = statementMatch ? statementMatch[1].replace(/<[^>]*>/g, '').trim() : problemData.description;
        
        // Extract examples
        const examples = [];
        const exampleMatches = problemData.description.match(/<h4[^>]*>Example \d+<\/h4>(.*?)(?=<h4|$)/gs);
        if (exampleMatches) {
          exampleMatches.forEach((example) => {
            const inputMatch = example.match(/Input:\s*\n?\s*(.*?)\s*\n?\s*Output:/s);
            const outputMatch = example.match(/Output:\s*\n?\s*(.*?)\s*\n?\s*Explanation:/s);
            const explanationMatch = example.match(/Explanation:\s*\n?\s*(.*?)\s*(?=<h4|$)/s);
            
            if (inputMatch && outputMatch) {
              examples.push({
                input: inputMatch[1].replace(/<[^>]*>/g, '').trim(),
                output: outputMatch[1].replace(/<[^>]*>/g, '').trim(),
                explanation: explanationMatch ? explanationMatch[1].replace(/<[^>]*>/g, '').trim() : ''
              });
            }
          });
        }
        
        // Extract constraints
        const constraintsMatch = problemData.description.match(/<h4[^>]*>Constraints<\/h4>(.*?)(?=<h4|$)/s);
        const constraints = constraintsMatch ? constraintsMatch[1].replace(/<[^>]*>/g, '').trim() : '';
        
        // Create LeetCode-style structure
        problemData = {
          title: title,
          description: description,
          difficulty: aiConfig.difficulty,
          examples: examples,
          constraints: constraints,
          testCases: examples.map(ex => ({
            input: ex.input,
            expectedOutput: ex.output,
            description: ex.explanation || 'Test case'
          })),
          starterCode: {
            javascript: `function solution(input) {\n  // TODO: Implement your solution\n  return result;\n}`,
            python: `def solution(input):\n    # TODO: Implement your solution\n    return result`,
            java: `class Solution {\n    public int solution(int[] input) {\n        // TODO: Implement your solution\n        return result;\n    }\n}`
          }
        };
      }
      
      // Enhance the generated problem with LeetCode-style structure
      const enhancedProblem = {
        ...problemData,
        problemId: Math.floor(Math.random() * 10000) + 1000,
        title: problemData.title || `${aiConfig.topic} Problem`,
        difficulty: aiConfig.difficulty,
        category: aiConfig.subject,
        tags: [aiConfig.topic],
        acceptanceRate: Math.floor(Math.random() * 30) + 40,
        frequency: Math.floor(Math.random() * 100) + 1,
        companies: ['Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook'].slice(0, Math.floor(Math.random() * 3) + 1),
        relatedTopics: leetcodeCategories.filter(cat => cat !== aiConfig.topic).slice(0, 2)
      };
      
      setGeneratedProblems(prev => [enhancedProblem, ...prev]);
    } catch (error) {
      console.error('AI problem generation failed:', error);
      alert('Failed to generate AI problem. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const getNextStepRoute = () => {
    if (!learningPath || !contentContext) return null;
    const { moduleIndex, contentIndex } = contentContext;
    const currentModule = learningPath.modules[moduleIndex];
    if (!currentModule?.content) return null;

    let nextItem = null;
    let nextModIdx = moduleIndex;
    let nextContentIdx = contentIndex + 1;

    if (nextContentIdx < currentModule.content.length) {
      nextItem = currentModule.content[nextContentIdx];
    } else if (moduleIndex + 1 < learningPath.modules.length) {
      const nextModule = learningPath.modules[moduleIndex + 1];
      if (nextModule?.content?.length > 0) {
        nextItem = nextModule.content[0];
        nextModIdx = moduleIndex + 1;
        nextContentIdx = 0;
      }
    }

    if (!nextItem) return null;

    const nextContext = {
      pathId: contentContext.pathId,
      moduleIndex: nextModIdx,
      contentIndex: nextContentIdx,
      contentType: nextItem.type,
      contentId: nextItem.contentId || nextItem.title
    };

    let route = null;
    if (nextItem.type === 'video') route = `/student/video/${nextItem.contentId}`;
    else if (nextItem.type === 'problem') route = `/problems/${nextItem.contentId}`;
    else if (nextItem.type === 'quiz') route = `/student/quiz/${nextItem.contentId}`;
    else if (nextItem.type === 'reading') return { route: `/student/reading/${nextItem.title}`, state: { reading: nextItem, ...nextContext } };

    return route ? { route, state: nextContext } : null;
  };

  if (!problem) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-8 text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px]">Synchronizing Problem Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 overflow-hidden flex flex-col font-sans select-none text-slate-300">
      {/* Top HUD */}
      <div className={`h-16 flex items-center justify-between px-8 border-b transition-colors z-50 ${contentContext?.pathId ? 'bg-indigo-950/40 border-indigo-500/20 shadow-[0_4px_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex items-center gap-8">
          <button
            onClick={() => contentContext?.pathId ? navigate(`/student/learning-paths/${contentContext.pathId}`) : navigate('/problems')}
            className="group p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
          >
            <ChevronLeftIcon className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </button>

          <div className="flex flex-col">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] leading-none mb-1">
              {contentContext?.pathId ? 'Sequence Module' : 'Logic Node'}
            </span>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">{problem?.title || 'Problem'}</h1>
          </div>

          <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 ${problem?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
            problem?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${problem?.difficulty === 'Easy' ? 'bg-emerald-500' :
              problem?.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            {problem?.difficulty || 'Medium'} Spec
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-slate-900/50 p-1 rounded-xl border border-slate-800 flex items-center">
            {['javascript', 'python', 'java', 'cpp'].map(lang => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${language === lang ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {isSolved ? (
            <div className="flex items-center gap-3 px-6 py-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Verification Passed</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={loading}
                className="group flex items-center gap-3 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 disabled:opacity-50"
              >
                <PlayIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                Local Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group flex items-center gap-3 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/20 disabled:opacity-50 border-b-4 border-indigo-800 active:border-b-0 active:translate-y-px"
              >
                <CloudArrowUpIcon className="w-4 h-4 group-hover:animate-bounce" />
                {loading ? 'Submitting...' : 'Global Deploy'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tabbed Logic */}
        <div className="w-[480px] bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col z-40">
          <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
            {[
              { id: 'description', label: 'Instruction', icon: DocumentTextIcon },
              { id: 'submissions', label: 'History', icon: ClockIcon },
              { id: 'hints', label: 'Heuristics', icon: LightBulbIcon },
              { id: 'ai-generate', label: 'AI Generate', icon: SparklesIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="desc"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div>
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 italic">
                      <span className="w-8 h-px bg-indigo-500/50 block" /> Operational Context
                    </h3>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-300 font-medium">
                      {problem?.description?.split('\n').map((line, idx) => {
                        if (line.startsWith('## ')) return <h4 key={idx} className="text-xl font-black text-white uppercase tracking-tighter mt-12 mb-6 italic">{line.replace('## ', '')}</h4>;
                        if (line.startsWith('### ')) return <h5 key={idx} className="text-sm font-black text-indigo-400 uppercase tracking-widest mt-8 mb-4">{line.replace('### ', '')}</h5>;
                        if (line.trim().startsWith('- ')) return <li key={idx} className="ml-4 mb-3 marker:text-indigo-500">{line.replace(/^- /, '')}</li>;
                        if (line.includes('`')) {
                          const parts = line.split('`');
                          return (
                            <p key={idx} className="mb-4">
                              {parts.map((p, i) => i % 2 === 1 ? <code key={i} className="bg-slate-800 px-2 py-0.5 rounded-lg text-emerald-400 font-mono text-[11px] border border-white/5">{p}</code> : p)}
                            </p>
                          );
                        }
                        return line.trim() ? <p key={idx} className="mb-4">{line}</p> : <br key={idx} />;
                      })}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {problem?.examples?.map((ex, idx) => (
                      <div key={idx} className="group p-8 bg-slate-950 rounded-[2.5rem] border border-slate-800 hover:border-indigo-500/30 transition-all shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                          <CheckBadgeIcon className="w-24 h-24" />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Validation Vector {idx + 1}</h4>
                        <div className="space-y-6 relative z-10">
                          <div>
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-2 font-mono">Input_Stream:</span>
                            <pre className="bg-slate-900 p-5 rounded-2xl text-[11px] text-emerald-400 font-mono border border-white/5 overflow-x-auto select-text shadow-inner">{ex.input}</pre>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-2 font-mono">Target_Output:</span>
                            <pre className="bg-slate-900 p-5 rounded-2xl text-[11px] text-amber-400 font-mono border border-white/5 overflow-x-auto select-text shadow-inner">{ex.output}</pre>
                          </div>
                          {ex.explanation && (
                            <div className="pt-6 border-t border-slate-800">
                              <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic"># {ex.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {problem?.constraints && (
                    <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-rose-500/10 shadow-2xl">
                      <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-6 italic">Operational Constraints</h3>
                      <div className="font-mono text-[11px] text-rose-300/60 space-y-2">
                        {problem?.constraints?.split('\n').map((line, idx) => (
                          <div key={idx} className="flex gap-4">
                            <span className="text-rose-500/20">{idx + 1}</span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'submissions' && (
                <motion.div
                  key="subs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Transmission History</h3>
                    <button
                      onClick={fetchProblem}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {mySubmissions.length > 0 ? (
                    mySubmissions.map((sub, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02, x: 5 }}
                        onClick={() => {
                          if (!isSolved || window.confirm('Restore this code snapshot?')) {
                            setCode(sub.code);
                            setLanguage(sub.language);
                            setActiveTab('description');
                          }
                        }}
                        className={`p-6 rounded-[2rem] border cursor-pointer transition-all relative overflow-hidden group shadow-xl ${sub.status === 'accepted' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950 border-slate-800 shadow-none'
                          }`}
                      >
                        <div className={`absolute top-0 left-0 w-1.5 h-full transition-all ${sub.status === 'accepted' ? 'bg-emerald-500' : 'bg-slate-800 group-hover:bg-indigo-500'
                          }`} />

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${sub.status === 'accepted' ? 'bg-emerald-500' :
                              sub.status === 'wrong_answer' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                              }`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest italic ${sub.status === 'accepted' ? 'text-emerald-500' : 'text-slate-400'
                              }`}>{sub.status}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                            {new Date(sub.submittedAt).toLocaleDateString()} // {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1 leading-none italic">Latency</p>
                            <p className="text-xs font-black text-slate-300 font-mono">{sub.runtime || 0} MS</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1 leading-none italic">Memory</p>
                            <p className="text-xs font-black text-slate-300 font-mono">{Math.round(sub.memory || 0)} MB</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1 leading-none italic">Core</p>
                            <p className="text-xs font-black text-indigo-400 font-mono">{sub.language.toUpperCase()}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-40 opacity-20">
                      <BeakerIcon className="w-20 h-20 mb-6" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">No Logs Found</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'hints' && (
                <motion.div
                  key="hints"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-[2s]"></div>
                    <LightBulbIcon className="w-12 h-12 text-white/30 mb-6 rotate-12" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">AI Heuristic Hub</h3>
                    <p className="text-[10px] font-bold opacity-80 uppercase leading-relaxed tracking-widest mb-8">
                      Retrieve algorithmic optimizations grounded in node complexity.
                    </p>
                    <button
                      onClick={handleRequestHint}
                      disabled={loadingHint || hints.length >= 3}
                      className="w-full py-4 bg-white text-indigo-950 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-40"
                    >
                      {loadingHint ? 'Retrieving Vector...' : hints.length >= 3 ? 'Quota Reached' : 'Engage Heuristic Link'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {hints.map((hint, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-slate-950 border border-slate-800 rounded-[2rem] shadow-xl relative"
                      >
                        <span className="absolute -top-3 -left-3 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">0{idx + 1}</span>
                        <p className="text-xs text-slate-400 font-medium italic leading-relaxed pt-2">"{hint}"</p>
                      </motion.div>
                    ))}

                    <div className="flex justify-center gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${i <= hints.length ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'ai-generate' && (
                <motion.div
                  key="ai-generate"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-[2s]"></div>
                    <SparklesIcon className="w-12 h-12 text-white/30 mb-6 rotate-12" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">LeetCode Problem Generator</h3>
                    <p className="text-[10px] font-bold opacity-80 uppercase leading-relaxed tracking-widest mb-8">
                      Generate professional coding problems with test cases and constraints
                    </p>

                    <div className="space-y-6">
                      {/* Quick Template Selection */}
                      <div>
                        <label className="text-[9px] font-black text-white/80 uppercase tracking-widest block mb-3">Quick Templates</label>
                        <div className="grid grid-cols-3 gap-2">
                          {problemTemplates.map((template, index) => (
                            <button
                              key={index}
                              onClick={() => setAiConfig(prev => ({
                                ...prev,
                                subject: template.subject,
                                topic: template.topic,
                                difficulty: template.difficulty
                              }))}
                              className="p-3 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-medium hover:bg-white/20 transition-all text-left"
                            >
                              <div className="font-black text-white">{template.name}</div>
                              <div className="text-[8px] text-white/70 mt-1">{template.difficulty}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-white/80 uppercase tracking-widest block mb-2">Subject</label>
                          <select
                            value={aiConfig.subject}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-white/40 transition-colors"
                          >
                            <option value="Data Structures and Algorithms">Data Structures and Algorithms</option>
                            <option value="Algorithms">Algorithms</option>
                            <option value="Data Structures">Data Structures</option>
                            <option value="Problem Solving">Problem Solving</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-white/80 uppercase tracking-widest block mb-2">Topic</label>
                          <select
                            value={aiConfig.topic}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, topic: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-white/40 transition-colors"
                          >
                            {leetcodeCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-white/80 uppercase tracking-widest block mb-2">Difficulty</label>
                          <select
                            value={aiConfig.difficulty}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-white/40 transition-colors"
                          >
                            <option value="Easy">Easy 🟢</option>
                            <option value="Medium">Medium 🟡</option>
                            <option value="Hard">Hard 🔴</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-white/80 uppercase tracking-widest block mb-2">Problem Type</label>
                          <select
                            value={aiConfig.problemType}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, problemType: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-white/40 transition-colors"
                          >
                            <option value="LeetCode Style">LeetCode Style</option>
                            <option value="Interview Style">Interview Style</option>
                            <option value="Contest Style">Contest Style</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="includeTestCases"
                          checked={true}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/40"
                          readOnly
                        />
                        <label htmlFor="includeTestCases" className="text-[9px] font-black text-white/80 uppercase tracking-widest">
                          Include Test Cases & Constraints
                        </label>
                      </div>

                      <button
                        onClick={handleGenerateAIProblem}
                        disabled={aiLoading || !aiConfig.subject || !aiConfig.topic}
                        className="w-full py-4 bg-white text-indigo-950 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-50 transition-all shadow-xl disabled:opacity-40 flex items-center justify-center gap-3"
                      >
                        {aiLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-indigo-950 border-t-transparent rounded-full animate-spin"></div>
                            Generating Problem...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-5 h-5" />
                            Generate LeetCode Problem
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-6">
                      {generatedProblems.map((genProblem, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 bg-slate-950 border border-slate-800 rounded-[2rem] shadow-xl relative"
                        >
                          <span className="absolute -top-3 -left-3 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">AI</span>
                          
                          {/* LeetCode-style header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">
                                {genProblem.problemId && `${genProblem.problemId}. `}{genProblem.title || 'Generated Problem'}
                              </h4>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-black ${
                                  genProblem.difficulty === 'Easy' ? 'bg-green-600/20 text-green-400' :
                                  genProblem.difficulty === 'Medium' ? 'bg-yellow-600/20 text-yellow-400' :
                                  'bg-red-600/20 text-red-400'
                                }`}>
                                  {genProblem.difficulty || 'Medium'}
                                </span>
                                {genProblem.acceptanceRate && (
                                  <span className="text-[10px] text-slate-400">
                                    Acceptance: {genProblem.acceptanceRate}%
                                  </span>
                                )}
                                {genProblem.frequency && (
                                  <span className="text-[10px] text-slate-400">
                                    Frequency: {genProblem.frequency}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Companies</div>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {genProblem.companies?.map((company, i) => (
                                  <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[8px]">
                                    {company}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900 p-4 rounded-xl mb-4">
                            <h5 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3">Problem Statement</h5>
                            <p className="text-sm text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">{genProblem.description || 'No description available'}</p>
                          </div>

                          {genProblem.examples && genProblem.examples.length > 0 && (
                            <div className="space-y-3 mb-4">
                              <h5 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3">Examples</h5>
                              {genProblem.examples.map((ex, idx) => (
                                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest mb-2">Example {idx + 1}</div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-xs text-slate-400 font-black uppercase tracking-widest block mb-1">Input</span>
                                      <pre className="bg-slate-900 p-3 rounded-lg text-emerald-400 font-mono text-xs border border-white/5">{ex.input}</pre>
                                    </div>
                                    <div>
                                      <span className="text-xs text-slate-400 font-black uppercase tracking-widest block mb-1">Output</span>
                                      <pre className="bg-slate-900 p-3 rounded-lg text-amber-400 font-mono text-xs border border-white/5">{ex.output}</pre>
                                    </div>
                                  </div>
                                  {ex.explanation && (
                                    <div className="mt-3">
                                      <span className="text-xs text-slate-400 font-black uppercase tracking-widest block mb-1">Explanation</span>
                                      <p className="text-xs text-slate-300">{ex.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {genProblem.constraints && (
                            <div className="bg-slate-900 p-4 rounded-xl mb-4">
                              <h5 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-3">Constraints</h5>
                              <div className="font-mono text-xs text-rose-300/60 space-y-1">
                                {genProblem.constraints.split('\n').map((constraint, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <span className="text-rose-500/20">{idx + 1}.</span>
                                    <span>{constraint}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Topics and Related Topics */}
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase font-black mb-4">
                            <div className="flex items-center gap-2">
                              <span>Topics:</span>
                              <div className="flex gap-1">
                                {genProblem.tags?.map((tag, i) => (
                                  <span key={i} className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {genProblem.relatedTopics?.length > 0 && (
                              <div className="flex items-center gap-2">
                                <span>Related:</span>
                                <div className="flex gap-1">
                                  {genProblem.relatedTopics.map((topic, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 rounded">
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase font-black mt-4">
                            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-lg">Type: {genProblem.type || 'Coding'}</span>
                            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg">Category: {genProblem.category || 'DSA'}</span>
                            <button
                              onClick={() => {
                                setCode(genProblem.starterCode?.javascript || `// Generated Problem: ${genProblem.title}\n${genProblem.description}\nfunction solution(input) {\n  // TODO: Implement your solution\n  return result;\n}`);
                                setLanguage('javascript');
                                setActiveTab('description');
                              }}
                              className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                              Load to Editor
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {generatedProblems.length === 0 && !aiLoading && (
                        <div className="flex flex-col items-center justify-center py-40 opacity-20">
                          <SparklesIcon className="w-20 h-20 mb-6 text-indigo-500/30" />
                          <p className="text-[10px] font-black uppercase tracking-[0.5em] italic text-center">
                            No AI problems generated yet.<br />Configure subject and topic above.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Core Editor Environment */}
        <div className="flex-1 flex flex-col bg-slate-950 relative group">
          {/* File Tab */}
          <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center px-6">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></div>
              </div>
              <div className="h-4 w-px bg-slate-800 mx-2" />
              <div className="flex items-center gap-2">
                <CommandLineIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                  Source Matrix.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute left-0 top-0 w-12 h-full bg-slate-900/50 border-r border-white/5 flex flex-col items-center py-6 text-slate-700 font-mono text-[10px] select-none italic pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i} className="h-[26px] leading-[26px]">{i + 1}</div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => !isSolved && setCode(e.target.value)}
              readOnly={isSolved}
              spellCheck="false"
              className={`absolute left-12 top-0 right-0 bottom-0 bg-transparent text-indigo-100 font-mono text-[13px] p-6 h-full w-[calc(100%-48px)] resize-none focus:outline-none leading-[26px] selection:bg-indigo-500/30 custom-scrollbar ${isSolved ? 'opacity-30 cursor-not-allowed' : ''}`}
              placeholder="// Initialize logic sequence..."
            />

            {/* Matrix Completion Overlay */}
            <AnimatePresence>
              {isSolved && (
                <motion.div
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                  className="absolute inset-0 flex items-center justify-center bg-slate-950/40 z-50 p-12"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-xl w-full bg-slate-900 rounded-[4rem] border-2 border-emerald-500/20 p-16 shadow-[0_50px_100px_rgba(0,0,0,0.5),0_0_50px_rgba(16,185,129,0.1)] text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                      <CheckBadgeIcon className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic mb-4">Neural Verified</h2>
                    <p className="text-xs text-slate-500 font-black uppercase tracking-[0.4em] mb-12">Solution Matrix Successfully Integrated</p>

                    <div className="grid grid-cols-2 gap-6 mb-12">
                      <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-left group hover:border-emerald-500/30 transition-all">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-2 italic">Composite Latency</p>
                        <p className="text-3xl font-black text-emerald-400 italic">0{mySubmissions.find(s => s.status === 'accepted')?.runtime || 0} MS</p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-left group hover:border-emerald-500/30 transition-all">
                        <p className="text-[10px] text-slate-500 uppercase font-black mb-2 italic">Memory Intensity</p>
                        <p className="text-3xl font-black text-emerald-400 italic">0{Math.round(mySubmissions.find(s => s.status === 'accepted')?.memory || 0)} MB</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {contentContext?.pathId ? (() => {
                        const nextStep = getNextStepRoute();
                        return nextStep ? (
                          <button
                            onClick={() => navigate(nextStep.route, { state: nextStep.state })}
                            className="group flex items-center justify-center gap-4 w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl shadow-indigo-600/20"
                          >
                            Execute Next Step <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/student/learning-paths/${contentContext.pathId}`)}
                            className="flex items-center justify-center gap-4 w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl shadow-emerald-600/20"
                          >
                            Finalize Sequence Archive 🏆
                          </button>
                        );
                      })() : (
                        <button
                          onClick={() => navigate('/problems')}
                          className="flex items-center justify-center gap-4 w-full py-6 bg-slate-800 hover:bg-slate-700 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] transition-all border border-slate-700"
                        >
                          <ChevronLeftIcon className="w-5 h-5" /> Return to Library
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Console Terminal */}
          <div className={`h-[320px] bg-slate-900 border-t border-white/5 flex flex-col transition-all duration-700 relative z-30 ${!result && testResults.length === 0 ? 'translate-y-[280px]' : ''}`}>
            <div className="h-10 bg-black/40 border-b border-white/5 flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Host Console_Live</span>
              </div>
              <button onClick={() => { setResult(null); setTestResults([]); }} className="text-[9px] font-black text-rose-500/60 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]">Clear_Flush</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 font-mono text-sm custom-scrollbar bg-slate-950/30">
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`h-10 px-6 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-widest shadow-2xl ${result.status === 'accepted' || result.status === 'Run_Sync_Complete' ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30' : 'bg-rose-600/20 text-rose-500 border border-rose-500/30'
                        }`}>
                        {result.status}
                      </div>
                      {result.message && <p className="text-rose-400 text-xs font-bold italic">{result.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Latency</p>
                        <p className="text-white font-black text-lg italic">{result.runtime || 0}ms</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Heap Allocation</p>
                        <p className="text-white font-black text-lg italic">{Math.round(result.memory || 0)}MB</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {testResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testResults.map((test, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-5 rounded-[1.5rem] border flex flex-col justify-between transition-all ${test.passed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Case #0{idx + 1}</span>
                          <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${test.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {test.passed ? <CheckBadgeIcon className="w-4 h-4" /> : <ExclamationCircleIcon className="w-4 h-4" />}
                            {test.passed ? 'Verified' : 'Fault'}
                          </div>
                        </div>

                        {!test.passed && (
                          <div className="space-y-3 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Expected_Trace</p>
                              <code className="text-emerald-400 text-xs break-all">{JSON.stringify(test.expected)}</code>
                            </div>
                            <div>
                              <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Actual_Output</p>
                              <code className="text-rose-400 text-xs break-all">{JSON.stringify(test.actual) || 'NULL'}</code>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : !result && (
                  <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                    <CommandLineIcon className="w-12 h-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Awaiting Console Signal...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
