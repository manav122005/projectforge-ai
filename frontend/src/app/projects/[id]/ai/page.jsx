'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../../../store/useProjectStore';
import {
  Sparkles,
  ArrowLeft,
  BrainCircuit,
  Cpu,
  Kanban,
  ShieldAlert,
  Bot,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Users,
  Clock,
  Loader2,
  Check,
  Code2,
  Star,
  Send,
  User,
  Activity,
  Zap,
  RefreshCw,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

const providerBadges = {
  openrouter: { label: 'Powered by OpenRouter', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  gemini: { label: 'Powered by Google Gemini', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  deterministic: { label: 'Deterministic Fallback Mode', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' }
};

const severityColors = {
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

const suggestedPrompts = [
  'Why is my project health score low?',
  'What should our team work on today?',
  'Which team member is overloaded?',
  'What critical skills are we missing?',
  'What are the highest priority project risks?'
];

export default function ProjectAiPage() {
  const params = useParams();
  const projectId = params?.id;

  const {
    currentProject,
    isDetailLoading,
    isAiLoading,
    copilotMessages,
    isCopilotLoading,
    projectEvents,
    isEventsLoading,
    fetchProjectById,
    analyzeProject,
    askCopilot,
    fetchProjectEvents
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState('copilot'); // 'copilot' | 'blueprint' | 'timeline'
  const [aiData, setAiData] = useState(null);
  const [activeProvider, setActiveProvider] = useState('deterministic');
  const [analyzingStep, setAnalyzingStep] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchProjectEvents(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages, isCopilotLoading]);

  const handleRunAnalysis = async () => {
    setAnalyzingStep('Requesting Multi-Agent Reasoning Engine...');
    const res = await analyzeProject(projectId);
    setAnalyzingStep(null);

    if (res?.success && res.data) {
      setAiData(res.data.analysis);
      setActiveProvider(res.data.provider || 'deterministic');
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isCopilotLoading) return;
    const msg = inputMessage;
    setInputMessage('');
    await askCopilot(projectId, msg);
  };

  const handleQuickPrompt = async (prompt) => {
    if (isCopilotLoading) return;
    await askCopilot(projectId, prompt);
  };

  if (isDetailLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading AI project workspace...</p>
        </div>
      </ProtectedRoute>
    );
  }

  const analysis = aiData || (currentProject?.technologyStack?.length ? {
    projectName: currentProject.name,
    summary: currentProject.description || currentProject.originalIdea,
    problemStatement: currentProject.originalIdea,
    targetUsers: ['Students', 'Developers', 'Project Leads'],
    difficulty: 3,
    estimatedDurationDays: 30,
    recommendedTeamSize: 3,
    recommendedTechnologies: currentProject.technologyStack || [],
    requiredSkills: currentProject.requiredSkills || [],
    risks: currentProject.risks || [],
    mvpFeatures: currentProject.recommendedMVP || [],
    futureFeatures: ['Real-time AI Chatbot', 'Automated CI/CD Pipeline']
  } : null);

  const badge = providerBadges[activeProvider] || providerBadges.deterministic;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link href={`/projects/${projectId}`} className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Overview</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Context Telemetry Active
            </span>
          </div>
        </div>

        {/* Top Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-glass space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Project Copilot & Multi-Agent Intelligence</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Project Copilot</h1>
              <p className="text-xs text-slate-400">Context-aware technical strategist grounded directly in stored workspace milestones, tasks, and telemetry.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAnalysis}
                disabled={isAiLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-300" />}
                <span>{analyzingStep || 'Run Full Analysis'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <Link href={`/projects/${projectId}`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <FolderGit2 className="w-3.5 h-3.5" /><span>Overview</span>
            </Link>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 shadow-glow-indigo">
              <BrainCircuit className="w-3.5 h-3.5" /><span>AI Copilot & Intelligence</span>
            </button>
            <Link href={`/projects/${projectId}/architecture`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Cpu className="w-3.5 h-3.5" /><span>Architecture</span>
            </Link>
            <Link href={`/projects/${projectId}/tasks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Kanban className="w-3.5 h-3.5" /><span>Task Board</span>
            </Link>
            <Link href={`/projects/${projectId}/team`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Users className="w-3.5 h-3.5" /><span>Team</span>
            </Link>
            <Link href={`/projects/${projectId}/risks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <ShieldAlert className="w-3.5 h-3.5" /><span>Risk Radar</span>
            </Link>
          </div>
        </div>

        {/* Workspace Sub-Tabs: Copilot Chat / Blueprint Analysis / Activity Timeline */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs w-fit">
          <button
            onClick={() => setActiveTab('copilot')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'copilot' ? 'bg-indigo-600 text-white shadow-glow-indigo' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /><span>Project Copilot Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'blueprint' ? 'bg-indigo-600 text-white shadow-glow-indigo' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" /><span>AI Blueprint Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-glow-indigo' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /><span>AI Activity Timeline</span>
          </button>
        </div>

        {/* TAB 1: COPILOT CHAT */}
        {activeTab === 'copilot' && (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden flex flex-col min-h-[600px] shadow-2xl">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow-indigo">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">ProjectForge AI Copilot</h3>
                  <span className="text-[10px] text-slate-400">Context: {currentProject?.name}</span>
                </div>
              </div>
              <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                Zero Hallucination Mode
              </span>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px]">
              {/* Initial Welcome Message */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed max-w-2xl space-y-2">
                  <p>
                    Hello! I am your <strong>ProjectForge Copilot</strong>. I have real-time access to your tasks, milestones, team workload, health metrics, and risk radar.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Ask me anything about your current sprint, workload distribution, or project risks below.
                  </p>
                </div>
              </div>

              {/* Dynamic Conversation */}
              {copilotMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed max-w-2xl space-y-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.suggestedActions?.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-indigo-400 font-semibold">Suggested Actions:</span>
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickPrompt(act)}
                            className="px-2.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isCopilotLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span>Analyzing project telemetry and formulating recommendation...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-6 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-semibold shrink-0">Quick Queries:</span>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p)}
                  disabled={isCopilotLoading}
                  className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask ProjectForge Copilot about tasks, milestones, team capacity, or risks..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isCopilotLoading}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isCopilotLoading}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 shadow-glow-indigo transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: AI BLUEPRINT INTELLIGENCE */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            {!analysis ? (
              <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 my-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-white">No AI Analysis Run Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click "Run Full Analysis" to trigger our multi-agent reasoning engine.
                  </p>
                </div>
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-glow-indigo"
                >
                  <Sparkles className="w-4 h-4" /><span>Analyze Now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <span>Technical Summary & Problem Statement</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
                      {analysis.summary}
                    </p>

                    {analysis.problemStatement && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Problem Statement</span>
                        <p className="text-xs text-slate-400 leading-relaxed">{analysis.problemStatement}</p>
                      </div>
                    )}
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span>Project Estimation Metrics</span>
                    </h3>

                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Technical Difficulty</span>
                        <span className="text-amber-400 font-bold">{analysis.difficulty || 3}/5</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Estimated Duration</span>
                        <span className="font-bold text-white">{analysis.estimatedDurationDays || 30} Days</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Recommended Team</span>
                        <span className="font-bold text-white">{analysis.recommendedTeamSize || 3} Engineers</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technology Stack */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Recommended Technology Stack</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(analysis.recommendedTechnologies || []).map((tech, index) => (
                      <div key={index} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{tech.technology}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
                            {tech.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{tech.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scope */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>MVP Feature Scope</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {(analysis.mvpFeatures || []).map((feat, i) => (
                        <li key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Future Expansion Features</span>
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-400">
                      {(analysis.futureFeatures || []).map((feat, i) => (
                        <li key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI ACTIVITY TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /><span>AI Activity & Telemetry Timeline</span>
                </h3>
                <p className="text-xs text-slate-400">Immutable audit log of all project reasoning steps, risk alerts, and milestone executions.</p>
              </div>
              <button
                onClick={() => fetchProjectEvents(projectId)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isEventsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {projectEvents.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">No project activity events logged yet.</div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {projectEvents.map((event) => (
                  <div key={event._id} className="relative space-y-1">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300 font-mono">
                        {event.type}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{event.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
