/**
 * IntentBridge — Main Application Component
 * Version: 3.0.0
 * Last Updated: 2026-02-26
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Send, Sparkles, MessageSquare, Map, ChevronDown, Zap, Layers, Bot, User } from 'lucide-react';

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
    clarityScore >= 80 ? 'text-emerald-500' : clarityScore >= 50 ? 'text-amber-500' : 'text-rose-400';
  const clarityBg =
    clarityScore >= 80 ? 'bg-emerald-500' : clarityScore >= 50 ? 'bg-amber-500' : 'bg-rose-400';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 font-['Inter',system-ui,sans-serif] text-slate-800">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                IntentBridge
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] -mt-0.5">
                AI Project Synthesizer
              </p>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-5">
            {/* Clarity meter */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 rounded-full px-4 py-2 border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Clarity</span>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${clarityBg}`}
                  style={{ width: `${clarityScore}%` }}
                />
              </div>
              <span className={`text-sm font-bold tabular-nums ${clarityColor}`}>{clarityScore}%</span>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Online
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ════════════════ CHAT PANEL ════════════════ */}
          <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 flex flex-col h-[calc(100vh-160px)] overflow-hidden">
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Conversation</h2>
                  <p className="text-[11px] text-slate-400">Describe your project idea</p>
                </div>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-xs font-medium text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">
                  <div className="h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Processing
                </div>
              )}
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

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2.5 animate-slide-up ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                      m.role === 'user'
                        ? 'bg-blue-600 shadow-md shadow-blue-500/25'
                        : 'bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <User className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-slate-500" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-md shadow-md shadow-blue-500/15'
                        : 'bg-slate-50 border border-slate-200/80 text-slate-700 rounded-2xl rounded-bl-md'
                    }`}
                  >
                    <p>{m.content}</p>
                    {m.questions && m.questions.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-slate-200/50 pt-3">
                        {m.questions.map((q, qi) => (
                          <li
                            key={qi}
                            className="flex items-start gap-2 text-[12px] text-slate-600 bg-white/60 px-3 py-2 rounded-lg"
                          >
                            <ChevronDown className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                            {q}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-end gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-bl-md px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  placeholder="Describe your project idea..."
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </section>

          {/* ════════════════ ROADMAP PANEL ════════════════ */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/50 flex flex-col h-[calc(100vh-160px)] overflow-hidden">
            {/* Roadmap header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Map className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Execution Roadmap</h2>
                  <p className="text-[11px] text-slate-400">Generated plan &amp; architecture</p>
                </div>
              </div>
              {plan && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Plan Ready
                </span>
              )}
            </div>

            {/* Roadmap body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar">
              {!plan && (
                <div className="h-full flex flex-col items-center justify-center text-center px-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-5 border border-indigo-100">
                    <Layers className="h-7 w-7 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 mb-2">No plan yet</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                    Once you describe your project and answer any clarifying questions, your full execution roadmap will appear here.
                  </p>
                </div>
              )}

              {plan &&
                planSections.map(({ key, title, content }, index) => (
                  <article key={key} className="animate-slide-up" style={{ animationDelay: `${index * 60}ms` }}>
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
                        {index + 1}
                      </span>
                      <h3 className="text-[13px] font-semibold text-slate-700">{title}</h3>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    {/* Section content */}
                    <div className="ml-9 text-[13px] text-slate-600 leading-relaxed">
                      {typeof content === 'object' && content !== null ? (
                        <div className="space-y-3">
                          {Object.entries(content).map(([subKey, subValue]) => (
                            <div
                              key={subKey}
                              className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors duration-200"
                            >
                              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {formatFriendlyTitle(subKey)}
                              </h4>
                              <div className="text-slate-700 whitespace-pre-wrap">
                                {stringifyNode(subValue)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="text-slate-700 whitespace-pre-wrap">{stringifyNode(content)}</div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
            </div>
          </section>

        </main>

        <footer className="mt-12 text-center text-xs text-[#64748B] font-medium tracking-widest uppercase pb-8">
          IntentBridge Enterprise &copy; 2026 • Intelligent Synthesis
        </footer>
      </div>
    </div>
  );
}

export default App;
