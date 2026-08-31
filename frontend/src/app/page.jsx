'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Kanban,
  BrainCircuit,
  Users,
  CheckCircle2,
  Activity,
  Layers,
  Terminal,
  ChevronRight,
  Github
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-glow-indigo flex items-center justify-center">
              <div className="w-full h-full bg-dark-bg rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
              ProjectForge<span className="text-indigo-400 font-extrabold ml-1">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#problem" className="hover:text-indigo-400 transition-colors">Problem</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#intelligence" className="hover:text-indigo-400 transition-colors">AI Intelligence</a>
            <a href="#health" className="hover:text-indigo-400 transition-colors">Project Health</a>
            <a href="#risk-radar" className="hover:text-indigo-400 transition-colors">Risk Radar</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-glow-indigo transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden bg-hero-pattern">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-xs font-medium text-indigo-300 shadow-glow-indigo">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Introducing Multi-Agent Project Execution Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn your idea into an <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">
              execution-ready project.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Stop struggling with technical ambiguity. ProjectForge AI turns natural-language project ideas into structured feasibility scores, architecture diagrams, required skills, task breakdowns, and real-time risk monitoring.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold text-sm shadow-glow-indigo transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Start Building Your Blueprint</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Live Dashboard</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Interactive Feature Terminal Mockup */}
          <div className="pt-10">
            <div className="glass-panel rounded-2xl border border-slate-800 p-4 shadow-glass max-w-4xl mx-auto text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">projectforge-cli v1.0</span>
                </div>
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Phase 1 Engine Online
                </span>
              </div>
              <div className="font-mono text-xs space-y-2.5 p-2 text-slate-300 overflow-x-auto">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Terminal className="w-4 h-4 shrink-0" />
                  <span>$ projectforge analyze "Build an AI-powered college placement prediction system"</span>
                </div>
                <div className="text-emerald-400 pl-6">
                  ✓ Idea analyzed by Project Analyst Agent (Feasibility Score: 84/100)
                </div>
                <div className="text-cyan-400 pl-6">
                  ✓ Node & Edge System Architecture generated (Microservices + React Flow)
                </div>
                <div className="text-purple-400 pl-6">
                  ✓ 18 actionable development tasks auto-grouped into 4 execution milestones
                </div>
                <div className="text-amber-400 pl-6">
                  ✓ Skill gap detected: Machine Learning model tuning requiring mentor support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="problem" className="py-20 px-6 border-t border-slate-800/60 bg-dark-surface/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">The Challenge</h2>
            <h3 className="text-3xl font-extrabold text-white">Why Software Projects Fail Before They Start</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Students and developer teams frequently have great ideas, but struggle with execution ambiguity, tech stack decisions, and unmonitored risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Unclear Technical Feasibility',
                desc: 'Without structured breakdown, teams commit to unrealistic deadlines and impossible feature scopes.',
                icon: ShieldAlert,
                color: 'text-rose-400',
              },
              {
                title: 'Unstructured Chatbot Advice',
                desc: 'Generic AI chatbots provide conversational paragraphs that cannot be stored, tracked, or assigned.',
                icon: BrainCircuit,
                color: 'text-amber-400',
              },
              {
                title: 'Skill Gap & Workload Imbalance',
                desc: 'Work is assigned blindly without analyzing member skill levels or actual hour availability.',
                icon: Users,
                color: 'text-cyan-400',
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="glass-card p-6 rounded-2xl space-y-3">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How ProjectForge Works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Workflow Showcase</h2>
            <h3 className="text-3xl font-extrabold text-white">From Natural Language Idea to Managed Workspace</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Submit Idea', desc: 'Describe your application vision in plain natural language.' },
              { step: '02', title: 'AI Analysis', desc: 'Multi-agent system calculates feasibility, architecture, and tech stack.' },
              { step: '03', title: 'Human Approval', desc: 'Review, edit, and approve AI recommendations before persistent storage.' },
              { step: '04', title: 'Execute Workspace', desc: 'Track progress via interactive Kanban board and Risk Radar.' },
            ].map((item, idx) => (
              <div key={idx} className="relative glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-3xl font-extrabold text-indigo-500/40">{item.step}</span>
                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Agent Intelligence Preview */}
      <section id="intelligence" className="py-20 px-6 border-t border-slate-800/60 bg-dark-surface/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">AI Intelligence</h2>
            <h3 className="text-3xl font-extrabold text-white">8 Specialized Agents Working For You</h3>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Instead of a single prompt, ProjectForge orchestrates autonomous specialized agents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Project Analyst', role: 'Feasibility & Complexity Scoring' },
              { name: 'Architecture Agent', role: 'Component Node & Edge Diagrams' },
              { name: 'Planning Agent', role: 'Milestones & Task Generation' },
              { name: 'Team Agent', role: 'Skill Match & Role Assignment' },
              { name: 'Risk Agent', role: 'Deterministic Failure Detection' },
              { name: 'Monitoring Agent', role: 'Progress Velocity Tracking' },
              { name: 'Recovery Agent', role: 'Actionable MVP Scope Pivot' },
              { name: 'Copilot Agent', role: 'Context-Aware Project Assistant' },
            ].map((agent, index) => (
              <div key={index} className="p-4 rounded-xl glass-card border border-slate-800/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{agent.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Health Score Preview */}
      <section id="health" className="py-20 px-6 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Project Health Engine</span>
            <h3 className="text-3xl font-extrabold text-white">Real-Time Project Health Score (0 - 100)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              ProjectForge constantly calculates a deterministic health index based on technical feasibility, skill readiness, remaining tasks, and unresolved risk factors.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Technical Feasibility: 84 / 100</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Timeline Capacity: 72 / 100</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Team Skill Readiness: 65 / 100</span>
              </li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-glass text-center space-y-6">
            <div className="inline-block p-6 rounded-full bg-slate-900/80 border-4 border-indigo-500/40 shadow-glow-indigo">
              <span className="text-5xl font-extrabold text-white">78</span>
              <p className="text-xs font-semibold text-emerald-400 mt-1 uppercase">Healthy</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-left text-xs">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <p className="text-slate-400">Technical Score</p>
                <p className="text-base font-bold text-indigo-300 mt-0.5">84 / 100</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <p className="text-slate-400">Scope Complexity</p>
                <p className="text-base font-bold text-cyan-300 mt-0.5">81 / 100</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-20 px-6 border-t border-slate-800/60 bg-gradient-to-b from-dark-bg to-slate-950 text-center">
        <div className="max-w-4xl mx-auto glass-panel p-12 rounded-3xl border border-indigo-500/20 shadow-glow-indigo space-y-8">
          <h2 className="text-3xl font-extrabold text-white">Ready to forge your next software project?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Create an account in under 30 seconds and start turning ambiguous project ideas into structured execution plans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-glow-indigo transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl glass-panel border border-slate-700 text-slate-300 font-semibold text-sm hover:border-slate-500 transition-colors"
            >
              Sign In To Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ProjectForge AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Phase 1 — Foundation</span>
            <span>SPEC.md Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
