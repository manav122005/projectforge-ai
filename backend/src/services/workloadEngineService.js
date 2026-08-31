const Task = require('../models/taskModel');

/**
 * Calculate member workload and capacity utilization from incomplete assigned tasks
 */
const calculateMemberWorkload = async (memberId, availabilityHours = 40) => {
  // Find all incomplete tasks assigned to this member
  const assignedTasks = await Task.find({
    assignedMember: memberId,
    status: { $ne: 'completed' }
  }).select('estimatedHours');

  const workload = assignedTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  const avail = Math.max(0, availabilityHours || 0);
  const capacityUtilization = avail > 0
    ? Math.round((workload / avail) * 100)
    : 0;

  let capacityStatus = 'under_capacity';
  if (capacityUtilization > 100) {
    capacityStatus = 'over_capacity';
  } else if (capacityUtilization >= 80) {
    capacityStatus = 'near_capacity';
  }

  return {
    workload,
    capacityUtilization,
    capacityStatus
  };
};

/**
 * Calculate total project capacity utilization
 */
const calculateProjectWorkloadSummary = async (projectId, members = []) => {
  const memberIds = members.map((m) => m._id);

  const tasks = await Task.find({
    projectId,
    status: { $ne: 'completed' }
  }).select('estimatedHours assignedMember');

  const totalAssignedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const totalAvailableHours = members.reduce((sum, m) => sum + (m.availabilityHours || 0), 0);

  const totalUtilization = totalAvailableHours > 0
    ? Math.round((totalAssignedHours / totalAvailableHours) * 100)
    : 0;

  return {
    totalAssignedHours,
    totalAvailableHours,
    totalUtilization
  };
};

module.exports = {
  calculateMemberWorkload,
  calculateProjectWorkloadSummary
};
