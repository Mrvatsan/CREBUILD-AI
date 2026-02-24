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

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto">
        <Header />
      </div>
    </div>
  );
}

export default App;
