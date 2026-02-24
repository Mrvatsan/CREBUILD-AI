/**
 * IntentBridge - Main Application Component
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setInput('');
  };

  const Header = () => (
    <header className="mb-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 font-display">IntentBridge</h1>
      <p className="mt-1 text-xs text-gray-500 font-medium uppercase tracking-wider">Synthesis Engine</p>
    </header>
  );

  const StreamPanel = () => (
    <section className="panel-card flex flex-col h-[600px] overflow-hidden">
      <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-gray-900">Conversation</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{clarityScore}% Clarity</span>
          {loading && <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm font-medium">Describe your initiative to begin the synthesis process.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user'
              ? 'bg-blue-50 text-blue-900 border border-blue-100'
              : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
              }`}>
              <p>{m.content}</p>
            </div>
          </div>
        ))}
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
        {/* Roadmap content placeholder */}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto relative">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <StreamPanel />
          <RoadmapPanel />
        </div>

        <footer className="mt-8 text-center text-gray-400 text-[11px] font-medium tracking-widest uppercase">
          IntentBridge Enterprise &copy; 2026
        </footer>
      </div>
    </div>
  );
}

export default App;
