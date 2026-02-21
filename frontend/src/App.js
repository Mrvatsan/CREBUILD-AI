/**
 * IntentBridge - Main Application Component
 *
 * Provides the primary user interface with a dual-panel layout:
 * - Left panel: Chat interface for submitting ideas and receiving AI feedback
 * - Right panel: Execution roadmap viewer displaying generated plans
 *
 * Communicates with the FastAPI backend via the /api/v1/process endpoint.
 * Handles session management, message history, and loading states.
 *
 * @module App
 */
import React, { useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api/v1';

const quickIdeas = [
  {
    title: 'Zero-touch onboarding',
    prompt: 'Design an automated onboarding concierge for SaaS customers with proactive nudges and KPI tracking.'
  },
  {
    title: 'AI release radar',
    prompt: 'Create a weekly release radar that prioritizes engineering workstreams and surfaces risk signals.'
  },
  {
    title: 'Growth experiment lab',
    prompt: 'Outline a growth lab that runs multi-channel experiments with resource, timeline, and impact modeling.'
  }
];

const formatFriendlyTitle = (key) => key
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/_/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/^\w/, (c) => c.toUpperCase());

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [sessionId] = useState(`session_${Math.random().toString(36).substr(2, 9)}`);
  const apiClient = useMemo(() => axios.create({ baseURL: API_BASE }), []);

  const stats = useMemo(() => [
    {
      label: 'Session',
      value: sessionId.split('_')[1].slice(-4).toUpperCase(),
      meta: 'Live link'
    },
    {
      label: 'Dialog turns',
      value: messages.length || '00',
      meta: 'Context depth'
    },
    {
      label: 'State',
      value: plan ? 'Execution ready' : loading ? 'Synthesizing' : 'Listening',
      meta: plan ? 'Roadmap locked' : 'Awaiting clarity'
    }
  ], [messages.length, loading, plan, sessionId]);

  const clarityScore = useMemo(() => {
    if (plan) return 92;
    if (loading) return 67;
    return Math.min(48 + messages.length * 6, 72);
  }, [messages.length, loading, plan]);

  const planSections = useMemo(() => {
    if (!plan) return [];
    return Object.entries(plan).map(([key, value]) => ({
      key,
      title: formatFriendlyTitle(key),
      content: value
    }));
  }, [plan]);

  const stringifyNode = (node) => {
    if (node === null || node === undefined) return '—';
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (Array.isArray(node)) return node.map((item) => stringifyNode(item)).join(' • ');
    return JSON.stringify(node, null, 2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const historyPayload = [...messages, userMessage];
      const response = await apiClient.post('/process', {
        session_id: sessionId,
        user_input: input,
        history: historyPayload
      });

      const result = response.data;
      if (result.status === 'clarification_needed') {
        const systemMessage = { 
          role: 'system', 
          content: result.analysis, 
          questions: result.questions 
        };
        setMessages(prev => [...prev, systemMessage]);
      } else if (result.status === 'plan_generated') {
        const systemMessage = { 
          role: 'system', 
          content: 'I have generated a full execution plan for you.'
        };
        setMessages(prev => [...prev, systemMessage]);
        setPlan(result.plan);
      }
    } catch (error) {
      console.error('Error processing intent:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Error connecting to the bridge. Please check the backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="visual-gradient" />
      <div className="visual-grid" />

      <div className="relative z-10 px-6 py-10 md:px-10">
        <header className="max-w-6xl mx-auto glass-panel rounded-3xl border border-white/5 p-8 md:p-10 mb-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.45em] text-slate-400">Strategy cockpit</p>
              <h1 className="mt-4 text-4xl md:text-5xl font-display font-semibold text-white">IntentBridge</h1>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl">
                Translate raw intent into orchestrated execution paths. The bridge listens, clarifies, and returns a board-ready plan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg shadow-blue-900/20">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-semibold text-white mt-2">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{stat.meta}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            {quickIdeas.map(({ title, prompt }) => (
              <button
                key={title}
                type="button"
                onClick={() => setInput(prompt)}
                className="quick-chip"
              >
                <span className="text-xs uppercase tracking-[0.4em] text-blue-200">{title}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-8">
          {/* Chat Section */}
          <section className="glass-panel rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display">Conversation stream</h2>
                <p className="text-sm text-slate-400">Live intent parsing with contextual memory.</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Clarity</p>
                <p className="text-3xl font-semibold text-sky-300">{clarityScore}%</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2 scrollbar">
              {messages.length === 0 && !loading && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-slate-400 text-sm">
                  Drop the rough shape of the initiative. The bridge will probe for ambiguity and craft the execution spine.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={`${m.role}-${i}`} className="relative flex gap-3">
                  <div className={`mt-1 h-9 w-9 flex items-center justify-center rounded-full text-xs font-semibold tracking-widest ${m.role === 'user' ? 'bg-blue-500/20 text-blue-200 border border-blue-400/40' : 'bg-white/10 text-white border border-white/10'}`}>
                    {m.role === 'user' ? 'YOU' : 'AI'}
                  </div>
                  <div className={`flex-1 rounded-3xl border p-5 text-sm leading-relaxed ${m.role === 'user' ? 'border-blue-500/30 bg-blue-500/10 shadow-blue-900/30' : 'border-white/10 bg-white/5 shadow-black/10'}`}>
                    <p className="text-slate-100">{m.content}</p>
                    {m.questions && (
                      <div className="mt-4">
                        <p className="text-[0.65rem] uppercase tracking-[0.5em] text-slate-400 mb-2">Clarify</p>
                        <ul className="space-y-2 text-slate-100">
                          {m.questions.map((q, j) => (
                            <li key={`${q}-${j}`} className="flex gap-2">
                              <span className="text-blue-300">•</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  Bridge is synthesizing your intent...
                </div>
              )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-700 border-none rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your idea..."
            />
            <button className="bg-blue-500 px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">Send</button>
          </form>
          </section>

        {/* Plan Section */}
          <section className="glass-panel rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col h-[600px]">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Execution Roadmap</h2>
          {plan ? (
            <div className="space-y-6">
              <section>
                <h3 className="text-blue-400 font-semibold">Product Definition</h3>
                <pre className="text-xs text-gray-300 mt-2 whitespace-pre-wrap">{JSON.stringify(plan.ProductDefinition || plan.product_definition, null, 2)}</pre>
              </section>
              <section>
                <h3 className="text-blue-400 font-semibold">Architecture</h3>
                <pre className="text-xs text-gray-300 mt-2 whitespace-pre-wrap">{JSON.stringify(plan.TechnicalArchitecture || plan.technical_architecture, null, 2)}</pre>
              </section>
            </div>
          ) : (
            <div className="text-gray-500 flex items-center justify-center h-full">Your plan will appear here...</div>
          )}
          </section>
      </main>
      </div>
    </div>
  );
}

export default App;
