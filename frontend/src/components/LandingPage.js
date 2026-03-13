import React from 'react';
import { Sparkles, Map, Layers, Zap, Bot, ChevronRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        title: 'Intent Classifier',
        description: 'Parses raw text to detect core goals and constraints from your initial ideas.',
        icon: <Bot className="h-6 w-6 text-aurora-400" />,
        color: 'from-aurora-500/20 to-aurora-900/10'
    },
    {
        title: 'Ambiguity Resolver',
        description: 'Identifies missing info and dynamically generates clarifying questions.',
        icon: <Sparkles className="h-6 w-6 text-indigo-400" />,
        color: 'from-indigo-500/20 to-indigo-900/10'
    },
    {
        title: 'Execution Planner',
        description: 'Produces comprehensive technical roadmaps and requirement specs.',
        icon: <Map className="h-6 w-6 text-purple-400" />,
        color: 'from-purple-500/20 to-purple-900/10'
    },
    {
        title: 'Build Engine',
        description: 'Generates robust boilerplate code and complete project scaffolding.',
        icon: <Layers className="h-6 w-6 text-emerald-400" />,
        color: 'from-emerald-500/20 to-emerald-900/10'
    }
];

const LandingPage = ({ onLaunch }) => {
    return (
        <div className="relative min-h-screen bg-transparent font-sans text-slate-100 flex flex-col justify-between overflow-x-hidden">

            {/* ── TOP NAV ── */}
            <nav className="w-full px-6 py-6 flex items-center justify-between z-10 glass-header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-400 to-indigo-500 rounded-xl blur opacity-30"></div>
                        <div className="relative h-10 w-10 rounded-xl bg-midnight-800 border border-white/10 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-aurora-400" />
                        </div>
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        IntentBridge
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300">
                        Documentation
                    </a>
                </motion.div>
            </nav>

            {/* ── HERO SECTION ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 text-center -mt-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-aurora-500/10 border border-aurora-500/20 text-aurora-300 text-sm font-medium mb-8">
                        <span className="relative flex w-2 h-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-500"></span>
                        </span>
                        Production-grade AI System
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-100">
                        Bridge the gap between <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-aurora-400 bg-clip-text text-transparent">vague ideas</span> and <span className="bg-gradient-to-r from-aurora-400 to-emerald-400 bg-clip-text text-transparent">structured execution</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        IntentBridge transforms conceptual ideas into comprehensive technical roadmaps and project scaffolding using a multi-module AI pipeline powered by Google Gemini.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={onLaunch}
                            className="group relative px-8 py-4 bg-aurora-600 hover:bg-aurora-500 text-midnight-900 rounded-xl font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_35px_rgba(20,184,166,0.5)] active:scale-95 flex items-center gap-2"
                        >
                            Launch Platform
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <a
                            href="#architecture"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-medium text-lg transition-all duration-300 backdrop-blur-md active:scale-95"
                        >
                            View Architecture
                        </a>
                    </div>
                </motion.div>
            </main>

            {/* ── FEATURES GRID ── */}
            <section id="architecture" className="w-full max-w-7xl mx-auto px-6 py-24 z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Multi-Module AI Pipeline</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">The platform operates in distinct phases to ensure clarity before execution.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-midnight-800/60 backdrop-blur-xl border border-white/5 hover:border-white/10 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group"
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.color} border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                {feat.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-2">{feat.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── TECH STACK ── */}
            <section className="w-full border-t border-white/5 bg-midnight-900/50 backdrop-blur-md py-12 z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <Terminal className="h-8 w-8 text-slate-500" />
                        <div>
                            <h4 className="font-semibold text-slate-200">Modern Architecture</h4>
                            <p className="text-xs text-slate-500">FastAPI • React 18 • PostgreSQL • Gemini LLM</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {['Python 3.9+', 'Node 18+', 'Docker'].map((tech, i) => (
                            <span key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-sm font-medium text-slate-300">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
