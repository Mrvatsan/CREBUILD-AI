/**
 * IntentBridge - Main Application Component
 * Version: 2.1.0-refresh
 * Last Updated: 2026-02-24
 */
import React, { useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api/v1';

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

  const clarityScore = useMemo(() => {
    if (plan) return 92;
    if (loading) return 67;
    return Math.min(48 + messages.length * 6, 72);
  }, [messages.length, loading, plan]);

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
      setMessages(prev => [...prev, { role: 'system', content: 'Error connecting to the bridge.' }]);
    } finally {
      setLoading(false);
    }
  };

  const Header = () => (
    <header className="flex items-center justify-between mb-8 pb-6 border-b border-[#E2E8F0]">
      <div>
        <h1 className="text-xl font-bold text-[#1E293B]">IntentBridge</h1>
        <p className="text-xs text-[#64748B] font-medium uppercase tracking-wider">Project Synthesis Engine</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">Clarity Score</span>
          <span className={`text-sm font-bold ${clarityScore > 80 ? 'text-green-500' : 'text-blue-500'}`}>{clarityScore}%</span>
        </div>
        <div className="h-8 w-[1px] bg-[#E2E8F0]" />
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-[#E2E8F0] shadow-sm">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
    </header>
  );

  const StreamPanel = () => (
    <section className="saas-card flex flex-col h-[650px] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <h2 className="text-sm font-semibold">Project Conversation</h2>
        {loading && <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 border-2 border-dashed border-[#E2E8F0] rounded-2xl mx-2">
            <p className="text-sm text-[#64748B] font-medium leading-relaxed">
              Define your initiative to begin the synthesis process.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${m.role === 'user'
                ? 'bg-[#3B82F6] text-white rounded-tr-none'
                : 'bg-white border border-[#E2E8F0] text-[#1E293B] rounded-tl-none'
              }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium px-2 italic">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
            Synthesizing intelligence...
          </div>
        )}
      </div>

      <div className="p-5 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="saas-input flex-1 bg-white"
            placeholder="Type your intent..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="saas-button-primary">
            Send
          </button>
        </form>
      </div>
    </section>
  );

  const planSections = useMemo(() => {
    if (!plan) return [];
    return Object.entries(plan).map(([key, value]) => ({
      key,
      title: formatFriendlyTitle(key),
      content: value
    }));
  }, [plan]);

  const RoadmapPanel = () => (
    <section className="panel-card flex flex-col h-[600px] overflow-hidden">
      <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white/50 backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-gray-900">Execution Roadmap</h2>
        {plan && <div className="px-2 py-0.5 rounded bg-green-50 border border-green-100 text-[10px] font-bold text-green-600 uppercase tracking-widest">Live</div>}
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar">
        {!plan && !loading && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
            <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">Roadmap will manifest here.</p>
          </div>
        )}
        {plan && planSections.map(({ key, title, content }) => (
          <article key={key} className="space-y-4 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gray-100" />
              <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] whitespace-nowrap">{title}</h3>
              <div className="h-[1px] flex-1 bg-gray-100" />
            </div>
            <div className="text-[14px] text-gray-600 leading-relaxed">
              {typeof content === 'object' && !Array.isArray(content) ? (
                <div className="space-y-4">
                  {Object.entries(content).map(([subKey, subValue]) => (
                    <div key={subKey} className="group">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-1.5">{formatFriendlyTitle(subKey)}</h4>
                      <div className="text-gray-900 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                        {stringifyNode(subValue)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 text-gray-900">
                  {stringifyNode(content)}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-['Inter',sans-serif] text-[#1E293B]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <Header />

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <StreamPanel />
          <RoadmapPanel />
        </main>

        <footer className="mt-12 text-center text-xs text-[#64748B] font-medium tracking-widest uppercase pb-8">
          IntentBridge Enterprise &copy; 2026 • Intelligent Synthesis
        </footer>
      </div>
    </div>
  );
}

export default App;
