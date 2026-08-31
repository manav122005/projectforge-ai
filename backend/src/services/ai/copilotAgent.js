const { queryAIProvider } = require('./aiProviderService');
const Task = require('../../models/taskModel');
const Milestone = require('../../models/milestoneModel');
const ProjectMember = require('../../models/projectMemberModel');
const Risk = require('../../models/riskModel');
const { calculateMemberWorkload, calculateProjectWorkloadSummary } = require('../workloadEngineService');
const { getSkillGapAnalysis } = require('../teamService');
const { logEvent } = require('../projectEventService');

const COPILOT_SYSTEM_PROMPT = `You are ProjectForge AI Copilot — an expert AI technical project strategist embedded directly in the project workspace.
Your mission is to provide accurate, actionable, deeply contextual project intelligence.

CRITICAL RULES:
1. Ground your answers strictly in the provided project data (tasks, milestones, team, risks, health scores, architecture).
2. NEVER invent non-existent tasks, fictitious team members, imaginary deadlines, or fake metrics.
3. If specific information is missing or not configured in the workspace, explicitly tell the user that it is not available.
4. Provide structured, concise, professional markdown responses with bullet points where appropriate.
5. Return your output as valid JSON matching this schema:
{
  "answer": "string (markdown formatted response)",
  "suggestedActions": ["string", "string"],
  "contextSummary": "string",
  "confidence": number
}`;

/**
 * Build rich grounded context from real database collections
 */
const buildProjectContext = async (project, userId) => {
  const projectId = project._id;

  const [tasks, milestones, members, risks, skillGapData] = await Promise.all([
    Task.find({ projectId }).populate('assignedMember', 'displayName role'),
    Milestone.find({ projectId }),
    ProjectMember.find({ projectId }),
    Risk.find({ projectId, status: 'open' }),
    getSkillGapAnalysis(projectId, userId).catch(() => ({ skillGap: null }))
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');
  const todoTasks = tasks.filter((t) => t.status === 'todo');

  const memberWorkloads = await Promise.all(
    members.map(async (m) => {
      const wl = await calculateMemberWorkload(m._id, m.availabilityHours);
      return {
        name: m.displayName,
        role: m.role,
        skills: m.skills,
        availability: m.availabilityHours,
        assignedWorkload: wl.workload,
        capacityUtilization: `${wl.capacityUtilization}%`,
        status: wl.capacityStatus
      };
    })
  );

  const workloadSummary = await calculateProjectWorkloadSummary(projectId, members);

  return {
    projectName: project.name,
    description: project.description || 'No description',
    status: project.status,
    healthScore: project.healthScore,
    healthBreakdown: project.healthBreakdown,
    techStack: (project.technologyStack || []).map((t) => `${t.technology} (${t.category})`),
    requiredSkills: project.requiredSkills || [],
    skillGap: skillGapData?.skillGap || null,
    milestones: milestones.map((m) => ({
      name: m.name,
      status: m.status,
      dueDate: m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No date set'
    })),
    taskMetrics: {
      total: totalTasks,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      blocked: blockedTasks.length,
      todo: todoTasks.length
    },
    sampleTasks: tasks.slice(0, 10).map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      hours: t.estimatedHours,
      assigned: t.assignedMember?.displayName || 'Unassigned'
    })),
    teamMembers: memberWorkloads,
    workloadSummary,
    openRisks: risks.map((r) => ({
      title: r.title,
      category: r.category,
      severity: r.severity,
      recommendation: r.recommendedAction
    }))
  };
};

/**
 * Deterministic Context-Aware Copilot Fallback Generator
 */
const generateDeterministicCopilotResponse = (query, context) => {
  const q = query.toLowerCase();
  let answer = '';
  const suggestedActions = [];

  if (q.includes('health') || q.includes('score') || q.includes('low') || q.includes('why')) {
    const hb = context.healthBreakdown || {};
    answer = `### 📊 Project Health Assessment (${context.healthScore}/100)\n\n` +
      `Your project health is currently **${context.healthScore >= 75 ? 'Healthy' : context.healthScore >= 60 ? 'Needs Attention' : 'At Risk'}** with the following subscore breakdown:\n\n` +
      `- **Technical Feasibility:** ${hb.technical || 80}/100\n` +
      `- **Timeline Feasibility:** ${hb.timeline || 70}/100\n` +
      `- **Skill Readiness:** ${hb.skillReadiness || 65}/100\n` +
      `- **Scope Complexity:** ${hb.scope || 75}/100\n` +
      `- **Team Capacity:** ${hb.team || 85}/100\n\n` +
      (context.openRisks.length > 0
        ? `**Identified Factors:** There are **${context.openRisks.length} open risk(s)**, notably *"${context.openRisks[0].title}"* (${context.openRisks[0].severity} severity).`
        : `**Status:** Execution metrics are balanced with no critical risks active.`);
    suggestedActions.push('View Risk Radar', 'Review Skill Gaps');
  } else if (q.includes('overload') || q.includes('capacity') || q.includes('member') || q.includes('who')) {
    const overloaded = context.teamMembers.filter((m) => m.status === 'over_capacity');
    if (overloaded.length > 0) {
      answer = `### ⚠️ Overloaded Team Members\n\n` +
        overloaded.map((m) => `- **${m.name}** (${m.role}): **${m.assignedWorkload}h assigned** vs ${m.availability}h capacity (${m.capacityUtilization} utilization)`).join('\n') +
        `\n\n**Recommendation:** Reassign tasks to under-capacity team members to avoid burnout.`;
      suggestedActions.push('Open Team Roster', 'Rebalance Tasks on Kanban');
    } else {
      answer = `### ✅ Team Workload Balanced\n\n` +
        `All **${context.teamMembers.length} team member(s)** are operating within healthy capacity limits.\n` +
        `Total project load is **${context.workloadSummary.totalAssignedHours}h** / **${context.workloadSummary.totalAvailableHours}h** (${context.workloadSummary.totalUtilization}% total utilization).`;
      suggestedActions.push('Assign New Tasks', 'View Task Board');
    }
  } else if (q.includes('skill') || q.includes('missing') || q.includes('gap')) {
    const sg = context.skillGap;
    if (sg && sg.missingSkills && sg.missingSkills.length > 0) {
      answer = `### 🎯 Skill Gap Analysis (${sg.coveragePercentage}% Coverage)\n\n` +
        `- **Covered Skills:** ${sg.availableSkills.join(', ') || 'None'}\n` +
        `- **Missing Skills:** ${sg.missingSkills.map((s) => `\`${s}\``).join(', ')}\n` +
        (sg.criticalMissingSkills?.length > 0 ? `- **Critical Missing:** ${sg.criticalMissingSkills.join(', ')}\n\n` : '\n') +
        `**Recommendation:** Consider upskilling team members or using pre-built libraries/APIs.`;
      suggestedActions.push('Open Team & Skills Page', 'View AI Technology Recommendations');
    } else {
      answer = `### 🎯 Full Skill Coverage\n\nAll required project skills (${context.requiredSkills.join(', ')}) are covered by your team roster!`;
      suggestedActions.push('View Task Board', 'Review Architecture');
    }
  } else if (q.includes('work on') || q.includes('today') || q.includes('next') || q.includes('task') || q.includes('priorit')) {
    answer = `### 📋 Priority Execution Focus\n\n` +
      `Here is the current task breakdown for **${context.projectName}**:\n\n` +
      `- **In Progress (${context.taskMetrics.inProgress}):** Focus on moving these to review/completed.\n` +
      `- **Blocked (${context.taskMetrics.blocked}):** ${context.taskMetrics.blocked > 0 ? '⚠️ High priority: Unblock dependencies immediately.' : 'No blocked tasks.'}\n` +
      `- **Ready in Todo (${context.taskMetrics.todo}):** Next items to pick up.\n\n` +
      `**Top Active Deliverables:**\n` +
      (context.sampleTasks.slice(0, 4).map((t) => `- [${t.status.toUpperCase()}] **${t.title}** (${t.priority} priority, ${t.hours}h) — Assigned: *${t.assigned}*`).join('\n') || '- No tasks created yet.');
    suggestedActions.push('Open Kanban Board', 'Create New Task');
  } else {
    answer = `### 🤖 ProjectForge AI Workspace Assistant\n\n` +
      `**Project:** ${context.projectName}\n` +
      `**Health Score:** ${context.healthScore}/100\n` +
      `**Tasks:** ${context.taskMetrics.completed}/${context.taskMetrics.total} Completed (${context.taskMetrics.inProgress} In Progress, ${context.taskMetrics.blocked} Blocked)\n` +
      `**Open Risks:** ${context.openRisks.length}\n\n` +
      `You can ask me about:\n` +
      `- *"Why is my project health score low?"*\n` +
      `- *"What should our team work on today?"*\n` +
      `- *"Which team member is overloaded?"*\n` +
      `- *"What skills are we missing?"*`;
    suggestedActions.push('Why is health score low?', 'What should we work on today?', 'Which member is overloaded?');
  }

  return {
    answer,
    suggestedActions,
    contextSummary: `Derived from live project data for "${context.projectName}"`,
    confidence: 0.95
  };
};

/**
 * Ask Project Copilot
 */
const askProjectCopilot = async (project, userId, userMessage) => {
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
    const error = new Error('Message prompt is required');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const context = await buildProjectContext(project, userId);

  const fallback = () => generateDeterministicCopilotResponse(userMessage, context);

  let responseData;
  let providerUsed = 'deterministic_fallback';
  let modelUsed = 'rule_engine';

  try {
    const aiResult = await queryAIProvider({
      systemPrompt: COPILOT_SYSTEM_PROMPT,
      userPrompt: `User Question: "${userMessage}"\n\nLive Project Context:\n${JSON.stringify(context, null, 2)}`,
      fallbackHandler: fallback
    });

    if (aiResult.data && aiResult.data.answer) {
      responseData = aiResult.data;
      providerUsed = aiResult.provider;
      modelUsed = aiResult.model;
    } else {
      responseData = fallback();
    }
  } catch (err) {
    responseData = fallback();
  }

  // Log Copilot Event
  await logEvent({
    projectId: project._id,
    userId,
    type: 'COPILOT_QUERY',
    message: `Copilot query: "${userMessage.slice(0, 80)}${userMessage.length > 80 ? '...' : ''}"`,
    metadata: { query: userMessage, confidence: responseData.confidence }
  });

  return {
    answer: responseData.answer,
    suggestedActions: responseData.suggestedActions || ['View Tasks', 'Check Health'],
    contextSummary: responseData.contextSummary || 'Live Project Data',
    confidence: responseData.confidence || 0.90,
    provider: providerUsed,
    model: modelUsed
  };
};

module.exports = {
  askProjectCopilot,
  buildProjectContext
};
