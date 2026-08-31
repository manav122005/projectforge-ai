'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../store/useProjectStore';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Activity,
  Calendar,
  Users,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
  Loader2,
  Sparkles
} from 'lucide-react';

const statusColors = {
  planning: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  draft: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    filters,
    setFilters,
    fetchProjects,
    duplicateProject,
    archiveProject,
    deleteProject
  } = useProjectStore();

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ search: searchInput });
  };

  const handleStatusChange = (status) => {
    setFilters({ status });
  };

  const handleSortChange = (e) => {
    setFilters({ sortBy: e.target.value });
  };

  const handleDuplicate = async (e, id) => {
    e.stopPropagation();
    setActiveMenuId(null);
    await duplicateProject(id);
    fetchProjects();
  };

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    setActiveMenuId(null);
    await archiveProject(id);
    fetchProjects();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      setActiveMenuId(null);
      await deleteProject(id);
      fetchProjects();
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <FolderGit2 className="w-7 h-7 text-indigo-400" />
              <span>Project Workspaces</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage, monitor, and execute your software development blueprints.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={async () => {
                const res = await useProjectStore.getState().seedDemoProject();
                if (res?.success && res.project?._id) {
                  window.location.href = `/projects/${res.project._id}`;
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Load Demo Showcase</span>
            </button>

            <Link
              href="/projects/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-glow-indigo transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {['all', 'planning', 'active', 'paused', 'completed', 'archived'].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all shrink-0 ${
                  filters.status === st
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="relative flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer pr-1"
              >
                <option value="createdAt" className="bg-dark-surface text-white">Newest First</option>
                <option value="oldest" className="bg-dark-surface text-white">Oldest First</option>
                <option value="health" className="bg-dark-surface text-white">Health Score</option>
                <option value="name" className="bg-dark-surface text-white">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Cards Grid / Skeleton Loading / Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-12 bg-slate-800/60 rounded" />
                <div className="h-4 bg-slate-800 rounded w-1/2 pt-4" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
              <FolderGit2 className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-white">No Projects Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {filters.search || filters.status !== 'all'
                  ? 'No project workspace matching your search criteria.'
                  : 'Get started by creating your first software project workspace.'}
              </p>
            </div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="glass-card p-6 rounded-3xl border border-slate-800/80 space-y-4 flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  {/* Top Badge & Action Menu */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${statusColors[project.status] || statusColors.planning}`}>
                      {project.status}
                    </span>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === project._id ? null : project._id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === project._id && (
                        <div className="absolute right-0 mt-1 w-40 glass-panel rounded-xl shadow-glass border border-slate-800 py-1.5 z-30 text-xs">
                          <button
                            onClick={(e) => handleDuplicate(e, project._id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 text-left"
                          >
                            <Copy className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            onClick={(e) => handleArchive(e, project._id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 text-left"
                          >
                            <Archive className="w-3.5 h-3.5 text-amber-400" />
                            <span>Archive</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, project._id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Title */}
                  <Link href={`/projects/${project._id}`} className="block group-hover:text-indigo-300 transition-colors">
                    <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {project.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description || project.originalIdea || 'No description provided.'}
                  </p>
                </div>

                {/* Footer Meta Details */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5" title="Health Score">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-semibold text-white">{project.healthScore ?? '--'}</span>
                    </div>

                    <div className="flex items-center gap-1.5" title="Team Members">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{project.memberCount || 1} member</span>
                    </div>
                  </div>

                  <Link
                    href={`/projects/${project._id}`}
                    className="flex items-center gap-1 text-indigo-400 font-semibold hover:text-indigo-300 text-[11px]"
                  >
                    <span>Open Workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
