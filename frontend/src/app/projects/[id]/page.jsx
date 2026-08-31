'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../../store/useProjectStore';
import {
  FolderGit2,
  ArrowLeft,
  Activity,
  Calendar,
  Users,
  Copy,
  Archive,
  Trash2,
  Sparkles,
  Cpu,
  Kanban,
  Lightbulb,
  CheckCircle2,
  Clock,
  Loader2,
  User,
  Plus,
  X,
  Flag,
  AlertCircle,
  ChevronRight,
  Target,
  ShieldAlert,
  Bot
} from 'lucide-react';

const statusColors = {
  planning: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  completed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  archived: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  draft: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const milestoneStatusColors = {
  planning: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  delayed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;

  const {
    currentProject,
    members,
    milestones,
    isOwner,
    isDetailLoading,
    error,
    fetchProjectById,
    updateProject,
    duplicateProject,
    archiveProject,
    deleteProject,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    clearError
  } = useProjectStore();

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({ name: '', description: '', startDate: '', dueDate: '', status: 'planning' });
  const [milestoneLoading, setMilestoneLoading] = useState(false);
  const [milestoneError, setMilestoneError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchMilestones(projectId);
    }
  }, [projectId, fetchProjectById]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusUpdating(true);
    await updateProject(projectId, { status: newStatus });
    setStatusUpdating(false);
  };

  const handleDuplicate = async () => {
    const res = await duplicateProject(projectId);
    if (res?.success && res.project?._id) {
      router.push(`/projects/${res.project._id}`);
    }
  };

  const handleArchive = async () => {
    await archiveProject(projectId);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this project workspace?')) {
      const res = await deleteProject(projectId);
      if (res?.success) {
        router.push('/projects');
      }
    }
  };

  const openCreateMilestone = () => {
    setEditingMilestone(null);
    setMilestoneForm({ name: '', description: '', startDate: '', dueDate: '', status: 'planning' });
    setMilestoneError(null);
    setShowMilestoneModal(true);
  };

  const openEditMilestone = (m) => {
    setEditingMilestone(m);
    setMilestoneForm({
      name: m.name,
      description: m.description || '',
      startDate: m.startDate ? m.startDate.slice(0, 10) : '',
      dueDate: m.dueDate ? m.dueDate.slice(0, 10) : '',
      status: m.status
    });
    setMilestoneError(null);
    setShowMilestoneModal(true);
  };

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    setMilestoneLoading(true);
    setMilestoneError(null);

    const payload = {
      name: milestoneForm.name,
      description: milestoneForm.description,
      startDate: milestoneForm.startDate || undefined,
      dueDate: milestoneForm.dueDate || undefined,
      status: milestoneForm.status
    };

    let result;
    if (editingMilestone) {
      result = await updateMilestone(editingMilestone._id, payload);
    } else {
      result = await createMilestone(projectId, payload);
    }

    setMilestoneLoading(false);

    if (result?.success === false) {
      setMilestoneError(result.error || 'Failed to save milestone');
    } else {
      setShowMilestoneModal(false);
      setEditingMilestone(null);
    }
  };

  const handleDeleteMilestone = async (milestoneId, taskCount) => {
    if (taskCount > 0) {
      alert(`Cannot delete: This milestone contains ${taskCount} task(s). Please reassign or delete tasks first.`);
      return;
    }
    if (!confirm('Delete this milestone? This action cannot be undone.')) return;
    const result = await deleteMilestone(milestoneId);
    if (result?.success === false) {
      alert(result.error || 'Failed to delete milestone.');
    }
  };

  if (isDetailLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading project workspace...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !currentProject) {
    return (
      <ProtectedRoute>
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-md mx-auto my-12">
          <h3 className="text-base font-bold text-white">Project Not Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{error || 'This project does not exist or access is restricted.'}</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Projects</span>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link href="/projects" className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>ID: {currentProject._id}</span>
          </div>
        </div>

        {/* Project Header Banner */}
        <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-glass space-y-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${statusColors[currentProject.status] || statusColors.planning}`}>
                  {currentProject.status}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-slate-500">Status Control:</span>
                  <select
                    value={currentProject.status}
                    onChange={handleStatusChange}
                    disabled={statusUpdating}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                {currentProject.name}
              </h1>

              {currentProject.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentProject.description}
                </p>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={handleDuplicate}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={handleArchive}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Archive className="w-3.5 h-3.5 text-amber-400" />
                <span>Archive</span>
              </button>

              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 shadow-glow-indigo shrink-0">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <Link href={`/projects/${projectId}/ai`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white transition-colors shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Copilot & Intelligence</span>
            </Link>
            <Link href={`/projects/${projectId}/architecture`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white transition-colors shrink-0">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Architecture</span>
            </Link>
            <Link href={`/projects/${projectId}/tasks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white transition-colors shrink-0">
              <Kanban className="w-3.5 h-3.5 text-amber-400" />
              <span>Task Board</span>
            </Link>
            <Link href={`/projects/${projectId}/team`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white transition-colors shrink-0">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Team & Skills</span>
            </Link>
            <Link href={`/projects/${projectId}/risks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white transition-colors shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Risk Radar</span>
            </Link>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 cols): Original Idea, Milestones */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Idea Box */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Natural Language Idea</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 font-sans">
                {currentProject.originalIdea || 'No explicit project idea provided.'}
              </p>
            </div>

            {/* Milestones Panel */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Flag className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Milestones</h3>
                  <span className="text-[10px] text-slate-500 font-mono ml-1">{milestones.length} total</span>
                </div>
                <button
                  onClick={openCreateMilestone}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Milestone</span>
                </button>
              </div>

              {milestones.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Flag className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">No milestones yet. Create your first milestone to start planning execution.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((m) => (
                    <div key={m._id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-white truncate">{m.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${milestoneStatusColors[m.status] || milestoneStatusColors.planning}`}>
                              {m.status}
                            </span>
                          </div>
                          {m.description && (
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{m.description}</p>
                          )}
                          {(m.startDate || m.dueDate) && (
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                              {m.startDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(m.startDate).toLocaleDateString()}
                                </span>
                              )}
                              {m.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Due: {new Date(m.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openEditMilestone(m)}
                            className="text-[10px] text-slate-400 hover:text-indigo-400 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(m._id, m.taskStats?.total || 0)}
                            className="text-[10px] text-rose-500 hover:text-rose-400 transition-colors font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">
                            {m.taskStats?.completed || 0} / {m.taskStats?.total || 0} tasks completed
                          </span>
                          <span className={`font-bold ${(m.completionPercentage || 0) === 100 ? 'text-emerald-400' : (m.completionPercentage || 0) >= 50 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {m.completionPercentage || 0}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              (m.completionPercentage || 0) === 100 ? 'bg-emerald-500' :
                              (m.completionPercentage || 0) >= 50 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${m.completionPercentage || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* View Tasks Link */}
                      <Link
                        href={`/projects/${projectId}/tasks?milestoneId=${m._id}`}
                        className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                      >
                        <span>View Tasks</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 col): Health Summary & Team */}
          <div className="space-y-6">
            {/* Health Score Summary */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 text-center">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-left">
                <span className="text-xs font-bold text-white">Project Health Score</span>
                <span className={`text-[10px] font-semibold uppercase ${
                  (currentProject.healthScore ?? 0) >= 75 ? 'text-emerald-400' : (currentProject.healthScore ?? 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {(currentProject.healthScore ?? 0) >= 90 ? 'Excellent' : (currentProject.healthScore ?? 0) >= 75 ? 'Healthy' : (currentProject.healthScore ?? 0) >= 60 ? 'Needs Attention' : 'High Risk'}
                </span>
              </div>

              <div className="inline-block p-5 rounded-full bg-slate-900 border-4 border-indigo-500/40 shadow-glow-indigo">
                <span className="text-4xl font-extrabold text-white">{currentProject.healthScore !== undefined ? currentProject.healthScore : 70}</span>
                <p className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">/ 100 Total</p>
              </div>

              {/* Health Trend History */}
              {currentProject.healthHistory?.length > 1 && (
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">Health Trend</span>
                    <span className="font-mono text-emerald-400">
                      {currentProject.healthHistory.map((h) => h.score).join(' → ')}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-left text-[11px] pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-slate-400">Technical (25%)</p>
                  <p className="font-bold text-white mt-0.5">{currentProject.healthBreakdown?.technical ?? 75} / 100</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-slate-400">Timeline (20%)</p>
                  <p className="font-bold text-white mt-0.5">{currentProject.healthBreakdown?.timeline ?? 70} / 100</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-slate-400">Skills (20%)</p>
                  <p className="font-bold text-white mt-0.5">{currentProject.healthBreakdown?.skills ?? 65} / 100</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-slate-400">Scope (20%)</p>
                  <p className="font-bold text-white mt-0.5">{currentProject.healthBreakdown?.scope ?? 72} / 100</p>
                </div>
                <div className="col-span-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <p className="text-slate-400">Team Capacity (15%)</p>
                  <p className="font-bold text-white">{currentProject.healthBreakdown?.team ?? 70} / 100</p>
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-white">Workspace Modules</h3>
              </div>
              <Link href={`/projects/${projectId}/tasks`} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Kanban className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Task Board</p>
                    <p className="text-[10px] text-slate-400">Kanban workflow & assignments</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </Link>
              <Link href={`/projects/${projectId}/team`} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Team & Skills</p>
                    <p className="text-[10px] text-slate-400">{members.length} members · Workload & Skill Gap</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </Link>
              <Link href={`/projects/${projectId}/risks`} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Risk Radar</p>
                    <p className="text-[10px] text-slate-400">Risk detection & AI recovery</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-400 transition-colors" />
              </Link>
              <Link href={`/projects/${projectId}/ai`} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">AI Copilot & Intelligence</p>
                    <p className="text-[10px] text-slate-400">Contextual query & analysis</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </Link>
              <Link href={`/projects/${projectId}/architecture`} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">AI Architecture Graph</p>
                    <p className="text-[10px] text-slate-400">Interactive system design</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors" />
              </Link>
            </div>

            {/* Team Members List */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Team Members</h3>
                </div>
                <span className="text-xs text-slate-400">{members.length} Total</span>
              </div>

              <div className="space-y-2.5">
                {members.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    <Link href={`/projects/${projectId}/team`} className="text-indigo-400 hover:text-indigo-300">
                      Add team members →
                    </Link>
                  </div>
                ) : members.map((member) => (
                  <div key={member._id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {member.displayName ? member.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{member.displayName}</p>
                        <p className="text-[10px] text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    {member.userId?._id === currentProject.owner?._id && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                        Owner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Create/Edit Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-indigo-400" />
                <span>{editingMilestone ? 'Edit Milestone' : 'Create Milestone'}</span>
              </h3>
              <button onClick={() => setShowMilestoneModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {milestoneError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{milestoneError}</span>
              </div>
            )}

            <form onSubmit={handleMilestoneSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Milestone name *"
                required
                maxLength={120}
                value={milestoneForm.name}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <textarea
                placeholder="Description (optional)"
                rows={2}
                maxLength={1000}
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={milestoneForm.startDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <select
                value={milestoneForm.status}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={milestoneLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {milestoneLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{milestoneLoading ? 'Saving...' : editingMilestone ? 'Update Milestone' : 'Create Milestone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
