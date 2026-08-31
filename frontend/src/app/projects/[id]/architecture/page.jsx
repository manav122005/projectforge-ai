'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../../../store/useProjectStore';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Cpu,
  ArrowLeft,
  Sparkles,
  FolderGit2,
  BrainCircuit,
  Kanban,
  ShieldAlert,
  Bot,
  Loader2,
  RefreshCw,
  Users
} from 'lucide-react';

const providerBadges = {
  openrouter: { label: 'Powered by OpenRouter', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  gemini: { label: 'Powered by Google Gemini', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  deterministic: { label: 'Deterministic Fallback Mode', color: 'bg-amber-500/10 text-amber-300 border-amber-300/30' }
};

const CustomNodeComponent = ({ data, type }) => {
  const typeColors = {
    frontend: 'border-indigo-500 bg-indigo-950/80 text-indigo-200',
    backend: 'border-purple-500 bg-purple-950/80 text-purple-200',
    database: 'border-emerald-500 bg-emerald-950/80 text-emerald-200',
    AI: 'border-cyan-500 bg-cyan-950/80 text-cyan-200',
    external: 'border-amber-500 bg-amber-950/80 text-amber-200'
  };

  return (
    <div className={`px-4 py-3 rounded-2xl border-2 shadow-glass max-w-xs ${typeColors[type] || 'border-slate-700 bg-slate-900 text-white'}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-bold text-xs">{data.label}</span>
        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40 font-mono">{type}</span>
      </div>
      {data.description && <p className="text-[10px] text-slate-300 leading-tight mb-1">{data.description}</p>}
      {data.tech && <span className="text-[9px] font-mono text-indigo-300 font-semibold">{data.tech}</span>}
    </div>
  );
};

export default function ArchitecturePage() {
  const params = useParams();
  const projectId = params?.id;

  const {
    currentProject,
    architecture,
    isDetailLoading,
    isAiLoading,
    fetchProjectById,
    generateArchitecture
  } = useProjectStore();

  const [activeProvider, setActiveProvider] = useState('deterministic');

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
    }
  }, [projectId, fetchProjectById]);

  const handleGenerateArchitecture = async () => {
    const res = await generateArchitecture(projectId);
    if (res?.success && res.provider) {
      setActiveProvider(res.provider);
    }
  };

  const initialNodes = useMemo(() => {
    const rawNodes = architecture?.nodes || currentProject?.architecture?.nodes || [
      { id: 'node-fe', type: 'frontend', data: { label: 'Client App UI', description: 'Interactive React/Next.js dashboard', tech: 'React / Tailwind' }, position: { x: 250, y: 50 } },
      { id: 'node-be', type: 'backend', data: { label: 'API Server', description: 'REST controllers and services', tech: 'Node.js / Express' }, position: { x: 250, y: 200 } },
      { id: 'node-db', type: 'database', data: { label: 'MongoDB Store', description: 'Workspace data & user profiles', tech: 'MongoDB' }, position: { x: 100, y: 350 } },
      { id: 'node-ai', type: 'AI', data: { label: 'AI Reasoning Engine', description: 'Multi-agent intelligence fallback', tech: 'OpenRouter / Gemini' }, position: { x: 400, y: 350 } }
    ];

    return rawNodes.map((n) => ({
      ...n,
      style: { background: '#0d1322', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff', padding: '12px' }
    }));
  }, [architecture, currentProject]);

  const initialEdges = useMemo(() => {
    return (architecture?.edges || currentProject?.architecture?.edges || [
      { id: 'e-fe-be', source: 'node-fe', target: 'node-be', animated: true, label: 'REST API' },
      { id: 'e-be-db', source: 'node-be', target: 'node-db', animated: false, label: 'Mongoose' },
      { id: 'e-be-ai', source: 'node-be', target: 'node-ai', animated: true, label: 'JSON Prompt' }
    ]).map((e) => ({
      ...e,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    }));
  }, [architecture, currentProject]);

  if (isDetailLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading architecture workspace...</p>
        </div>
      </ProtectedRoute>
    );
  }

  const badge = providerBadges[activeProvider] || providerBadges.deterministic;

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link href={`/projects/${projectId}`} className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Overview</span>
          </Link>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Banner */}
        <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-glass space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Architecture Agent Canvas</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                System Architecture Visualization
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Interactive component node graph generated by the Architecture Agent.
              </p>
            </div>

            <button
              onClick={handleGenerateArchitecture}
              disabled={isAiLoading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-glow-indigo flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 shrink-0"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Graph...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-indigo-300" />
                  <span>Regenerate Architecture</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <Link href={`/projects/${projectId}`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <Link href={`/projects/${projectId}/ai`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>AI Intelligence</span>
            </Link>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 shadow-glow-indigo">
              <Cpu className="w-3.5 h-3.5" />
              <span>Architecture Graph</span>
            </button>
            <Link href={`/projects/${projectId}/tasks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Kanban className="w-3.5 h-3.5" />
              <span>Task Board</span>
            </Link>
            <Link href={`/projects/${projectId}/team`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Users className="w-3.5 h-3.5" />
              <span>Team</span>
            </Link>
            <Link href={`/projects/${projectId}/risks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Risk Radar</span>
            </Link>
          </div>
        </div>

        {/* React Flow Architecture Canvas */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-glass space-y-4">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-semibold text-slate-300">Interactive Canvas View</span>
            <span className="text-[11px] text-slate-400 font-mono">Zoom & Drag Enabled</span>
          </div>

          <div className="w-full h-[550px] bg-dark-bg rounded-2xl border border-slate-800 overflow-hidden relative">
            <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
              <Background color="#1e293b" gap={20} size={1} />
              <Controls className="bg-slate-900 border border-slate-800 text-white fill-white" />
            </ReactFlow>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
