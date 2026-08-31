import { create } from 'zustand';
import { api } from '../services/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  members: [],
  architecture: { nodes: [], edges: [] },
  aiAnalysis: null,
  aiPlan: null,
  isOwner: false,
  pagination: { total: 0, page: 1, limit: 20, pages: 1 },
  isLoading: false,
  isDetailLoading: false,
  isAiLoading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    sortBy: 'createdAt',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchProjects();
  },

  clearError: () => set({ error: null }),

  fetchProjects: async (overrideFilters = {}) => {
    set({ isLoading: true, error: null });
    const filters = { ...get().filters, ...overrideFilters };
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

      const response = await api.get(`/projects?${queryParams.toString()}`);
      if (response && response.success && response.data) {
        set({
          projects: response.data.projects || [],
          pagination: response.data.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch projects.';
      set({ isLoading: false, error: errorMsg, projects: [] });
    }
  },

  fetchProjectById: async (id) => {
    set({ isDetailLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${id}`);
      if (response && response.success && response.data) {
        set({
          currentProject: response.data.project,
          members: response.data.members || [],
          architecture: response.data.project?.architecture || { nodes: [], edges: [] },
          isOwner: response.data.isOwner || false,
          isDetailLoading: false,
          error: null,
        });
        return { success: true, project: response.data.project };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch project details.';
      set({ isDetailLoading: false, error: errorMsg, currentProject: null });
      return { success: false, error: errorMsg };
    }
  },

  createProject: async ({ name, description, originalIdea }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/projects', { name, description, originalIdea });
      if (response && response.success && response.data) {
        const newProj = response.data.project;
        set((state) => ({
          projects: [newProj, ...state.projects],
          isLoading: false,
          error: null,
        }));
        return { success: true, project: newProj };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create project.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  updateProject: async (id, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/projects/${id}`, updateData);
      if (response && response.success && response.data) {
        const updated = response.data.project;
        set((state) => ({
          projects: state.projects.map((p) => (p._id === id ? { ...p, ...updated } : p)),
          currentProject: state.currentProject?._id === id ? updated : state.currentProject,
          isLoading: false,
          error: null,
        }));
        return { success: true, project: updated };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update project.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/projects/${id}`);
      if (response && response.success) {
        set((state) => ({
          projects: state.projects.filter((p) => p._id !== id),
          currentProject: state.currentProject?._id === id ? null : state.currentProject,
          isLoading: false,
          error: null,
        }));
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete project.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  duplicateProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${id}/duplicate`);
      if (response && response.success && response.data) {
        const duplicated = response.data.project;
        set((state) => ({
          projects: [duplicated, ...state.projects],
          isLoading: false,
          error: null,
        }));
        return { success: true, project: duplicated };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to duplicate project.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  archiveProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${id}/archive`);
      if (response && response.success && response.data) {
        const archived = response.data.project;
        set((state) => ({
          projects: state.projects.map((p) => (p._id === id ? archived : p)),
          currentProject: state.currentProject?._id === id ? archived : state.currentProject,
          isLoading: false,
          error: null,
        }));
        return { success: true, project: archived };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to archive project.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // ----------------------------------------------------
  // Phase 3 AI Methods
  // ----------------------------------------------------
  previewAnalysis: async ({ idea, context }) => {
    set({ isAiLoading: true, error: null });
    try {
      const response = await api.post('/projects/analyze', { idea, context });
      if (response && response.success && response.data) {
        set({ isAiLoading: false });
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.message || 'AI preview analysis failed.';
      set({ isAiLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  analyzeProject: async (id) => {
    set({ isAiLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${id}/analyze`);
      if (response && response.success && response.data) {
        const { project, analysis, health, provider } = response.data;
        set((state) => ({
          currentProject: project,
          aiAnalysis: analysis,
          isAiLoading: false,
          error: null
        }));
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = err.message || 'AI project analysis failed.';
      set({ isAiLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  generateArchitecture: async (id) => {
    set({ isAiLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${id}/generate-architecture`);
      if (response && response.success && response.data) {
        const { architecture, provider } = response.data;
        set({
          architecture,
          isAiLoading: false,
          error: null
        });
        // Refresh currentProject so health score reflects the new architecture nodes
        get().fetchProjectById(id);
        return { success: true, architecture, provider };
      }
    } catch (err) {
      const errorMsg = err.message || 'Architecture generation failed.';
      set({ isAiLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  generatePlan: async (id) => {
    set({ isAiLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${id}/generate-plan`);
      if (response && response.success && response.data) {
        const { plan, provider } = response.data;
        set({
          aiPlan: plan,
          isAiLoading: false,
          error: null
        });
        return { success: true, plan, provider };
      }
    } catch (err) {
      const errorMsg = err.message || 'Plan generation failed.';
      set({ isAiLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  // ----------------------------------------------------
  // Phase 4 Execution Workspace Methods
  // ----------------------------------------------------
  milestones: [],
  tasks: [],
  teamMembers: [],
  skillGap: null,
  teamSummary: null,

  fetchMilestones: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/milestones`);
      if (response?.success) {
        set({ milestones: response.data.milestones || [] });
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false };
    }
  },

  createMilestone: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/milestones`, data);
      if (response?.success) {
        set((s) => ({ milestones: [...s.milestones, response.data.milestone] }));
        return { success: true, milestone: response.data.milestone };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  updateMilestone: async (milestoneId, data) => {
    try {
      const response = await api.put(`/milestones/${milestoneId}`, data);
      if (response?.success) {
        set((s) => ({
          milestones: s.milestones.map((m) => m._id === milestoneId ? response.data.milestone : m)
        }));
        return { success: true };
      }
      return { success: false, error: 'Update failed' };
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  deleteMilestone: async (milestoneId) => {
    try {
      const response = await api.delete(`/milestones/${milestoneId}`);
      if (response?.success) {
        set((s) => ({ milestones: s.milestones.filter((m) => m._id !== milestoneId) }));
        return { success: true };
      }
      return { success: false, error: 'Delete failed' };
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  fetchTasks: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const response = await api.get(`/projects/${projectId}/tasks?${params.toString()}`);
      if (response?.success) {
        set({ tasks: response.data.tasks || [] });
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false };
    }
  },

  createTask: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, data);
      if (response?.success) {
        set((s) => ({ tasks: [response.data.task, ...s.tasks] }));
        return { success: true, task: response.data.task };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  updateTask: async (taskId, data) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, data);
      if (response?.success) {
        set((s) => ({
          tasks: s.tasks.map((t) => t._id === taskId ? response.data.task : t)
        }));
        return { success: true, task: response.data.task };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response?.success) {
        set((s) => ({ tasks: s.tasks.filter((t) => t._id !== taskId) }));
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Optimistic Kanban status update with rollback
  moveTask: async (taskId, newStatus) => {
    const prevTasks = get().tasks;
    // Optimistic update
    set((s) => ({
      tasks: s.tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t)
    }));
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (response?.success) {
        set((s) => ({
          tasks: s.tasks.map((t) => t._id === taskId ? response.data.task : t)
        }));
        return { success: true };
      } else {
        set({ tasks: prevTasks }); // Rollback
        return { success: false };
      }
    } catch (err) {
      set({ tasks: prevTasks, error: err.message }); // Rollback
      return { success: false, error: err.message };
    }
  },

  fetchTeamMembers: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      if (response?.success) {
        set({
          teamMembers: response.data.members || [],
          teamSummary: response.data.summary || null
        });
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false };
    }
  },

  addTeamMember: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/members`, data);
      if (response?.success) {
        set((s) => ({ teamMembers: [...s.teamMembers, response.data.member] }));
        return { success: true, member: response.data.member };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  updateTeamMember: async (projectId, memberId, data) => {
    try {
      const response = await api.put(`/projects/${projectId}/members/${memberId}`, data);
      if (response?.success) {
        set((s) => ({
          teamMembers: s.teamMembers.map((m) => m._id === memberId ? response.data.member : m)
        }));
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  removeTeamMember: async (projectId, memberId) => {
    try {
      const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
      if (response?.success) {
        set((s) => ({ teamMembers: s.teamMembers.filter((m) => m._id !== memberId) }));
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  fetchSkillGap: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/skill-gap`);
      if (response?.success) {
        set({ skillGap: response.data.skillGap || null });
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false };
    }
  },

  // ----------------------------------------------------
  // Phase 5 & 6 Risk, Recovery, Events & Copilot Methods
  // ----------------------------------------------------
  risks: [],
  riskSummary: null,
  isRiskLoading: false,
  recoveryPlan: null,
  isRecoveryLoading: false,
  projectEvents: [],
  isEventsLoading: false,
  copilotMessages: [],
  isCopilotLoading: false,
  notifications: [],
  unreadNotificationsCount: 0,

  fetchRisks: async (projectId, filters = {}) => {
    set({ isRiskLoading: true });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v && v !== 'all') params.append(k, v); });
      const response = await api.get(`/projects/${projectId}/risks?${params.toString()}`);
      if (response?.success) {
        set({
          risks: response.data.risks || [],
          riskSummary: response.data.summary || null,
          isRiskLoading: false
        });
        return { success: true };
      }
    } catch (err) {
      set({ isRiskLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  detectRisks: async (projectId) => {
    set({ isRiskLoading: true });
    try {
      const response = await api.post(`/projects/${projectId}/risks/detect`);
      if (response?.success) {
        set({
          risks: response.data.risks || [],
          isRiskLoading: false
        });
        get().fetchRisks(projectId);
        get().fetchProjectById(projectId);
        return { success: true, detectedCount: response.data.detectedCount };
      }
    } catch (err) {
      set({ isRiskLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  createRisk: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/risks`, data);
      if (response?.success) {
        set((s) => ({ risks: [response.data.risk, ...s.risks] }));
        get().fetchRisks(projectId);
        get().fetchProjectById(projectId);
        return { success: true, risk: response.data.risk };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  resolveRisk: async (projectId, riskId) => {
    try {
      const response = await api.post(`/projects/${projectId}/risks/${riskId}/resolve`);
      if (response?.success) {
        set((s) => ({
          risks: s.risks.map((r) => r._id === riskId ? response.data.risk : r)
        }));
        get().fetchRisks(projectId);
        get().fetchProjectById(projectId);
        return { success: true };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  fetchRecoveryPlan: async (projectId) => {
    set({ isRecoveryLoading: true });
    try {
      const response = await api.post(`/projects/${projectId}/recovery-plan`);
      if (response?.success) {
        set({
          recoveryPlan: response.data.recoveryPlan || null,
          isRecoveryLoading: false
        });
        return { success: true, recoveryPlan: response.data.recoveryPlan };
      }
    } catch (err) {
      set({ isRecoveryLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  applyRecoveryAction: async (projectId, action) => {
    try {
      const response = await api.post(`/projects/${projectId}/recovery-plan/apply`, action);
      if (response?.success) {
        // Refresh project data, tasks, and risks
        get().fetchProjectById(projectId);
        get().fetchTasks(projectId);
        get().fetchRisks(projectId);
        get().fetchProjectEvents(projectId);
        // Remove applied strategy from active plan in state
        set((s) => ({
          recoveryPlan: s.recoveryPlan
            ? {
                ...s.recoveryPlan,
                strategies: s.recoveryPlan.strategies.filter((st) => st.id !== action.id)
              }
            : null
        }));
        return { success: true, message: response.data.message };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  fetchProjectEvents: async (projectId) => {
    set({ isEventsLoading: true });
    try {
      const response = await api.get(`/projects/${projectId}/events`);
      if (response?.success) {
        set({
          projectEvents: response.data.events || [],
          isEventsLoading: false
        });
        return { success: true };
      }
    } catch (err) {
      set({ isEventsLoading: false });
      return { success: false };
    }
  },

  askCopilot: async (projectId, message) => {
    set({ isCopilotLoading: true });
    // Add user query immediately to chat
    const userMsg = { id: `u_${Date.now()}`, sender: 'user', text: message, timestamp: new Date() };
    set((s) => ({ copilotMessages: [...s.copilotMessages, userMsg] }));

    try {
      const response = await api.post(`/projects/${projectId}/copilot`, { message });
      if (response?.success) {
        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: 'copilot',
          text: response.data.answer,
          suggestedActions: response.data.suggestedActions || [],
          contextSummary: response.data.contextSummary || 'Live Workspace Context',
          confidence: response.data.confidence,
          timestamp: new Date()
        };
        set((s) => ({
          copilotMessages: [...s.copilotMessages, botMsg],
          isCopilotLoading: false
        }));
        return { success: true, data: response.data };
      }
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'copilot',
        text: `⚠️ Copilot encountered an error: ${err.message}. Please try asking again.`,
        timestamp: new Date()
      };
      set((s) => ({
        copilotMessages: [...s.copilotMessages, errorMsg],
        isCopilotLoading: false
      }));
      return { success: false, error: err.message };
    }
  },

  clearCopilotMessages: () => set({ copilotMessages: [] }),

  fetchNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      if (response?.success) {
        set({
          notifications: response.data.notifications || [],
          unreadNotificationsCount: response.data.unreadCount || 0
        });
      }
    } catch (err) {
      // Non-blocking notification fetch
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((s) => ({
        notifications: s.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n),
        unreadNotificationsCount: Math.max(0, s.unreadNotificationsCount - 1)
      }));
    } catch (err) {
      // ignore
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        unreadNotificationsCount: 0
      }));
    } catch (err) {
      // ignore
    }
  },

  seedDemoProject: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/projects/demo/seed');
      if (response?.success) {
        set({ isLoading: false });
        get().fetchProjects();
        return { success: true, project: response.data.project };
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return { success: false, error: err.message };
    }
  }
}));

