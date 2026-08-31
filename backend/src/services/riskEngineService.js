const Task = require('../models/taskModel');
const Milestone = require('../models/milestoneModel');
const ProjectMember = require('../models/projectMemberModel');
const { calculateMemberWorkload, calculateProjectWorkloadSummary } = require('./workloadEngineService');

/**
 * Deterministic Risk Detection Engine
 * Strictly follows SPEC.md Section 26 rules.
 */
const detectProjectRisks = async (project) => {
  const projectId = project._id;
  const detectedRisks = [];

  const tasks = await Task.find({ projectId });
  const milestones = await Milestone.find({ projectId });
  const members = await ProjectMember.find({ projectId });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;

  const incompleteTasks = tasks.filter((t) => t.status !== 'completed');
  const totalIncompleteHours = incompleteTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  // ----------------------------------------------------
  // Rule 1: Workload & Capacity Risk (SPEC.md 26: remainingTasks > availableCapacity)
  // ----------------------------------------------------
  const memberWorkloads = await Promise.all(
    members.map((m) => calculateMemberWorkload(m._id, m.availabilityHours))
  );

  const overloadedMembers = members.filter((m, i) => memberWorkloads[i].capacityStatus === 'over_capacity');
  const projectWorkloadSummary = await calculateProjectWorkloadSummary(projectId, members);

  if (overloadedMembers.length > 0) {
    const names = overloadedMembers.map((m) => m.displayName).join(', ');
    detectedRisks.push({
      title: 'Team Member Capacity Overload',
      description: `${overloadedMembers.length} team member(s) (${names}) exceed 100% weekly capacity with assigned tasks.`,
      category: 'workload',
      severity: overloadedMembers.length >= 2 ? 'critical' : 'high',
      probability: 'high',
      impact: 'high',
      recommendedAction: 'Reassign tasks from overloaded members to under-capacity peers or extend milestone timelines.',
      source: 'deterministic_engine'
    });
  } else if (projectWorkloadSummary.totalUtilization > 95 && members.length > 0) {
    detectedRisks.push({
      title: 'High Overall Project Workload',
      description: `Project workload utilization is at ${projectWorkloadSummary.totalUtilization}% of total team capacity (${projectWorkloadSummary.totalAssignedHours}h / ${projectWorkloadSummary.totalAvailableHours}h).`,
      category: 'workload',
      severity: 'medium',
      probability: 'medium',
      impact: 'medium',
      recommendedAction: 'Monitor remaining task velocity and consider adding engineering capacity.',
      source: 'deterministic_engine'
    });
  }

  // ----------------------------------------------------
  // Rule 2: Dependency & Blocked Tasks Risk (SPEC.md 26: many tasks are blocked)
  // ----------------------------------------------------
  if (blockedTasks >= 2 || (totalTasks > 0 && (blockedTasks / totalTasks) >= 0.15)) {
    detectedRisks.push({
      title: 'Blocked Task Bottleneck Detected',
      description: `${blockedTasks} development task(s) are currently marked as blocked, threatening milestone throughput.`,
      category: 'dependency',
      severity: blockedTasks >= 3 ? 'critical' : 'high',
      probability: 'high',
      impact: 'high',
      recommendedAction: 'Investigate blocking dependencies, unblock core architectural items, or pair developers.',
      source: 'deterministic_engine'
    });
  }

  // ----------------------------------------------------
  // Rule 3: Skill Gap Risk (SPEC.md 26: criticalRequiredSkills are missing)
  // ----------------------------------------------------
  const projectRequiredSkills = project.requiredSkills || [];
  const teamSkills = new Set();
  members.forEach((m) => {
    (m.skills || []).forEach((sk) => teamSkills.add(sk.trim().toLowerCase()));
  });

  const missingSkills = projectRequiredSkills.filter(
    (req) => !teamSkills.has(req.trim().toLowerCase())
  );

  // Check if any high/critical priority tasks require missing skills
  const criticalTasksWithMissingSkills = incompleteTasks.filter((t) =>
    ['high', 'critical'].includes(t.priority) &&
    (t.requiredSkills || []).some((sk) => missingSkills.some((ms) => ms.toLowerCase() === sk.toLowerCase()))
  );

  if (missingSkills.length > 0) {
    const isCritical = criticalTasksWithMissingSkills.length > 0;
    detectedRisks.push({
      title: isCritical ? 'Critical Skill Coverage Deficit' : 'Skill Readiness Gap',
      description: `Team lacks required expertise in: ${missingSkills.slice(0, 4).join(', ')}${missingSkills.length > 4 ? ` (+${missingSkills.length - 4} more)` : ''}.${isCritical ? ` Affects ${criticalTasksWithMissingSkills.length} high/critical priority task(s).` : ''}`,
      category: 'skills',
      severity: isCritical ? 'critical' : missingSkills.length >= 3 ? 'high' : 'medium',
      probability: isCritical ? 'high' : 'medium',
      impact: isCritical ? 'critical' : 'high',
      recommendedAction: isCritical
        ? 'Onboard a team member with required skills or adopt managed libraries/APIs to reduce technical complexity.'
        : 'Upskill team members with reference materials or pair programming.',
      source: 'deterministic_engine'
    });
  }

  // ----------------------------------------------------
  // Rule 4: Timeline & Due Date Risk (SPEC.md 26: deadline is near AND completion is low)
  // ----------------------------------------------------
  const now = Date.now();
  milestones.forEach((m) => {
    if (m.dueDate) {
      const dueTime = new Date(m.dueDate).getTime();
      const daysLeft = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
      const mTasks = tasks.filter((t) => t.milestoneId?.toString() === m._id.toString());
      const mCompleted = mTasks.filter((t) => t.status === 'completed').length;
      const mCompletionPct = mTasks.length > 0 ? Math.round((mCompleted / mTasks.length) * 100) : 0;

      if (daysLeft <= 7 && daysLeft >= 0 && mCompletionPct < 50 && mTasks.length > 0) {
        detectedRisks.push({
          title: `Milestone Delivery Risk: "${m.name}"`,
          description: `Milestone is due in ${daysLeft} day(s) but is only ${mCompletionPct}% completed (${mCompleted}/${mTasks.length} tasks).`,
          category: 'timeline',
          severity: daysLeft <= 3 ? 'critical' : 'high',
          probability: 'high',
          impact: 'high',
          recommendedAction: 'Descope non-essential tasks from this milestone or shift team focus entirely to remaining tasks.',
          source: 'deterministic_engine'
        });
      } else if (daysLeft < 0 && mCompletionPct < 100 && mTasks.length > 0) {
        detectedRisks.push({
          title: `Overdue Milestone: "${m.name}"`,
          description: `Milestone deadline passed ${Math.abs(daysLeft)} day(s) ago with ${mTasks.length - mCompleted} remaining task(s).`,
          category: 'timeline',
          severity: 'critical',
          probability: 'high',
          impact: 'critical',
          recommendedAction: 'Re-baseline milestone dueDate and triage remaining backlog tasks.',
          source: 'deterministic_engine'
        });
      }
    }
  });

  // ----------------------------------------------------
  // Rule 5: Scope Risk (Excessive feature expansion)
  // ----------------------------------------------------
  if (totalTasks >= 20 && completedTasks === 0 && inProgressTasks === 0) {
    detectedRisks.push({
      title: 'Stalled Project Kickoff / Scope Overload',
      description: `Project contains ${totalTasks} planned tasks with zero active progress started.`,
      category: 'scope',
      severity: 'medium',
      probability: 'medium',
      impact: 'medium',
      recommendedAction: 'Initialize sprint kickoff by moving highest-priority MVP foundation tasks to In Progress.',
      source: 'deterministic_engine'
    });
  }

  return detectedRisks;
};

module.exports = {
  detectProjectRisks
};
