/**
 * Deterministic Project Health Score Engine (SPEC.md Section 14)
 * Computes authoritative numeric health scores (0-100) using mathematical metrics.
 * 
 * Formula:
 * - Technical Feasibility (25%)
 * - Timeline Feasibility (20%)
 * - Skill Readiness (20%)
 * - Scope Complexity (20%)
 * - Team Capacity (15%)
 * - Dynamic Risk & Progress Penalties
 */

const clamp = (val, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(val)));

const getInterpretation = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Healthy';
  if (score >= 60) return 'Needs Attention';
  if (score >= 40) return 'High Risk';
  return 'Critical';
};

/**
 * Compute dynamic, authoritative project health from live database collections
 * @param {Object} params
 * @param {Object} params.project - Project model document
 * @param {Array} params.tasks - Project tasks array
 * @param {Array} params.milestones - Project milestones array
 * @param {Array} params.members - Project members array
 * @param {Array} params.risks - Project risks array
 */
const computeLiveProjectHealth = ({ project, tasks = [], milestones = [], members = [], risks = [] }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

  // 1. Technical Feasibility Subscore (25% weight)
  // Evaluates difficulty, architecture graph, tech stack clarity
  let technicalScore = 75; // Neutral baseline for new/unassessed projects
  if (project?.healthBreakdown?.technical && project.healthBreakdown.technical !== 100) {
    technicalScore = project.healthBreakdown.technical;
  }
  if (project?.technologyStack?.length > 0) {
    technicalScore = Math.max(technicalScore, 80);
  }
  if (project?.architecture?.nodes?.length > 0) {
    technicalScore = Math.min(100, technicalScore + 5);
  }
  const technical = clamp(technicalScore);

  // 2. Timeline Feasibility Subscore (20% weight)
  // Evaluates milestones, task completion progress, overdue items
  let timelineScore = 70; // Baseline for unplanned/early-stage projects
  const now = new Date();
  let overdueMilestonesCount = 0;

  milestones.forEach((m) => {
    if (m.dueDate && new Date(m.dueDate) < now && m.status !== 'completed') {
      overdueMilestonesCount += 1;
    }
  });

  if (totalTasks === 0 && milestones.length === 0) {
    timelineScore = 70; // Planning phase, neutral baseline
  } else if (totalTasks > 0) {
    // Progress component: 60 base + up to 35 based on completion rate
    const progressContribution = taskProgress * 35;
    const inProgressContribution = (inProgressTasks / totalTasks) * 10;
    timelineScore = 60 + progressContribution + inProgressContribution;

    // Penalty for overdue milestones
    timelineScore -= (overdueMilestonesCount * 15);
  } else {
    timelineScore = 68;
  }
  const timeline = clamp(timelineScore);

  // 3. Skill Readiness Subscore (20% weight)
  // Normalized comparison of project.requiredSkills against all team members' skills
  const requiredSkills = project?.requiredSkills || [];
  const allTeamSkills = [];
  members.forEach((m) => {
    (m.skills || []).forEach((sk) => {
      if (sk && typeof sk === 'string') allTeamSkills.push(sk.trim().toLowerCase());
    });
  });

  let skillsScore = 70; // Baseline when skills not yet specified
  if (requiredSkills.length === 0) {
    skillsScore = members.length > 0 && allTeamSkills.length > 0 ? 75 : 65;
  } else {
    const coveredCount = requiredSkills.filter((req) =>
      allTeamSkills.includes(req.trim().toLowerCase())
    ).length;
    const coveragePercentage = (coveredCount / requiredSkills.length) * 100;

    if (coveragePercentage === 0) {
      skillsScore = 30; // Critical skill deficit
    } else {
      skillsScore = clamp(coveragePercentage);
    }
  }
  const skills = clamp(skillsScore);

  // 4. Scope Complexity & Execution (20% weight)
  // Evaluates task completion, backlog sizing, and blocked work
  let scopeScore = 72; // Neutral baseline for early scope
  if (totalTasks > 0) {
    scopeScore = 65 + (taskProgress * 30);
    // Blocked tasks indicate scope friction/dependency bottlenecks
    scopeScore -= (blockedTasks * 8);
  } else if (project?.recommendedMVP?.length > 0) {
    scopeScore = 75;
  }
  const scope = clamp(scopeScore);

  // 5. Team Capacity Subscore (15% weight)
  // Evaluates member count, individual capacity utilization, overloaded members
  let teamScore = 70;
  if (members.length === 0) {
    teamScore = 45; // Unstaffed project
  } else {
    let overloadedMembersCount = 0;
    let totalAvailabilityHours = 0;
    let totalAssignedHours = 0;

    members.forEach((m) => {
      const avail = m.availabilityHours || 40;
      const work = m.workload || 0;
      totalAvailabilityHours += avail;
      totalAssignedHours += work;
      if (work > avail) {
        overloadedMembersCount += 1;
      }
    });

    if (totalAssignedHours === 0) {
      teamScore = 75; // Idle team capacity
    } else {
      const utilizationRatio = totalAvailabilityHours > 0 ? (totalAssignedHours / totalAvailabilityHours) : 1;
      if (utilizationRatio > 1.2) {
        teamScore = Math.max(30, 90 - (utilizationRatio - 1) * 60);
      } else if (utilizationRatio > 1.0) {
        teamScore = 70;
      } else {
        teamScore = 88; // Balanced workload
      }
    }

    teamScore -= (overloadedMembersCount * 12);
  }
  const team = clamp(teamScore);

  // 6. Risk Deductions
  const openRisks = risks.filter((r) => r.status === 'open' || r.status === 'in_progress');
  let riskPenalty = 0;
  openRisks.forEach((r) => {
    if (r.severity === 'critical') riskPenalty += 10;
    else if (r.severity === 'high') riskPenalty += 5;
    else if (r.severity === 'medium') riskPenalty += 2;
  });

  // Final Weighted Calculation
  const baseWeighted = (
    0.25 * technical +
    0.20 * timeline +
    0.20 * skills +
    0.20 * scope +
    0.15 * team
  );

  const finalScore = clamp(baseWeighted - riskPenalty);

  return {
    score: finalScore,
    breakdown: {
      technical,
      timeline,
      skills,
      scope,
      team
    },
    interpretation: getInterpretation(finalScore)
  };
};

/**
 * Calculate deterministic health score & breakdown for AI Analysis
 */
const calculateProjectHealth = ({
  difficulty = 3,
  majorModulesCount = 4,
  estimatedDurationDays = 30,
  recommendedTeamSize = 3,
  mvpFeaturesCount = 4,
  futureFeaturesCount = 2,
  requiredSkills = [],
  availableSkills = [],
  teamCapacityHours = 120,
  estimatedTaskHours = 100,
  analystSubscores = {}
}) => {
  // 1. Feasibility Subscore (25% weight)
  let baseFeasibility = analystSubscores.feasibilitySubscore !== undefined
    ? analystSubscores.feasibilitySubscore
    : 100 - (difficulty * 8 + majorModulesCount * 4);
  const feasibility = clamp(baseFeasibility);

  // 2. Timeline Subscore (20% weight)
  const targetDailyCapacityHours = Math.max(1, recommendedTeamSize) * 6;
  const totalAvailableCapacityHours = estimatedDurationDays * targetDailyCapacityHours;
  let timelineRatio = totalAvailableCapacityHours > 0 ? (totalAvailableCapacityHours / (estimatedTaskHours || 100)) : 1;
  let timelineScore = clamp(timelineRatio >= 1 ? 80 + (timelineRatio - 1) * 8 : timelineRatio * 80);

  // 3. Skill Readiness Subscore (20% weight)
  let skillReadinessScore = 70;
  if (requiredSkills.length > 0) {
    if (availableSkills.length === 0) {
      skillReadinessScore = analystSubscores.skillReadinessSubscore || 40;
    } else {
      const covered = requiredSkills.filter((req) =>
        availableSkills.some((avail) => avail.toLowerCase() === req.toLowerCase())
      ).length;
      skillReadinessScore = clamp((covered / requiredSkills.length) * 100);
    }
  }
  const skillReadiness = clamp(skillReadinessScore);

  // 4. Scope Subscore (20% weight)
  const totalFeatures = mvpFeaturesCount + futureFeaturesCount;
  let scopeRatio = totalFeatures > 0 ? (mvpFeaturesCount / totalFeatures) : 0.7;
  let scopeScore = clamp(75 + (1 - scopeRatio) * 15);

  // 5. Team Capacity Subscore (15% weight)
  let teamCapacityRatio = teamCapacityHours > 0 ? (teamCapacityHours / (estimatedTaskHours || 100)) : 1;
  let teamCapacityScore = clamp(teamCapacityRatio >= 1 ? 85 : teamCapacityRatio * 85);

  // Final Weighted Calculation
  const overallScore = clamp(
    0.25 * feasibility +
    0.20 * timelineScore +
    0.20 * skillReadiness +
    0.20 * scopeScore +
    0.15 * teamCapacityScore
  );

  return {
    score: overallScore,
    breakdown: {
      technical: feasibility,
      timeline: timelineScore,
      skills: skillReadiness,
      scope: scopeScore,
      team: teamCapacityScore,
      // Alias keys for backwards compatibility in test suites
      feasibility,
      skillReadiness,
      teamCapacity: teamCapacityScore
    },
    interpretation: getInterpretation(overallScore)
  };
};

module.exports = {
  calculateProjectHealth,
  computeLiveProjectHealth,
  getInterpretation
};
