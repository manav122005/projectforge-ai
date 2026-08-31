'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '../../store/useAuthStore';
import { useProjectStore } from '../../store/useProjectStore';
import {
  FolderGit2,
  Activity,
  Kanban,
  ShieldAlert,
  Sparkles,
  Plus,
  ArrowRight,
  BrainCircuit,
  Clock,
  Layers,
  Info,
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { projects, fetchProjects, isLoading } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'planning').length;
  const avgHealth = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.healthScore ?? 0), 0) / totalProjects)
    : '--';

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-glass relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Full Intelligence & Execution Platform Active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300">{user?.name || 'Developer'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Manage persistent project blueprints, Kanban boards, Risk Radars, team workloads, and AI Copilot intelligence.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex items-center gap-3 flex-wrap">
            <button
              onClick={async () => {
                const res = await useProjectStore.getState().seedDemoProject();
                if (res?.success && res.project?._id) {
                  window.location.href = `/projects/${res.project._id}`;
                }
              }}
              className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Demo Showcase</span>
            </button>

            <Link
              href="/projects/new"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-glow-indigo flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        </div>

        {/* Overview Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Projects', value: totalProjects, icon: FolderGit2, color: 'text-indigo-400', badge: 'Database' },
            { label: 'Active Projects', value: activeProjects, icon: Layers, color: 'text-purple-400', badge: 'Running' },
            { label: 'Avg Health Score', value: avgHealth, icon: Activity, color: 'text-emerald-400', badge: 'Formula' },
            { label: 'Tasks Due', value: '0', icon: Kanban, color: 'text-cyan-400', badge: 'Phase 4' },
            { label: 'Critical Risks', value: '0', icon: ShieldAlert, color: 'text-rose-400', badge: 'Phase 5' },
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
                  <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800 ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-2xl font-extrabold text-white tracking-tight">{card.value}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40 font-mono">
                    {card.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Section: Recent Projects & AI Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects List (2 Cols) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">Recent Projects</h2>
              </div>
              <Link href="/projects" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
                  <FolderGit2 className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-sm font-semibold text-slate-200">No Projects Created Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Start by initializing your first software project workspace.
                  </p>
                </div>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Project</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 my-auto">
                {projects.slice(0, 4).map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {project.name}
                        </h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 uppercase font-semibold border border-indigo-500/20">
                          {project.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {project.description || project.originalIdea || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
                      <div className="flex items-center gap-1" title="Health Score">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-white">{project.healthScore ?? '--'}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Project Persistence Engine: Active</span>
              <span>Phase 2 Verified</span>
            </div>
          </div>

          {/* Recent AI Agent Activity (1 Col) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white">AI Agent Status</h2>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-4 my-auto">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-300">Project Core CRUD</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Project models, team membership, search/filter, and ownership rules online.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-purple-300">Multi-Agent Engine</span>
                  <span className="text-[10px] text-indigo-300 font-mono">Phase 3 Standby</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Project Analyst, Architecture Agent, Planning Agent, Risk Agent initialized and standing by for Phase 3.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>MongoDB Persistence</span>
              </div>
              <span className="font-mono text-indigo-400">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
