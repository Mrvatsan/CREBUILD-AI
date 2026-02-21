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
        <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-blue-400">IntentBridge</h1>
        <p className="text-gray-400">Convert vague ideas into structured execution plans.</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chat Section */}
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-600 ml-8' : 'bg-gray-700 mr-8'}`}>
                <p>{m.content}</p>
                {m.questions && (
                  <ul className="mt-2 list-disc list-inside text-blue-300">
                    {m.questions.map((q, j) => <li key={j}>{q}</li>)}
                  </ul>
                )}
              </div>
            ))}
            {loading && <div className="text-gray-500 italic">Bridge is processing...</div>}
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
        </div>

        {/* Plan Section */}
        <div className="bg-gray-800 rounded-xl p-6 overflow-y-auto h-[600px]">
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
        </div>
      </main>
      </div>
    </div>
  );
}

export default App;
