const ProjectMember = require('../models/projectMemberModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');
const User = require('../models/userModel');
const { verifyProjectAccess } = require('./projectService');
const { calculateMemberWorkload, calculateProjectWorkloadSummary } = require('./workloadEngineService');

/**
 * Normalize skill string for deterministic matching (trim whitespace & lowercase)
 */
const normalizeSkill = (skillStr = '') => skillStr.trim().toLowerCase();

const getMembers = async (projectId, userId) => {
  await verifyProjectAccess(projectId, userId);

  const members = await ProjectMember.find({ projectId }).populate('userId', 'name email role');

  const membersWithWorkload = await Promise.all(
    members.map(async (m) => {
      const obj = m.toObject();
      const wl = await calculateMemberWorkload(m._id, m.availabilityHours);
      obj.workload = wl.workload; // Calculated incomplete assigned task hours
      obj.capacityUtilization = wl.capacityUtilization;
      obj.capacityStatus = wl.capacityStatus;
      return obj;
    })
  );

  const summary = await calculateProjectWorkloadSummary(projectId, members);

  return {
    members: membersWithWorkload,
    summary
  };
};

const addMember = async (projectId, userId, { userEmail, displayName, role, skills, experienceLevel, availabilityHours }) => {
  await verifyProjectAccess(projectId, userId);

  let targetUserId = null;

  if (userEmail && userEmail.trim()) {
    const cleanEmail = userEmail.trim().toLowerCase();
    let targetUser = await User.findOne({ email: cleanEmail });
    if (!targetUser) {
      targetUser = await User.create({
        name: displayName || 'Team Member',
        email: cleanEmail,
        password: 'Password123!',
        role: 'operator'
      });
    }
    targetUserId = targetUser._id;
  } else {
    const syntheticEmail = `member.${Date.now()}.${Math.random().toString(36).substring(7)}@projectforge.ai`;
    const syntheticUser = await User.create({
      name: displayName || 'Team Member',
      email: syntheticEmail,
      password: 'Password123!',
      role: 'operator'
    });
    targetUserId = syntheticUser._id;
  }

  const existingMember = await ProjectMember.findOne({ projectId, userId: targetUserId });
  if (existingMember) {
    const error = new Error('User is already a member of this project');
    error.statusCode = 400;
    error.code = 'MEMBER_EXISTS';
    throw error;
  }

  const member = await ProjectMember.create({
    projectId,
    userId: targetUserId,
    displayName: displayName || 'Team Member',
    role: role || 'Developer',
    skills: skills || [],
    experienceLevel: experienceLevel || 'intermediate',
    availabilityHours: availabilityHours !== undefined ? availabilityHours : 40,
    workload: 0
  });

  const obj = member.toObject();
  obj.workload = 0;
  obj.capacityUtilization = 0;
  obj.capacityStatus = 'under_capacity';

  return { member: obj };
};

const updateMember = async (memberId, userId, updateData) => {
  const member = await ProjectMember.findById(memberId);
  if (!member) {
    const error = new Error('Project member not found');
    error.statusCode = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }

  await verifyProjectAccess(member.projectId, userId);

  const allowed = ['displayName', 'role', 'skills', 'experienceLevel', 'availabilityHours'];
  allowed.forEach((f) => {
    if (updateData[f] !== undefined) member[f] = updateData[f];
  });

  await member.save();

  const obj = member.toObject();
  const wl = await calculateMemberWorkload(member._id, member.availabilityHours);
  obj.workload = wl.workload;
  obj.capacityUtilization = wl.capacityUtilization;
  obj.capacityStatus = wl.capacityStatus;

  return { member: obj };
};

const removeMember = async (memberId, userId) => {
  const member = await ProjectMember.findById(memberId);
  if (!member) {
    const error = new Error('Project member not found');
    error.statusCode = 404;
    error.code = 'MEMBER_NOT_FOUND';
    throw error;
  }

  await verifyProjectAccess(member.projectId, userId);

  // Safety Check: Safely unassign member's assigned tasks (do NOT delete tasks)
  await Task.updateMany(
    { assignedMember: memberId },
    { assignedMember: null }
  );

  await ProjectMember.findByIdAndDelete(memberId);
  return { id: memberId };
};

/**
 * Compute Deterministic Skill Gap Analysis for Project
 */
const getSkillGapAnalysis = async (projectId, userId) => {
  const { project } = await verifyProjectAccess(projectId, userId);
  const members = await ProjectMember.find({ projectId });

  const projectRequiredSkills = project.requiredSkills || [];

  // Map normalized skills to display names
  const teamSkillsMap = new Map(); // normalized -> display
  const memberSkillDetails = new Map(); // normalized -> Array of member objects

  members.forEach((m) => {
    (m.skills || []).forEach((sk) => {
      const norm = normalizeSkill(sk);
      if (norm) {
        if (!teamSkillsMap.has(norm)) {
          teamSkillsMap.set(norm, sk.trim());
          memberSkillDetails.set(norm, []);
        }
        memberSkillDetails.get(norm).push(m);
      }
    });
  });

  const availableSkillsSet = new Set();
  const missingSkillsSet = new Set();
  const partiallyCoveredSkillsSet = new Set();

  projectRequiredSkills.forEach((reqSkill) => {
    const normReq = normalizeSkill(reqSkill);
    if (!normReq) return;

    if (teamSkillsMap.has(normReq)) {
      availableSkillsSet.add(reqSkill.trim());

      // Check if partially covered (e.g. only 1 beginner member has it)
      const memberList = memberSkillDetails.get(normReq) || [];
      if (memberList.length === 1 && memberList[0].experienceLevel === 'beginner') {
        partiallyCoveredSkillsSet.add(reqSkill.trim());
      }
    } else {
      missingSkillsSet.add(reqSkill.trim());
    }
  });

  const totalRequired = projectRequiredSkills.length;
  const coveredCount = availableSkillsSet.size;
  const coveragePercentage = totalRequired > 0
    ? Math.max(0, Math.min(100, Math.round((coveredCount / totalRequired) * 100)))
    : 100;

  // Identify critical missing skills from high/critical priority tasks
  const criticalTasks = await Task.find({
    projectId,
    priority: { $in: ['high', 'critical'] }
  }).select('requiredSkills');

  const criticalSkillsSet = new Set();
  criticalTasks.forEach((t) => {
    (t.requiredSkills || []).forEach((sk) => {
      const norm = normalizeSkill(sk);
      if (missingSkillsSet.has(sk.trim())) {
        criticalSkillsSet.add(sk.trim());
      }
    });
  });

  return {
    skillGap: {
      totalRequiredSkills: totalRequired,
      coveragePercentage,
      availableSkills: Array.from(availableSkillsSet),
      missingSkills: Array.from(missingSkillsSet),
      partiallyCoveredSkills: Array.from(partiallyCoveredSkillsSet),
      criticalMissingSkills: Array.from(criticalSkillsSet)
    }
  };
};

module.exports = {
  getMembers,
  addMember,
  updateMember,
  removeMember,
  getSkillGapAnalysis
};
