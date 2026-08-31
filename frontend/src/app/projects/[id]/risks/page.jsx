'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../../../store/useProjectStore';
import {
  ArrowLeft, Loader2, Plus, X, ShieldAlert, FolderGit2, BrainCircuit, Cpu, Kanban,
  Users, AlertTriangle, CheckCircle2, ShieldCheck, Zap, RefreshCw, Filter, Sparkles,
  ArrowRight, Check, AlertCircle, Clock, BarChart2
} from 'lucide-react';

const severityColors = {
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/30 ring-1 ring-amber-500/20',
  medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 ring-1 ring-indigo-500/20',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
};

const severityBadge = {
  critical: 'bg-rose-500 text-white shadow-glow-rose font-bold',
  high: 'bg-amber-500 text-slate-950 font-bold',
  medium: 'bg-indigo-600 text-white font-medium',
  low: 'bg-slate-700 text-slate-300 font-medium'
};

const categoryLabels = {
  timeline: 'Timeline',
  technical: 'Technical',
  scope: 'Scope',
  skills: 'Skills',
  workload: 'Workload',
  dependency: 'Dependency',
  resource: 'Resource'
};

export default function RiskRadarPage() {
  const params = useParams();
  const projectId = params?.id;

  const {
    currentProject,
    risks,
    riskSummary,
    isRiskLoading,
    recoveryPlan,
    isRecoveryLoading,
    fetchProjectById,
    fetchRisks,
    detectRisks,
    createRisk,
    resolveRisk,
    fetchRecoveryPlan,
    applyRecoveryAction
  } = useProjectStore();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRisk, setNewRisk] = useState({
    title: '',
    description: '',
    category: 'technical',
    severity: 'medium',
    probability: 'medium',
    impact: 'medium',
    recommendedAction: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchRisks(projectId, { status: statusFilter, category: categoryFilter, severity: severityFilter });
      fetchRecoveryPlan(projectId);
    }
  }, [projectId]);

  const handleFilterChange = (cat, sev, stat) => {
    setCategoryFilter(cat);
    setSeverityFilter(sev);
    setStatusFilter(stat);
    fetchRisks(projectId, {
      category: cat !== 'all' ? cat : undefined,
      severity: sev !== 'all' ? sev : undefined,
      status: stat !== 'all' ? stat : undefined
    });
  };

  const handleDetectRisks = async () => {
    const res = await detectRisks(projectId);
    if (res?.success) {
      setActionSuccessMessage(`Detection completed! Identified ${res.detectedCount} potential risk item(s).`);
      fetchRecoveryPlan(projectId);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createRisk(projectId, newRisk);
    setIsSubmitting(false);
    if (res?.success) {
      setShowCreateModal(false);
      setNewRisk({
        title: '',
        description: '',
        category: 'technical',
        severity: 'medium',
        probability: 'medium',
        impact: 'medium',
        recommendedAction: ''
      });
      setActionSuccessMessage('Manual risk successfully registered.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleResolveRisk = async (riskId) => {
    const res = await resolveRisk(projectId, riskId);
    if (res?.success) {
      setActionSuccessMessage('Risk marked as resolved.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleExecuteRecovery = async (strategy) => {
    const res = await applyRecoveryAction(projectId, strategy);
    if (res?.success) {
      setActionSuccessMessage(`Recovery Action Executed: ${res.message}`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link href={`/projects/${projectId}`} className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Back to Project Overview</span>
          </Link>
        </div>

        {/* Top Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-glass space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5" /><span>Risk & Recovery Intelligence</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Project Risk Radar</h1>
              <p className="text-xs text-slate-400">Deterministic rule-based detection, real-time bottleneck alerts, and automated AI recovery strategies.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDetectRisks}
                disabled={isRiskLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRiskLoading ? 'animate-spin' : ''}`} />
                <span>{isRiskLoading ? 'Analyzing...' : 'Run Risk Radar'}</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-2 shadow-glow-indigo hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-4 h-4" /><span>Register Risk</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
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
            <Link href={`/projects/${projectId}/team`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <Users className="w-3.5 h-3.5" /><span>Team</span>
            </Link>
            <button className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold flex items-center gap-2 shadow-glow-rose">
              <ShieldAlert className="w-3.5 h-3.5" /><span>Risk Radar</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Severity Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Critical</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black text-white">{riskSummary?.critical || 0}</p>
            <span className="text-[10px] text-rose-300/80">Immediate attention</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">High</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">{riskSummary?.high || 0}</p>
            <span className="text-[10px] text-amber-300/80">Active bottlenecks</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Medium</span>
              <BarChart2 className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white">{riskSummary?.medium || 0}</p>
            <span className="text-[10px] text-indigo-300/80">Monitoring required</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Low</span>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-white">{riskSummary?.low || 0}</p>
            <span className="text-[10px] text-slate-500">Low impact</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{riskSummary?.resolved || 0}</p>
            <span className="text-[10px] text-emerald-300/80">Mitigated items</span>
          </div>
        </div>

        {/* AI Recovery Plan Section */}
        {recoveryPlan && recoveryPlan.strategies?.length > 0 && (
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-indigo-950/10 space-y-4 shadow-glow-indigo">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" /><span>AI Recovery Engine Recommendations</span>
                </div>
                <h3 className="text-base font-extrabold text-white">{recoveryPlan.summary}</h3>
                <p className="text-xs text-slate-300">
                  Status Assessment: <span className="font-semibold text-indigo-300">{recoveryPlan.projectStatusAssessment}</span> • Projected Completion: <span className="font-semibold text-white">~{recoveryPlan.projectedCompletionDays} days</span>
                </p>
              </div>
              <button
                onClick={() => fetchRecoveryPlan(projectId)}
                disabled={isRecoveryLoading}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white text-xs shrink-0"
                title="Recalculate strategies"
              >
                <RefreshCw className={`w-4 h-4 ${isRecoveryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {recoveryPlan.strategies.map((strategy) => (
                <div key={strategy.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-indigo-500/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase">
                        {strategy.actionType}
                      </span>
                      {strategy.estimatedHoursSaved > 0 && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />-{strategy.estimatedHoursSaved}h
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-tight">{strategy.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{strategy.rationale}</p>
                    <p className="text-[10px] text-indigo-300/80 font-medium">Impact: {strategy.impact}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
                    <button
                      onClick={() => handleExecuteRecovery(strategy)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow-indigo"
                    >
                      <Zap className="w-3 h-3" /><span>Approve & Execute</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /><span>Filter:</span>
            </span>

            {/* Status Pills */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['open', 'resolved', 'all'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleFilterChange(categoryFilter, severityFilter, st)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    statusFilter === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange(e.target.value, severityFilter, statusFilter)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => handleFilterChange(categoryFilter, e.target.value, statusFilter)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <span className="text-slate-500 font-mono text-[11px]">{risks.length} risk item(s) found</span>
        </div>

        {/* Risks Grid */}
        {isRiskLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-400">Scanning telemetry and evaluating deterministic risk models...</p>
          </div>
        ) : risks.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Risks Match Current Filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Project execution is currently operating within stable parameters. Click "Run Risk Radar" to rescan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <div
                key={risk._id}
                className={`p-5 rounded-3xl border ${
                  risk.status === 'resolved' ? 'border-slate-800 bg-slate-900/40 opacity-75' : severityColors[risk.severity] || 'border-slate-800 bg-slate-900/70'
                } space-y-4 transition-all hover:border-slate-700`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase ${severityBadge[risk.severity] || severityBadge.medium}`}>
                        {risk.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                        {categoryLabels[risk.category] || risk.category}
                      </span>
                      {risk.status === 'resolved' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          Resolved
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {risk.source === 'deterministic_engine' ? 'Engine Detected' : 'Manual Entry'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white pt-1">{risk.title}</h3>
                  </div>

                  {risk.status === 'open' && (
                    <button
                      onClick={() => handleResolveRisk(risk._id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" /><span>Resolve</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{risk.description}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Probability: <strong className="text-white capitalize">{risk.probability || 'Medium'}</strong></span>
                  <span className="text-slate-400">Impact: <strong className="text-white capitalize">{risk.impact || 'Medium'}</strong></span>
                </div>

                {risk.recommendedAction && (
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-400" /><span>Recommended Mitigation:</span>
                    </span>
                    <p className="text-xs text-indigo-200/90 leading-relaxed">{risk.recommendedAction}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Manual Risk Creation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /><span>Register Custom Risk</span>
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRisk} className="space-y-4">
                <input
                  type="text"
                  placeholder="Risk Title *"
                  required
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />

                <textarea
                  placeholder="Description of the risk and expected failure modes *"
                  required
                  rows={3}
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newRisk.category}
                    onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {Object.entries(categoryLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v} Category</option>
                    ))}
                  </select>

                  <select
                    value={newRisk.severity}
                    onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Severity</option>
                    <option value="medium">Medium Severity</option>
                    <option value="high">High Severity</option>
                    <option value="critical">Critical Severity</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newRisk.probability}
                    onChange={(e) => setNewRisk({ ...newRisk, probability: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Probability</option>
                    <option value="medium">Medium Probability</option>
                    <option value="high">High Probability</option>
                  </select>

                  <select
                    value={newRisk.impact}
                    onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Impact</option>
                    <option value="medium">Medium Impact</option>
                    <option value="high">High Impact</option>
                  </select>
                </div>

                <textarea
                  placeholder="Recommended mitigation strategy"
                  rows={2}
                  value={newRisk.recommendedAction}
                  onChange={(e) => setNewRisk({ ...newRisk, recommendedAction: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 shadow-glow-rose"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{isSubmitting ? 'Registering...' : 'Register Risk'}</span>
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
