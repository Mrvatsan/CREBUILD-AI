/**
 * IntentBridge — Main Application Component
 * Version: 3.0.0
 * Last Updated: 2026-02-26
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Send, Sparkles, MessageSquare, Map, ChevronDown, Zap, Layers, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api/v1';

const formatFriendlyTitle = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());

/* ─────────────────────────── APP ─────────────────────────── */
function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const apiClient = useMemo(() => axios.create({ baseURL: API_BASE }), []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  /* ── Clarity score ── */
  const clarityScore = useMemo(() => {
    if (plan) return 95;
    if (loading) return 67;
    return Math.min(40 + messages.length * 8, 72);
  }, [messages.length, loading, plan]);

  const clarityColor =
    clarityScore >= 80 ? 'text-aurora-400' : clarityScore >= 50 ? 'text-amber-400' : 'text-rose-400';
  const clarityBg =
    clarityScore >= 80 ? 'bg-aurora-500' : clarityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  /* ── Helpers ── */
  const stringifyNode = (node) => {
    if (node === null || node === undefined) return '—';
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (Array.isArray(node))
      return node.map((item) => stringifyNode(item)).join(' · ');
    return JSON.stringify(node, null, 2);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const historyPayload = [...messages, userMessage];
      const response = await apiClient.post('/process', {
        session_id: sessionId,
        user_input: input,
        history: historyPayload,
      });

      const result = response.data;
      if (result.status === 'clarification_needed') {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: result.analysis,
            questions: result.questions,
          },
        ]);
      } else if (result.status === 'plan_generated') {
        setMessages((prev) => [
          ...prev,
          { role: 'system', content: 'Your execution plan is ready! Check the Roadmap panel →' },
        ]);
        setPlan(result.plan);
      }
    } catch (error) {
      console.error('Error processing intent:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  /* ── Plan sections ── */
  const planSections = useMemo(() => {
    if (!plan) return [];
    return Object.entries(plan).map(([key, value]) => ({
      key,
      title: formatFriendlyTitle(key),
      content: value,
    }));
  }, [plan]);

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="relative min-h-screen bg-midnight-900 font-sans text-slate-100 overflow-hidden">

      {/* ── BACKGROUND ORBS ── */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-aurora-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />

      <div className="relative z-10 flex flex-col h-screen">
        {/* ── NAVBAR ── */}
        <nav className="sticky top-0 z-50 glass-header">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-400 to-indigo-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative h-9 w-9 rounded-xl bg-midnight-800 border border-white/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-aurora-400" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  IntentBridge
                </h1>
                <p className="text-[10px] font-bold text-aurora-500/80 uppercase tracking-[0.15em] -mt-0.5">
                  AI Project Synthesizer
                </p>
              </div>
            </motion.div>

            {/* Status bar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-5"
            >
              {/* Clarity meter */}
              <div className="hidden sm:flex items-center gap-3 bg-midnight-800/50 rounded-full px-4 py-2 border border-white/5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Clarity</span>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(20,184,166,0.5)] ${clarityBg}`}
                    style={{ width: `${clarityScore}%` }}
                  />
                </div>
                <span className={`text-sm font-bold tabular-nums drop-shadow-md ${clarityColor}`}>{clarityScore}%</span>
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-aurora-500" />
                </span>
                Online
              </div>
            </motion.div>
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col min-h-0">
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

            {/* ════════════════ CHAT PANEL ════════════════ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-5 glass-panel rounded-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Chat header */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-200">Session</h2>
                    <p className="text-[11px] text-slate-500">Describe your project idea</p>
                  </div>
                </div>
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 text-xs font-medium text-aurora-400 bg-aurora-900/20 px-3 py-1.5 rounded-full border border-aurora-500/20"
                    >
                      <div className="h-3.5 w-3.5 border-2 border-aurora-500 border-t-transparent rounded-full animate-spin" />
                      Analyzing
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-8">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-5 border border-blue-100">
                      <Sparkles className="h-7 w-7 text-blue-500" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 mb-2">Start a conversation</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                      Tell me about the project you want to build — I'll help you create a complete execution plan.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {['Build a SaaS app', 'Create an API', 'Design a dashboard'].map((hint) => (
                        <button
                          key={hint}
                          onClick={() => setInput(hint)}
                          className="text-xs font-medium text-slate-500 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-blue-200 transition-all duration-200"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user'
                          ? 'bg-gradient-to-br from-aurora-400 to-aurora-600 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                          : 'bg-midnight-800 border border-white/10'
                          }`}
                      >
                        {m.role === 'user' ? (
                          <User className="h-4 w-4 text-midnight-900" />
                        ) : (
                          <Bot className="h-4 w-4 text-slate-400" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[82%] px-4 py-3.5 text-[14px] leading-relaxed shadow-lg ${m.role === 'user'
                          ? 'bg-gradient-to-br from-midnight-700 to-midnight-800 border border-aurora-500/20 text-slate-100 rounded-2xl rounded-br-sm'
                          : 'bg-white/5 border border-white/10 text-slate-300 rounded-2xl rounded-bl-sm backdrop-blur-md'
                          }`}
                      >
                        <p>{m.content}</p>
                        {m.questions && m.questions.length > 0 && (
                          <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                            {m.questions.map((q, qi) => (
                              <li
                                key={qi}
                                className="flex items-start gap-2.5 text-[13px] text-slate-400 bg-black/20 px-3.5 py-2.5 rounded-xl"
                              >
                                <ChevronDown className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                                {q}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-end gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-midnight-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-aurora-500 animate-bounce [animation-delay:0ms]" />
                          <div className="h-2 w-2 rounded-full bg-aurora-500 animate-bounce [animation-delay:150ms]" />
                          <div className="h-2 w-2 rounded-full bg-aurora-500 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="p-4 bg-white/[0.02] border-t border-white/5 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="flex items-center gap-3 group">
                  <div className="relative flex-1">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-500/20 to-indigo-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="relative w-full bg-midnight-900 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-aurora-500/50 transition-all shadow-inner"
                      placeholder="Sequence initialization parameters..."
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="relative h-[52px] w-[52px] rounded-xl bg-aurora-600 hover:bg-aurora-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border overflow-hidden disabled:border-white/5 disabled:cursor-not-allowed text-midnight-900 flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] active:scale-95 group/btn"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none group-hover/btn:opacity-0 transition-opacity" />
                    <Send className="h-5 w-5 ml-1" />
                  </button>
                </form>
              </div>
            </motion.section>

            {/* ════════════════ ROADMAP PANEL ════════════════ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-7 glass-panel rounded-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Roadmap header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-aurora-500/10 border border-aurora-500/20 flex items-center justify-center">
                    <Map className="h-4.5 w-4.5 text-aurora-400" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-200">Execution Matrix</h2>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">Architecture & Plan</p>
                  </div>
                </div>
                <AnimatePresence>
                  {plan && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-aurora-300 bg-aurora-900/40 px-3 py-1.5 rounded-full border border-aurora-500/30 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-aurora-400 animate-pulse" />
                      Plan Synthesized
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Roadmap body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar">
                {!plan ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-8">
                    <div className="relative group mb-6">
                      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition duration-1000 animate-pulse-slow"></div>
                      <div className="relative h-20 w-20 rounded-2xl bg-midnight-800 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                        <Layers className="h-8 w-8 text-indigo-400/50 group-hover:text-indigo-400 transition-colors duration-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-300 mb-2">Awaiting Parameters</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                      Provide project specifications in the session terminal. A comprehensive technical roadmap will be rendered here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {planSections.map(({ key, title, content }, index) => (
                      <motion.article
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
                        className="relative"
                      >
                        {/* Section line connector (except last) */}
                        {index !== planSections.length - 1 && (
                          <div className="absolute left-[15px] top-[30px] bottom-[-40px] w-px bg-gradient-to-b from-aurora-500/50 to-transparent z-0" />
                        )}

                        {/* Section header */}
                        <div className="flex items-center gap-4 mb-5 relative z-10">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-aurora-500 rounded-lg blur opacity-30"></div>
                            <span className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-midnight-800 text-aurora-400 text-[13px] font-black border border-aurora-500/50">
                              {index + 1}
                            </span>
                          </div>
                          <h3 className="text-[16px] font-bold text-slate-100 tracking-wide">{title}</h3>
                          <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        {/* Section content */}
                        <div className="ml-12 text-[14px] text-slate-300 leading-relaxed">
                          {typeof content === 'object' && content !== null ? (
                            <div className="space-y-4">
                              {Object.entries(content).map(([subKey, subValue]) => (
                                <motion.div
                                  key={subKey}
                                  whileHover={{ y: -2, scale: 1.005 }}
                                  className="bg-midnight-800/50 p-5 rounded-xl border border-white/5 hover:border-aurora-500/20 hover:bg-midnight-800/80 transition-all duration-300 shadow-lg"
                                >
                                  <h4 className="text-[11px] font-bold text-aurora-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-aurora-500" />
                                    {formatFriendlyTitle(subKey)}
                                  </h4>
                                  <div className="text-slate-300 whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                                    {stringifyNode(subValue)}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <motion.div
                              whileHover={{ y: -2 }}
                              className="bg-midnight-800/50 p-5 rounded-xl border border-white/5 hover:border-aurora-500/20 transition-all duration-300"
                            >
                              <div className="text-slate-300 whitespace-pre-wrap font-mono text-[13px] leading-relaxed">{stringifyNode(content)}</div>
                            </motion.div>
                          )}
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </div>
            </motion.section>

          </main>

        </div>
      </div>
    </div>
  );
}

export default App;
