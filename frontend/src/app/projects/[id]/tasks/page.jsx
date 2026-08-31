'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '../../../../components/ProtectedRoute/ProtectedRoute';
import { useProjectStore } from '../../../../store/useProjectStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  ArrowLeft, Loader2, Plus, X, Kanban, FolderGit2, BrainCircuit, Cpu,
  ShieldAlert, Bot, Sparkles, Clock, User, Flag, Layers, AlertCircle, CheckCircle2
} from 'lucide-react';

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-500', bg: 'bg-slate-500/10', textColor: 'text-slate-400' },
  { id: 'todo', label: 'Todo', color: 'border-blue-500', bg: 'bg-blue-500/10', textColor: 'text-blue-400' },
  { id: 'in_progress', label: 'In Progress', color: 'border-amber-500', bg: 'bg-amber-500/10', textColor: 'text-amber-400' },
  { id: 'blocked', label: 'Blocked', color: 'border-rose-500', bg: 'bg-rose-500/10', textColor: 'text-rose-400' },
  { id: 'review', label: 'Review', color: 'border-purple-500', bg: 'bg-purple-500/10', textColor: 'text-purple-400' },
  { id: 'completed', label: 'Completed', color: 'border-emerald-500', bg: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
];

const priorityConfig = {
  critical: { label: 'Critical', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  high: { label: 'High', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  medium: { label: 'Medium', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
};

const TaskCard = ({ task, index }) => {
  const pCfg = priorityConfig[task.priority] || priorityConfig.medium;
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3.5 rounded-2xl border border-slate-800 space-y-2.5 cursor-grab active:cursor-grabbing transition-shadow ${
            snapshot.isDragging ? 'bg-slate-800 shadow-xl ring-2 ring-indigo-500/40' : 'bg-slate-900/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-semibold text-white leading-tight line-clamp-2">{task.title}</span>
            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${pCfg.color}`}>
              {pCfg.label}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              {task.estimatedHours}h
            </span>
            {task.assignedMember && (
              <span className="flex items-center gap-1 text-indigo-300">
                <User className="w-3 h-3" />
                {task.assignedMember.displayName || 'Assigned'}
              </span>
            )}
            {task.milestoneId && (
              <span className="flex items-center gap-1 text-purple-300">
                <Flag className="w-3 h-3" />
                {typeof task.milestoneId === 'object' ? task.milestoneId.name : 'Milestone'}
              </span>
            )}
          </div>

          {task.requiredSkills?.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {task.requiredSkills.slice(0, 3).map((sk, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 border border-slate-700">
                  {sk}
                </span>
              ))}
              {task.requiredSkills.length > 3 && (
                <span className="text-[9px] text-slate-500">+{task.requiredSkills.length - 3}</span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default function TaskBoardPage() {
  const params = useParams();
  const projectId = params?.id;

  const {
    currentProject, tasks, milestones, isDetailLoading,
    fetchProjectById, fetchTasks, fetchMilestones, moveTask, createTask, error, clearError
  } = useProjectStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', description: '', milestoneId: '', estimatedHours: 4, priority: 'medium', status: 'todo', requiredSkills: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchTasks(projectId);
      fetchMilestones(projectId);
    }
  }, [projectId]);

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || task.status === newStatus) return;
    await moveTask(draggableId, newStatus);
  }, [tasks, moveTask]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    const skills = newTask.requiredSkills ? newTask.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    await createTask(projectId, {
      ...newTask,
      estimatedHours: parseFloat(newTask.estimatedHours) || 4,
      requiredSkills: skills
    });
    setCreating(false);
    setShowCreateModal(false);
    setNewTask({ title: '', description: '', milestoneId: '', estimatedHours: 4, priority: 'medium', status: 'todo', requiredSkills: '' });
  };

  if (isDetailLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading execution workspace...</p>
        </div>
      </ProtectedRoute>
    );
  }

  const tasksByStatus = {};
  COLUMNS.forEach((col) => { tasksByStatus[col.id] = []; });
  tasks.forEach((t) => {
    if (tasksByStatus[t.status]) tasksByStatus[t.status].push(t);
    else tasksByStatus['backlog'].push(t);
  });

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
                <Kanban className="w-3.5 h-3.5" /><span>Execution Workspace</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Task Board</h1>
              <p className="text-xs text-slate-400">Drag tasks between columns. Status changes persist to the database automatically.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-2 shadow-glow-indigo hover:-translate-y-0.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /><span>New Task</span>
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
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold flex items-center gap-2 shadow-glow-indigo">
              <Kanban className="w-3.5 h-3.5" /><span>Task Board</span>
            </button>
            <Link href={`/projects/${projectId}/team`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <User className="w-3.5 h-3.5" /><span>Team</span>
            </Link>
            <Link href={`/projects/${projectId}/risks`} className="px-4 py-2 rounded-xl text-slate-400 bg-slate-900/40 border border-slate-800/40 flex items-center gap-2 hover:text-white">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /><span>Risk Radar</span>
            </Link>
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {COLUMNS.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[300px] rounded-2xl border-t-2 ${col.color} ${
                      snapshot.isDraggingOver ? 'bg-slate-800/50' : 'bg-slate-900/30'
                    } p-3 space-y-3 transition-colors`}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${col.textColor}`}>{col.label}</span>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${col.bg} ${col.textColor}`}>
                        {tasksByStatus[col.id].length}
                      </span>
                    </div>

                    {tasksByStatus[col.id].length === 0 && (
                      <div className="text-center py-8 text-[10px] text-slate-600">No tasks</div>
                    )}

                    {tasksByStatus[col.id].map((task, index) => (
                      <TaskCard key={task._id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-400" /><span>Create New Task</span>
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateTask} className="space-y-4">
                <input type="text" placeholder="Task title *" required value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <textarea placeholder="Description (optional)" rows={2} value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select value={newTask.milestoneId} onChange={(e) => setNewTask({ ...newTask, milestoneId: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Milestone *</option>
                    {milestones.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="0.5" min="0.5" placeholder="Est. Hours *" value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                  <input type="text" placeholder="Skills (comma-separated)" value={newTask.requiredSkills}
                    onChange={(e) => setNewTask({ ...newTask, requiredSkills: e.target.value })}
                    className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium">Cancel</button>
                  <button type="submit" disabled={creating} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50">
                    {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{creating ? 'Creating...' : 'Create Task'}</span>
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
