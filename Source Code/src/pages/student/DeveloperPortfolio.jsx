import React, { useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CodeBracketSquareIcon, CommandLineIcon, BoltIcon, FireIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon, IdentificationIcon, StarIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '../../store/authStore';
import studentService from '../../services/api/studentService';
import { XMarkIcon, PlusIcon, TrashIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import API_BASE_URL from '../../config/api';

const SKILL_STYLES = {
  yellow: { text: 'text-yellow-400', bar: 'bg-yellow-500' },
  blue: { text: 'text-blue-400', bar: 'bg-blue-500' },
  emerald: { text: 'text-emerald-400', bar: 'bg-emerald-500' },
  green: { text: 'text-green-400', bar: 'bg-green-500' },
  indigo: { text: 'text-indigo-400', bar: 'bg-indigo-500' }
};

export default function DeveloperPortfolio() {
  const { user } = useAuthStore();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);
  const { scrollYProgress } = useScroll();
  const scaleTitle = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacityTitle = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const el = document.documentElement;
    if (editing) {
      el.style.overflow = 'hidden';
    } else {
      el.style.overflow = '';
    }
    return () => {
      el.style.overflow = '';
    };
  }, [editing]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await studentService.getPortfolio();
        setPortfolio(res?.data || null);
      } catch (e) {
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const skills = useMemo(() => portfolio?.skills || [], [portfolio]);
  const projects = useMemo(() => portfolio?.projects || [], [portfolio]);

  const firstName = (user?.firstName || user?.name || user?.email || 'Student').split(' ')[0];
  const lastNameInitial = (user?.lastName || '').charAt(0);
  const displayName = `${firstName}${lastNameInitial ? ' ' + lastNameInitial + '.' : ''}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  const publicPortfolioUrl = `${API_BASE_URL}/student/portfolio/public/${user?._id || user?.id || ''}`;

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-slate-950 text-white font-sans">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-indigo-900/40 via-slate-900/10 to-transparent" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20"
      >
        <motion.div style={{ scale: scaleTitle, opacity: opacityTitle }} className="text-center mb-8 sm:mb-12">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-800 rounded-full mx-auto mb-6 border-4 border-indigo-500/30 flex items-center justify-center p-2">
            <UserCircleIcon className="w-full h-full text-indigo-400 opacity-80" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tight italic leading-none mb-4">
            {displayName}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-bold uppercase tracking-[0.18em] italic mb-6">
            {portfolio?.headline || 'Developer Portfolio'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="bg-white/5 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <StarIcon className="w-4 h-4" /> Top 5% Cohort
            </span>
            <span className="bg-white/5 px-4 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <FireIcon className="w-4 h-4" /> 16 Day Streak
            </span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setDraft(JSON.parse(JSON.stringify(portfolio || { skills: [], projects: [], visibility: 'private' }))); setEditing(true); }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" /> Edit Portfolio
            </button>
            {portfolio?.visibility === 'public' ? (
              <a
                href={publicPortfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 transition-colors"
              >
                Public Link
              </a>
            ) : (
              <span className="px-6 py-3 bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 opacity-60 cursor-not-allowed">
                Public Link (Private)
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          <div className="xl:col-span-5 min-w-0 space-y-6 sm:space-y-8">
            <section className="bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight italic mb-6 flex items-center gap-3">
                <CodeBracketSquareIcon className="w-7 h-7 text-indigo-500" /> Vectors
              </h2>
              <div className="space-y-6">
                {skills.length === 0 && (
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No skills added yet</p>
                )}
                {skills.map((skill, index) => {
                  const style = SKILL_STYLES[skill.color] || SKILL_STYLES.indigo;
                  return (
                    <div key={index} className="min-w-0">
                      <div className="flex justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                        <span className="truncate">{skill.name}</span>
                        <span className={style.text}>{skill.level}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden p-0.5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.08 * index }}
                          className={`${style.bar} h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 text-center">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight italic mb-4">Export Node</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-6">
                Generate a one-click shareable PDF to send to recruiters and engineering managers.
              </p>
              <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 hover:scale-[1.02] transition-all duration-200 text-white rounded-2xl font-black uppercase tracking-[0.18em] shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:shadow-[0_0_40px_rgba(79,70,229,0.7)] flex items-center justify-center gap-3 italic">
                <IdentificationIcon className="w-5 h-5" /> Export Architecture
              </button>
            </section>
          </div>

          <div className="xl:col-span-7 min-w-0 space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight italic mb-4 sm:mb-6 flex items-center gap-3 text-white">
              <CommandLineIcon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-indigo-500" /> Architected Hubs
            </h2>

            {projects.length === 0 && (
              <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900 text-slate-400 text-xs font-black uppercase tracking-widest text-center">
                No projects yet
              </div>
            )}
            {projects.map((proj, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.12 * idx }}
                key={idx}
                className="bg-slate-900 p-5 sm:p-6 lg:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-800 group hover:border-indigo-500/50 transition-colors min-w-0"
              >
                <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors break-words">
                    {proj.title}
                  </h3>
                  {proj.link && (
                  <a href={proj.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-2 rounded-full border border-slate-800 hover:text-white transition-colors flex items-center gap-2">
                    <BoltIcon className="w-3 h-3" /> Execute
                  </a>
                  )}
                </div>
                <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed mb-6 break-words">
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(proj.tech || []).map((t, i) => (
                    <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-indigo-950/50 border border-indigo-800/50 text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-900/50 transition-colors">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {editing && (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-lg font-black uppercase tracking-widest text-white">Edit Portfolio</h3>
              <button onClick={() => setEditing(false)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto flex-1">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Headline</label>
                <input
                  value={draft?.headline || ''}
                  onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-colors"
                  placeholder="e.g. Full-Stack Engineer // Systems Design"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Visibility</label>
                <select
                  value={draft?.visibility || 'private'}
                  onChange={(e) => setDraft({ ...draft, visibility: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white transition-colors"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skills</label>
                <div className="space-y-3">
                  {(draft?.skills || []).map((s, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                      <input
                        value={s.name}
                        onChange={(e) => {
                          const next = [...draft.skills]; next[idx].name = e.target.value; setDraft({ ...draft, skills: next });
                        }}
                        className="col-span-5 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-colors"
                        placeholder="Skill name"
                      />
                      <input
                        type="number"
                        value={s.level}
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const next = [...draft.skills]; next[idx].level = Number(e.target.value); setDraft({ ...draft, skills: next });
                        }}
                        className="col-span-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-colors"
                        placeholder="Level"
                      />
                      <select
                        value={s.color}
                        onChange={(e) => {
                          const next = [...draft.skills]; next[idx].color = e.target.value; setDraft({ ...draft, skills: next });
                        }}
                        className="col-span-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white transition-colors"
                      >
                        <option value="indigo">Indigo</option>
                        <option value="yellow">Yellow</option>
                        <option value="blue">Blue</option>
                        <option value="emerald">Emerald</option>
                        <option value="green">Green</option>
                      </select>
                      <button
                        onClick={() => {
                          const next = [...draft.skills]; next.splice(idx, 1); setDraft({ ...draft, skills: next });
                        }}
                        className="col-span-1 p-3 bg-rose-600 text-white rounded-xl"
                        title="Remove"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setDraft({ ...draft, skills: [...(draft?.skills || []), { name: '', level: 0, color: 'indigo' }] })}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Skill
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Projects</label>
                <div className="space-y-3">
                  {(draft?.projects || []).map((p, idx) => (
                    <div key={idx} className="space-y-2 border border-slate-800 rounded-2xl p-4">
                      <div className="grid grid-cols-12 gap-3">
                        <input
                          value={p.title}
                          onChange={(e) => {
                            const next = [...draft.projects]; next[idx].title = e.target.value; setDraft({ ...draft, projects: next });
                          }}
                          className="col-span-7 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-colors"
                          placeholder="Project title"
                        />
                        <input
                          value={p.link}
                          onChange={(e) => {
                            const next = [...draft.projects]; next[idx].link = e.target.value; setDraft({ ...draft, projects: next });
                          }}
                          className="col-span-4 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-colors"
                          placeholder="https://..."
                        />
                        <button
                          onClick={() => {
                            const next = [...draft.projects]; next.splice(idx, 1); setDraft({ ...draft, projects: next });
                          }}
                          className="col-span-1 p-3 bg-rose-600 text-white rounded-xl"
                          title="Remove"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={p.description}
                        onChange={(e) => {
                          const next = [...draft.projects]; next[idx].description = e.target.value; setDraft({ ...draft, projects: next });
                        }}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-colors resize-none"
                        placeholder="Brief description"
                      />
                      <input
                        value={(p.tech || []).join(', ')}
                        onChange={(e) => {
                          const next = [...draft.projects]; next[idx].tech = e.target.value.split(',').map(s => s.trim()).filter(Boolean); setDraft({ ...draft, projects: next });
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500/40 text-white placeholder:text-slate-500 transition-colors"
                        placeholder="Tech stack, comma-separated"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setDraft({ ...draft, projects: [...(draft?.projects || []), { title: '', description: '', link: '', tech: [] }] })}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" /> Add Project
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setEditing(false)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const res = await studentService.updatePortfolio({
                      headline: draft.headline,
                      visibility: draft.visibility,
                      skills: draft.skills,
                      projects: draft.projects
                    });
                    setPortfolio(res?.data || draft);
                    setEditing(false);
                  } catch (e) {
                  } finally {
                    setSaving(false);
                  }
                }}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
