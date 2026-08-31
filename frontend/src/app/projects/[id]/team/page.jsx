'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../../../store/useProjectStore';
import {
  ArrowLeft, Loader2, Plus, X, Users, FolderGit2, BrainCircuit, Cpu, Kanban,
  ShieldAlert, Bot, AlertCircle, CheckCircle2, User, BarChart3, Zap, Target
} from 'lucide-react';

const capColors = { under_capacity: 'bg-emerald-500', near_capacity: 'bg-amber-500', over_capacity: 'bg-rose-500' };
const capLabels = { under_capacity: 'Under Capacity', near_capacity: 'Near Capacity', over_capacity: 'Over Capacity' };
const expColors = { beginner: 'text-cyan-400', intermediate: 'text-indigo-400', advanced: 'text-purple-400' };

export default function TeamPage() {
  const params = useParams();
  const projectId = params?.id;

  const {
    currentProject, teamMembers, teamSummary, skillGap,
    isDetailLoading, fetchProjectById, fetchTeamMembers, fetchSkillGap,
    addTeamMember, removeTeamMember, error, clearError
  } = useProjectStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ displayName: '', role: 'Developer', skills: '', experienceLevel: 'intermediate', availabilityHours: 40 });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchTeamMembers(projectId);
      fetchSkillGap(projectId);
    }
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAdding(true);
    const skills = newMember.skills ? newMember.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    await addTeamMember(projectId, { ...newMember, skills, availabilityHours: parseFloat(newMember.availabilityHours) || 40 });
    setAdding(false);
    setShowAddModal(false);
    setNewMember({ displayName: '', role: 'Developer', skills: '', experienceLevel: 'intermediate', availabilityHours: 40 });
    fetchTeamMembers(projectId);
    fetchSkillGap(projectId);
  };

  const handleRemove = async (memberId) => {
    if (!confirm('Remove this team member? Their tasks will be unassigned.')) return;
    await removeTeamMember(projectId, memberId);
    fetchTeamMembers(projectId);
    fetchSkillGap(projectId);
  };

  if (isDetailLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading team workspace...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link href={`/projects/${projectId}`} className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Back to Overview</span>
          </Link>
        </div>

        {/* Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-glass space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                <Users className="w-3.5 h-3.5" /><span>Team Management & Skill Gap</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Team & Skills</h1>
              <p className="text-xs text-slate-400">Manage team members, view workload capacity, and analyze skill coverage.</p>
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-2 shadow-glow-indigo hover:-translate-y-0.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /><span>Add Member</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
            <Link href={`/projects/${projectId}`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <FolderGit2 className="w-3.5 h-3.5" /><span>Overview</span>
            </Link>
            <Link href={`/projects/${projectId}/ai`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <BrainCircuit className="w-3.5 h-3.5" /><span>AI Intelligence</span>
            </Link>
            <Link href={`/projects/${projectId}/architecture`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Cpu className="w-3.5 h-3.5" /><span>Architecture</span>
            </Link>
            <Link href={`/projects/${projectId}/tasks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Kanban className="w-3.5 h-3.5" /><span>Task Board</span>
            </Link>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 shadow-glow-indigo">
              <Users className="w-3.5 h-3.5" /><span>Team</span>
            </button>
            <Link href={`/projects/${projectId}/risks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /><span>Risk Radar</span>
            </Link>
          </div>
        </div>

        {/* Skill Gap Analysis Card */}
        {skillGap && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /><span>Deterministic Skill Gap Analysis</span>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">Backend Calculated</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Coverage Meter */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#1e293b" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke={skillGap.coveragePercentage >= 80 ? '#10b981' : skillGap.coveragePercentage >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="3" strokeDasharray={`${skillGap.coveragePercentage}, 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white">
                    {skillGap.coveragePercentage}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Skill Coverage</span>
              </div>

              {/* Available */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Covered Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skillGap.availableSkills || []).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">{sk}</span>
                  ))}
                  {skillGap.availableSkills?.length === 0 && <span className="text-[10px] text-slate-500">None</span>}
                </div>
              </div>

              {/* Missing */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Missing Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skillGap.missingSkills || []).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300">{sk}</span>
                  ))}
                  {skillGap.missingSkills?.length === 0 && <span className="text-[10px] text-slate-500">None</span>}
                </div>
              </div>

              {/* Partially Covered */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Partially Covered</span>
                <div className="flex flex-wrap gap-1.5">
                  {(skillGap.partiallyCoveredSkills || []).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">{sk}</span>
                  ))}
                  {skillGap.partiallyCoveredSkills?.length === 0 && <span className="text-[10px] text-slate-500">None</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Members Grid */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /><span>Team Roster</span>
              <span className="text-[10px] text-slate-500 font-mono ml-2">{teamMembers.length} members</span>
            </h3>
            {teamSummary && (
              <span className="text-[10px] text-slate-400 font-mono">
                Total: {teamSummary.totalAssignedHours}h assigned / {teamSummary.totalAvailableHours}h available ({teamSummary.totalUtilization}% util)
              </span>
            )}
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No team members added yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((m) => (
                <div key={m._id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">{m.displayName}</span>
                      <span className="block text-[10px] text-slate-400">{m.role}</span>
                    </div>
                    <span className={`text-[10px] font-semibold capitalize ${expColors[m.experienceLevel] || 'text-slate-400'}`}>
                      {m.experienceLevel}
                    </span>
                  </div>

                  {/* Workload Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Capacity: {m.workload}h / {m.availabilityHours}h</span>
                      <span className={`font-semibold ${m.capacityStatus === 'over_capacity' ? 'text-rose-400' : m.capacityStatus === 'near_capacity' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {m.capacityUtilization}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${capColors[m.capacityStatus] || 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, m.capacityUtilization)}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-semibold ${m.capacityStatus === 'over_capacity' ? 'text-rose-400' : m.capacityStatus === 'near_capacity' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {capLabels[m.capacityStatus] || 'Under Capacity'}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {(m.skills || []).map((sk, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-300">{sk}</span>
                    ))}
                  </div>

                  {/* Remove Button */}
                  <button onClick={() => handleRemove(m._id)} className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors">
                    Remove Member
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" /><span>Add Team Member</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <input type="text" placeholder="Display Name *" required value={newMember.displayName}
                  onChange={(e) => setNewMember({ ...newMember, displayName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Role" value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                  <select value={newMember.experienceLevel} onChange={(e) => setNewMember({ ...newMember, experienceLevel: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <input type="text" placeholder="Skills (comma-separated)" value={newMember.skills}
                  onChange={(e) => setNewMember({ ...newMember, skills: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <input type="number" min="0" step="1" placeholder="Availability Hours/Week" value={newMember.availabilityHours}
                  onChange={(e) => setNewMember({ ...newMember, availabilityHours: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium">Cancel</button>
                  <button type="submit" disabled={adding} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50">
                    {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{adding ? 'Adding...' : 'Add Member'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
