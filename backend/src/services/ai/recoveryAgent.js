const { queryAIProvider } = require('./aiProviderService');
const Task = require('../../models/taskModel');
const ProjectMember = require('../../models/projectMemberModel');
const Milestone = require('../../models/milestoneModel');
const { calculateMemberWorkload } = require('../workloadEngineService');
const { logEvent } = require('../projectEventService');
const { createNotification } = require('../notificationService');

const RECOVERY_AGENT_SYSTEM_PROMPT = `You are the ProjectForge AI Recovery Agent.
Your role is to formulate actionable, high-impact recovery recommendations for at-risk software projects.
You must return structured JSON matching this schema:
{
  "summary": "string",
  "projectStatusAssessment": "string",
  "projectedCompletionDays": number,
  "confidence": number,
  "strategies": [
    {
      "id": "string",
      "actionType": "descoping" | "reassignment" | "timeline_shift" | "unblock",
      "title": "string",
      "rationale": "string",
      "impact": "string",
      "estimatedHoursSaved": number,
      "payload": {
        "targetTaskId": "string (optional)",
        "targetMemberId": "string (optional)",
        "targetMilestoneId": "string (optional)",
        "newStatus": "string (optional)"
      }
    }
  ]
}
Do not hallucinate fake team members or fake tasks. Use provided real IDs when referencing tasks or members. Return ONLY JSON.`;

/**
 * Generate structured recovery recommendations based on project state and active risks
 */
const generateRecoveryPlan = async (project, activeRisks = []) => {
  const projectId = project._id;

  const tasks = await Task.find({ projectId }).populate('assignedMember', 'displayName');
  const members = await ProjectMember.find({ projectId });
  const milestones = await Milestone.find({ projectId });

  const incompleteTasks = tasks.filter((t) => t.status !== 'completed');
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');
  const lowPriorityTasks = incompleteTasks.filter((t) => ['low', 'medium'].includes(t.priority));

  const memberWorkloads = await Promise.all(
    members.map(async (m) => ({
      member: m,
      wl: await calculateMemberWorkload(m._id, m.availabilityHours)
    }))
  );

  const overloaded = memberWorkloads.filter((mw) => mw.wl.capacityStatus === 'over_capacity');
  const underCapacity = memberWorkloads.filter((mw) => mw.wl.capacityStatus === 'under_capacity');

  // Generate deterministic baseline strategies
  const deterministicStrategies = [];

  // Strategy 1: Reassign tasks from overloaded to under-capacity members
  if (overloaded.length > 0 && underCapacity.length > 0) {
    const fromMember = overloaded[0].member;
    const toMember = underCapacity[0].member;
    const candidateTask = incompleteTasks.find(
      (t) => t.assignedMember && t.assignedMember._id.toString() === fromMember._id.toString()
    );

    if (candidateTask) {
      deterministicStrategies.push({
        id: `reassign_${Date.now()}_1`,
        actionType: 'reassignment',
        title: `Rebalance Workload: Reassign "${candidateTask.title}"`,
        rationale: `${fromMember.displayName} is over capacity (${overloaded[0].wl.capacityUtilization}%). Reassigning to ${toMember.displayName} (${underCapacity[0].wl.capacityUtilization}% utilized) balances team throughput.`,
        impact: `Reduces ${candidateTask.estimatedHours}h from overloaded engineer.`,
        estimatedHoursSaved: candidateTask.estimatedHours || 4,
        payload: {
          targetTaskId: candidateTask._id.toString(),
          targetMemberId: toMember._id.toString()
        }
      });
    }
  }

  // Strategy 2: Descope non-essential task to backlog
  if (lowPriorityTasks.length > 0 && (activeRisks.some((r) => r.category === 'timeline') || overloaded.length > 0)) {
    const taskToDescope = lowPriorityTasks[0];
    deterministicStrategies.push({
      id: `descope_${Date.now()}_2`,
      actionType: 'descoping',
      title: `MVP Scope Optimization: Defer "${taskToDescope.title}" to Backlog`,
      rationale: `Task has ${taskToDescope.priority} priority. Deferring it frees up ${taskToDescope.estimatedHours}h to focus exclusively on critical path deliverables.`,
      impact: `Reduces active sprint scope by ${taskToDescope.estimatedHours} hours.`,
      estimatedHoursSaved: taskToDescope.estimatedHours || 4,
      payload: {
        targetTaskId: taskToDescope._id.toString(),
        newStatus: 'backlog'
      }
    });
  }

  // Strategy 3: Unblock blocked tasks
  if (blockedTasks.length > 0) {
    const blockedTask = blockedTasks[0];
    deterministicStrategies.push({
      id: `unblock_${Date.now()}_3`,
      actionType: 'unblock',
      title: `Triage Dependency Blocker: Unblock "${blockedTask.title}"`,
      rationale: `Task is blocked. Transitioning to Todo after resolving dependencies will restore team velocity.`,
      impact: `Resumes progress on ${blockedTask.estimatedHours}h of stalled work.`,
      estimatedHoursSaved: 0,
      payload: {
        targetTaskId: blockedTask._id.toString(),
        newStatus: 'todo'
      }
    });
  }

  const deterministicPlan = {
    summary: deterministicStrategies.length > 0
      ? `Identified ${deterministicStrategies.length} tactical actions to recover velocity and mitigate ${activeRisks.length} active risk(s).`
      : 'Project is operating smoothly. No emergency scope reduction required.',
    projectStatusAssessment: activeRisks.some((r) => r.severity === 'critical')
      ? 'High Risk — immediate intervention recommended'
      : activeRisks.length > 0
      ? 'Needs Attention — preventative rebalancing advised'
      : 'Healthy — baseline execution on track',
    projectedCompletionDays: Math.max(7, Math.round(incompleteTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0) / 8)),
    confidence: 0.88,
    strategies: deterministicStrategies
  };

  try {
    const contextPrompt = `Project: "${project.name}"
Active Risks (${activeRisks.length}): ${activeRisks.map((r) => `${r.title} [${r.severity}]`).join('; ')}
Tasks Count: ${tasks.length} (Incomplete: ${incompleteTasks.length}, Blocked: ${blockedTasks.length})
Overloaded Members: ${overloaded.map((o) => `${o.member.displayName} (${o.wl.capacityUtilization}%)`).join(', ') || 'None'}
Under-capacity Members: ${underCapacity.map((u) => `${u.member.displayName} (${u.wl.capacityUtilization}%)`).join(', ') || 'None'}
Available Task IDs for action: ${incompleteTasks.slice(0, 5).map((t) => `${t._id}: "${t.title}" (${t.priority})`).join(', ')}`;

    const aiResult = await queryAIProvider({
      systemPrompt: RECOVERY_AGENT_SYSTEM_PROMPT,
      userPrompt: `Generate an actionable recovery plan for this project:\n\n${contextPrompt}`,
      fallbackHandler: () => deterministicPlan
    });

    if (aiResult.data && Array.isArray(aiResult.data.strategies) && aiResult.data.strategies.length > 0) {
      return {
        recoveryPlan: aiResult.data,
        provider: aiResult.provider,
        model: aiResult.model
      };
    }
  } catch (err) {
    // Return deterministic plan on any AI error
  }

  return {
    recoveryPlan: deterministicPlan,
    provider: 'deterministic_fallback',
    model: 'rule_engine'
  };
};

/**
 * Safely execute an approved recovery action (Human-in-the-loop approval)
 */
const applyRecoveryAction = async (projectId, userId, action) => {
  const { actionType, payload = {} } = action;
  let resultMessage = '';

  if (actionType === 'descoping' && payload.targetTaskId) {
    const task = await Task.findOne({ _id: payload.targetTaskId, projectId });
    if (task) {
      task.status = 'backlog';
      await task.save();
      resultMessage = `Task "${task.title}" deferred to backlog.`;
    }
  } else if (actionType === 'reassignment' && payload.targetTaskId && payload.targetMemberId) {
    const task = await Task.findOne({ _id: payload.targetTaskId, projectId });
    const member = await ProjectMember.findOne({ _id: payload.targetMemberId, projectId });
    if (task && member) {
      task.assignedMember = member._id;
      await task.save();
      resultMessage = `Task "${task.title}" reassigned to ${member.displayName}.`;
    }
  } else if (actionType === 'unblock' && payload.targetTaskId) {
    const task = await Task.findOne({ _id: payload.targetTaskId, projectId });
    if (task) {
      task.status = 'todo';
      await task.save();
      resultMessage = `Task "${task.title}" unblocked and moved to Todo.`;
    }
  } else if (actionType === 'timeline_shift' && payload.targetMilestoneId && payload.newDueDate) {
    const milestone = await Milestone.findOne({ _id: payload.targetMilestoneId, projectId });
    if (milestone) {
      milestone.dueDate = new Date(payload.newDueDate);
      await milestone.save();
      resultMessage = `Milestone "${milestone.name}" due date adjusted.`;
    }
  } else {
    resultMessage = `Action executed: ${action.title || 'General mitigation applied'}`;
  }

  // Log event
  await logEvent({
    projectId,
    userId,
    type: 'RECOVERY_APPLIED',
    message: `Applied recovery action: ${resultMessage}`,
    metadata: action
  });

  // Create notification
  await createNotification({
    owner: userId,
    projectId,
    type: 'recovery_suggestion',
    title: 'Recovery Action Applied',
    message: resultMessage
  });

  return {
    success: true,
    message: resultMessage
  };
};

module.exports = {
  generateRecoveryPlan,
  applyRecoveryAction
};
