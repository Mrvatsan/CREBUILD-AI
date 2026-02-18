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

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [sessionId] = useState(`session_${Math.random().toString(36).substr(2, 9)}`);
  const apiClient = useMemo(() => axios.create({ baseURL: API_BASE }), []);

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
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
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
  );
}

export default App;
