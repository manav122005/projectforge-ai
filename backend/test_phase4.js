const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const Task = require('./src/models/taskModel');
const Milestone = require('./src/models/milestoneModel');
const ProjectMember = require('./src/models/projectMemberModel');
const http = require('http');

let server;
let port = 5096;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runPhase4Tests = async () => {
  console.log('\n===========================================');
  console.log('  RUNNING PHASE 4 EXECUTION WORKSPACE TESTS');
  console.log('===========================================\n');

  try {
    await connectDB();
    server = app.listen(port);
    console.log(`[Test Server] Listening on http://127.0.0.1:${port}`);

    // Setup Users
    const u1 = await request('/api/auth/register', 'POST', {
      name: 'Phase4 Lead',
      email: `p4lead.${Date.now()}@projectforge.ai`,
      password: 'Password123!'
    });
    const token1 = u1.body.data.token;
    const userId1 = u1.body.data.user.id;

    const u2 = await request('/api/auth/register', 'POST', {
      name: 'P4 Other',
      email: `p4other.${Date.now()}@projectforge.ai`,
      password: 'Password123!'
    });
    const token2 = u2.body.data.token;

    // Create Project 1 for User 1 & Project 2 for User 2
    const p1Res = await request('/api/projects', 'POST', {
      name: 'Phase 4 Execution System',
      description: 'System for Kanban, Milestones, and Skill Gap.',
      originalIdea: 'Build Kanban execution platform'
    }, token1);
    const projectId1 = p1Res.body.data.project._id;

    const p2Res = await request('/api/projects', 'POST', {
      name: 'Other User Project',
      description: 'Project belonging to User 2',
      originalIdea: 'Unauth testing'
    }, token2);
    const projectId2 = p2Res.body.data.project._id;

    // Get Owner Member ID for Project 1
    const membersRes1 = await request(`/api/projects/${projectId1}/members`, 'GET', null, token1);
    const ownerMemberId1 = membersRes1.body.data.members[0]._id;

    // ----------------------------------------------------
    // 1. Milestone CRUD & Validations
    // ----------------------------------------------------
    console.log('\n[1] Testing Milestone Creation & Date Validation ...');
    const invalidDateRes = await request(`/api/projects/${projectId1}/milestones`, 'POST', {
      name: 'Invalid Dates Milestone',
      startDate: '2026-09-10',
      dueDate: '2026-09-01'
    }, token1);
    console.log('Invalid Date Status:', invalidDateRes.status);
    if (invalidDateRes.status !== 400 || invalidDateRes.body.error.code !== 'INVALID_DATES') {
      throw new Error('Milestone invalid date validation failed');
    }

    const m1Res = await request(`/api/projects/${projectId1}/milestones`, 'POST', {
      name: 'Milestone 1: Auth & Core',
      startDate: '2026-09-01',
      dueDate: '2026-09-10'
    }, token1);
    console.log('Create Milestone Status:', m1Res.status);
    if (m1Res.status !== 201 || !m1Res.body.data.milestone._id) {
      throw new Error('Milestone creation failed');
    }
    const milestoneId1 = m1Res.body.data.milestone._id;

    // ----------------------------------------------------
    // 2. Task CRUD & Validations
    // ----------------------------------------------------
    console.log('\n[2] Testing Task Creation & Input Validations ...');
    const invalidHoursRes = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Invalid Hours Task',
      estimatedHours: -5
    }, token1);
    console.log('Invalid Hours Status:', invalidHoursRes.status);
    if (invalidHoursRes.status !== 400) {
      throw new Error('Task invalid hours validation failed');
    }

    // Cross-project milestone reference rejection
    const crossMilestoneRes = await request(`/api/projects/${projectId2}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Cross Milestone Task',
      estimatedHours: 4
    }, token2);
    console.log('Cross-project Milestone Status:', crossMilestoneRes.status);
    if (crossMilestoneRes.status !== 400 || crossMilestoneRes.body.error.code !== 'INVALID_MILESTONE') {
      throw new Error('Cross-project milestone reference rejection failed');
    }

    // Create Valid Task 1
    const t1Res = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Task 1: Setup Mongoose Schemas',
      estimatedHours: 6,
      requiredSkills: ['Node.js', 'MongoDB'],
      assignedMember: ownerMemberId1,
      status: 'todo',
      priority: 'high'
    }, token1);
    console.log('Task 1 Create Status:', t1Res.status);
    if (t1Res.status !== 201 || !t1Res.body.data.task._id) {
      throw new Error('Task 1 creation failed');
    }
    const taskId1 = t1Res.body.data.task._id;

    // Create Task 2
    const t2Res = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Task 2: Build Kanban Board UI',
      estimatedHours: 8,
      requiredSkills: ['React', 'Tailwind CSS'],
      assignedMember: ownerMemberId1,
      status: 'todo',
      priority: 'medium'
    }, token1);
    const taskId2 = t2Res.body.data.task._id;

    // ----------------------------------------------------
    // 3. Milestone Deletion Safety (Must reject if has tasks)
    // ----------------------------------------------------
    console.log('\n[3] Testing Milestone Deletion Safety (Should reject when containing tasks) ...');
    const safeDelRes = await request(`/api/milestones/${milestoneId1}`, 'DELETE', null, token1);
    console.log('Deletion Safety Status:', safeDelRes.status);
    console.log('Response:', JSON.stringify(safeDelRes.body, null, 2));
    if (safeDelRes.status !== 400 || safeDelRes.body.error.code !== 'MILESTONE_HAS_TASKS') {
      throw new Error('Milestone deletion safety check failed to block milestone with tasks');
    }

    // ----------------------------------------------------
    // 4. Task Dependencies & Cycle Detection
    // ----------------------------------------------------
    console.log('\n[4] Testing Task Dependencies & Cycle Detection ...');
    // Task 2 depends on Task 1
    const depRes = await request(`/api/tasks/${taskId2}`, 'PUT', {
      dependencies: [taskId1]
    }, token1);
    console.log('Add Dependency Status:', depRes.status);
    if (depRes.status !== 200) throw new Error('Adding dependency failed');

    // Self dependency check
    const selfDepRes = await request(`/api/tasks/${taskId1}`, 'PUT', {
      dependencies: [taskId1]
    }, token1);
    console.log('Self Dependency Status:', selfDepRes.status);
    if (selfDepRes.status !== 400 || selfDepRes.body.error.code !== 'SELF_DEPENDENCY') {
      throw new Error('Self dependency check failed');
    }

    // Circular dependency check: Task 1 depends on Task 2 (while Task 2 depends on Task 1)
    const cycleRes = await request(`/api/tasks/${taskId1}`, 'PUT', {
      dependencies: [taskId2]
    }, token1);
    console.log('Dependency Cycle Status:', cycleRes.status);
    console.log('Cycle Error:', cycleRes.body.error);
    if (cycleRes.status !== 400 || cycleRes.body.error.code !== 'DEPENDENCY_CYCLE_DETECTED') {
      throw new Error('Dependency cycle detection failed');
    }

    // ----------------------------------------------------
    // 5. Kanban Status Updates & completedAt Timestamp
    // ----------------------------------------------------
    console.log('\n[5] Testing Kanban Status Updates & completedAt Timestamp ...');
    const updateKanbanRes = await request(`/api/tasks/${taskId1}`, 'PUT', {
      status: 'completed'
    }, token1);
    console.log('Status Update to Completed:', updateKanbanRes.status);
    console.log('completedAt Timestamp:', updateKanbanRes.body.data.task.completedAt);
    if (updateKanbanRes.status !== 200 || !updateKanbanRes.body.data.task.completedAt) {
      throw new Error('Task completion timestamp generation failed');
    }

    // Check Milestone Progress Calculation
    const mProgressRes = await request(`/api/projects/${projectId1}/milestones`, 'GET', null, token1);
    console.log('Milestone Progress %:', mProgressRes.body.data.milestones[0].completionPercentage);
    if (mProgressRes.body.data.milestones[0].completionPercentage !== 50) {
      throw new Error('Dynamic milestone progress calculation failed');
    }

    // ----------------------------------------------------
    // 6. Team Member CRUD & Workload Calculation
    // ----------------------------------------------------
    console.log('\n[6] Testing Team Member Management & Deterministic Workload ...');
    const addMemberRes = await request(`/api/projects/${projectId1}/members`, 'POST', {
      displayName: 'Sarah Frontend Lead',
      role: 'Frontend Engineer',
      skills: ['React', 'Tailwind CSS', 'TypeScript'],
      experienceLevel: 'advanced',
      availabilityHours: 20
    }, token1);
    console.log('Add Member Status:', addMemberRes.status);
    console.log('Add Member Body:', JSON.stringify(addMemberRes.body, null, 2));
    const newMemberId = addMemberRes.body.data.member._id;

    // Assign Task 2 (8 hours) to Sarah
    const assignRes = await request(`/api/tasks/${taskId2}`, 'PUT', {
      assignedMember: newMemberId
    }, token1);
    console.log('Assign Task Status:', assignRes.status);

    // Fetch Team Members to verify workload capacity calculation (8 / 20 = 40%)
    const teamRes = await request(`/api/projects/${projectId1}/members`, 'GET', null, token1);
    const sarahMember = teamRes.body.data.members.find((m) => m._id === newMemberId);
    console.log('Sarah Calculated Workload:', sarahMember.workload, 'hours');
    console.log('Sarah Capacity Utilization:', sarahMember.capacityUtilization, '%');
    if (sarahMember.workload !== 8 || sarahMember.capacityUtilization !== 40) {
      throw new Error('Deterministic workload capacity calculation failed');
    }

    // ----------------------------------------------------
    // 7. Team Member Removal Task Safety (Tasks must stay, assignedMember=null)
    // ----------------------------------------------------
    console.log('\n[7] Testing Team Member Removal Task Safety ...');
    const removeMemberRes = await request(`/api/projects/${projectId1}/members/${newMemberId}`, 'DELETE', null, token1);
    console.log('Remove Member Status:', removeMemberRes.status);

    // Verify Task 2 is unassigned, NOT deleted!
    const verifyTask2Res = await request(`/api/projects/${projectId1}/tasks`, 'GET', null, token1);
    const task2Obj = verifyTask2Res.body.data.tasks.find((t) => t._id === taskId2);
    console.log('Task 2 still exists:', !!task2Obj);
    console.log('Task 2 assignedMember:', task2Obj.assignedMember);
    if (!task2Obj || task2Obj.assignedMember !== null) {
      throw new Error('Task was not safely unassigned upon team member removal');
    }

    // ----------------------------------------------------
    // 8. Deterministic Skill Gap Analysis (with Normalized Skill Matching)
    // ----------------------------------------------------
    console.log('\n[8] Testing Deterministic Skill Gap Analysis (Normalized Skill Matching) ...');
    // Update project requiredSkills to ['React', 'node.js', ' Docker ']
    await request(`/api/projects/${projectId1}`, 'PUT', {
      requiredSkills: ['React', 'node.js', ' Docker ']
    }, token1);

    // Update owner member skills to ['react', ' Node.JS ']
    await request(`/api/projects/${projectId1}/members/${ownerMemberId1}`, 'PUT', {
      skills: ['react', ' Node.JS ']
    }, token1);

    const skillGapRes = await request(`/api/projects/${projectId1}/skill-gap`, 'GET', null, token1);
    console.log('Skill Gap Result:', JSON.stringify(skillGapRes.body.data.skillGap, null, 2));
    const sg = skillGapRes.body.data.skillGap;
    if (sg.coveragePercentage !== 67 || !sg.missingSkills.includes('Docker')) {
      throw new Error('Normalized deterministic skill gap analysis failed');
    }

    // ----------------------------------------------------
    // 9. Authorization Protection Check
    // ----------------------------------------------------
    console.log('\n[9] Testing Authorization Protection on Tasks & Milestones ...');
    const unauthTaskRes = await request(`/api/projects/${projectId1}/tasks`, 'GET', null, token2);
    console.log('Unauth Task Status:', unauthTaskRes.status);
    if (unauthTaskRes.status !== 403) {
      throw new Error('Unauthorized task access check failed');
    }

    const unauthMilestoneRes = await request(`/api/projects/${projectId1}/milestones`, 'GET', null, token2);
    console.log('Unauth Milestone Status:', unauthMilestoneRes.status);
    if (unauthMilestoneRes.status !== 403) {
      throw new Error('Unauthorized milestone access check failed');
    }

    const unauthTeamRes = await request(`/api/projects/${projectId1}/members`, 'GET', null, token2);
    console.log('Unauth Team Status:', unauthTeamRes.status);
    if (unauthTeamRes.status !== 403) {
      throw new Error('Unauthorized team access check failed');
    }

    // ----------------------------------------------------
    // 10. Cross-Project Member Assignment Rejection
    // ----------------------------------------------------
    console.log('\n[10] Testing Cross-Project Member Assignment Rejection ...');
    // Create a milestone and member in Project 2
    const m2Res = await request(`/api/projects/${projectId2}/milestones`, 'POST', {
      name: 'Project 2 Milestone',
      startDate: '2026-09-01',
      dueDate: '2026-09-15'
    }, token2);
    const milestoneId2 = m2Res.body.data.milestone._id;

    // Get Project 2's owner member
    const members2Res = await request(`/api/projects/${projectId2}/members`, 'GET', null, token2);
    const ownerMemberId2 = members2Res.body.data.members[0]._id;

    // Try to create a task in Project 1 assigned to Project 2's member => should fail
    const crossAssignRes = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Cross-project assignment task',
      estimatedHours: 4,
      assignedMember: ownerMemberId2
    }, token1);
    console.log('Cross-project Assignment Status:', crossAssignRes.status);
    if (crossAssignRes.status !== 400 || crossAssignRes.body.error.code !== 'INVALID_ASSIGNMENT') {
      throw new Error('Cross-project member assignment was not rejected');
    }
    console.log('PASS: Cross-project assignment correctly rejected');

    // ----------------------------------------------------
    // 11. completedAt Timestamp Reset on Status Change
    // ----------------------------------------------------
    console.log('\n[11] Testing completedAt Reset When Moving Out of Completed ...');
    // Task 1 was completed in test [5]. Now move it back to in_progress.
    const resetRes = await request(`/api/tasks/${taskId1}`, 'PUT', {
      status: 'in_progress'
    }, token1);
    console.log('Status Revert to in_progress:', resetRes.status);
    console.log('completedAt after revert:', resetRes.body.data.task.completedAt);
    if (resetRes.status !== 200 || resetRes.body.data.task.completedAt !== null) {
      throw new Error('completedAt was not cleared when task moved out of completed status');
    }
    console.log('PASS: completedAt correctly cleared on status revert');

    // Re-complete task to verify completedAt is set again
    const reCompleteRes = await request(`/api/tasks/${taskId1}`, 'PUT', {
      status: 'completed'
    }, token1);
    if (reCompleteRes.status !== 200 || !reCompleteRes.body.data.task.completedAt) {
      throw new Error('completedAt was not re-set on second completion');
    }
    console.log('PASS: completedAt correctly re-set on second completion');

    // ----------------------------------------------------
    // 12. Deterministic Workload Math Verification
    // ----------------------------------------------------
    console.log('\n[12] Testing Deterministic Workload/Capacity Math ...');
    // Add a new member with specific availability
    const mathMemberRes = await request(`/api/projects/${projectId1}/members`, 'POST', {
      displayName: 'Math Test Member',
      role: 'QA Engineer',
      skills: ['Testing', 'Python'],
      experienceLevel: 'intermediate',
      availabilityHours: 25
    }, token1);
    const mathMemberId = mathMemberRes.body.data.member._id;

    // Create a task assigned to this member (10 hours)
    const mathTask1Res = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Workload Math Task 1',
      estimatedHours: 10,
      assignedMember: mathMemberId,
      status: 'todo'
    }, token1);
    const mathTaskId1 = mathTask1Res.body.data.task._id;

    // Create another task (15 hours) => total = 25 hours
    const mathTask2Res = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Workload Math Task 2',
      estimatedHours: 15,
      assignedMember: mathMemberId,
      status: 'in_progress'
    }, token1);

    // Verify: workload = 10 + 15 = 25, capacityUtilization = (25/25)*100 = 100%, status = near_capacity
    const wlTeamRes = await request(`/api/projects/${projectId1}/members`, 'GET', null, token1);
    const mathMember = wlTeamRes.body.data.members.find((m) => m._id === mathMemberId);
    console.log('Math Member Workload:', mathMember.workload, '(expected 25)');
    console.log('Math Member Utilization:', mathMember.capacityUtilization, '% (expected 100)');
    console.log('Math Member Status:', mathMember.capacityStatus, '(expected near_capacity)');
    if (mathMember.workload !== 25) {
      throw new Error(`Workload math failed: expected 25, got ${mathMember.workload}`);
    }
    if (mathMember.capacityUtilization !== 100) {
      throw new Error(`Capacity utilization math failed: expected 100%, got ${mathMember.capacityUtilization}%`);
    }
    if (mathMember.capacityStatus !== 'near_capacity') {
      throw new Error(`Capacity status failed: expected near_capacity, got ${mathMember.capacityStatus}`);
    }

    // Add one more task (1 hour) => total = 26, utilization = 104% => over_capacity
    await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId: milestoneId1,
      title: 'Workload Math Task 3',
      estimatedHours: 1,
      assignedMember: mathMemberId,
      status: 'backlog'
    }, token1);
    const wlTeamRes2 = await request(`/api/projects/${projectId1}/members`, 'GET', null, token1);
    const mathMember2 = wlTeamRes2.body.data.members.find((m) => m._id === mathMemberId);
    console.log('Over-capacity Workload:', mathMember2.workload, '(expected 26)');
    console.log('Over-capacity Utilization:', mathMember2.capacityUtilization, '% (expected 104)');
    console.log('Over-capacity Status:', mathMember2.capacityStatus, '(expected over_capacity)');
    if (mathMember2.workload !== 26 || mathMember2.capacityUtilization !== 104 || mathMember2.capacityStatus !== 'over_capacity') {
      throw new Error('Over-capacity workload math verification failed');
    }
    console.log('PASS: All workload/capacity math equations verified');

    // Verify project workload summary
    const summary = wlTeamRes2.body.data.summary;
    console.log('Project Summary - Assigned:', summary.totalAssignedHours, ', Available:', summary.totalAvailableHours);
    if (typeof summary.totalAssignedHours !== 'number' || typeof summary.totalAvailableHours !== 'number' || typeof summary.totalUtilization !== 'number') {
      throw new Error('Project workload summary missing required fields');
    }
    console.log('PASS: Project workload summary verified');

    // ----------------------------------------------------
    // 13. Team Member Update CRUD
    // ----------------------------------------------------
    console.log('\n[13] Testing Team Member Update CRUD ...');
    const updateMemberRes = await request(`/api/projects/${projectId1}/members/${mathMemberId}`, 'PUT', {
      displayName: 'Updated Math Member',
      role: 'Senior QA',
      skills: ['Testing', 'Python', 'Selenium'],
      experienceLevel: 'advanced',
      availabilityHours: 30
    }, token1);
    console.log('Update Member Status:', updateMemberRes.status);
    if (updateMemberRes.status !== 200) {
      throw new Error('Team member update failed');
    }
    const updatedMember = updateMemberRes.body.data.member;
    if (updatedMember.displayName !== 'Updated Math Member' ||
        updatedMember.role !== 'Senior QA' ||
        updatedMember.experienceLevel !== 'advanced' ||
        updatedMember.availabilityHours !== 30) {
      throw new Error('Team member update did not persist all fields correctly');
    }
    // Verify recalculated capacity: 26 hours / 30 availability = 87% => near_capacity
    console.log('Updated Utilization:', updatedMember.capacityUtilization, '% (expected 87)');
    if (updatedMember.capacityUtilization !== 87 || updatedMember.capacityStatus !== 'near_capacity') {
      throw new Error('Workload recalculation after member update failed');
    }
    console.log('PASS: Team member update + recalculated workload verified');

    // ----------------------------------------------------
    // 14. Skill-Gap Deterministic Math Deep Verification
    // ----------------------------------------------------
    console.log('\n[14] Testing Skill-Gap Math Deep Verification ...');
    // Set project required skills to known set
    await request(`/api/projects/${projectId1}`, 'PUT', {
      requiredSkills: ['React', 'Node.js', 'Docker', 'Python', 'MongoDB']
    }, token1);

    // Owner member has: react, Node.JS (from test 8)
    // Math member has: Testing, Python, Selenium (from test 13 update)
    // So team covers: React (via owner), Node.js (via owner), Python (via mathMember)
    // Missing: Docker, MongoDB
    // Coverage: 3/5 = 60%
    const sgRes = await request(`/api/projects/${projectId1}/skill-gap`, 'GET', null, token1);
    const sgData = sgRes.body.data.skillGap;
    console.log('Skill Gap Deep Result:', JSON.stringify(sgData, null, 2));
    console.log('Coverage:', sgData.coveragePercentage, '% (expected 60)');
    if (sgData.coveragePercentage !== 60) {
      throw new Error(`Skill-gap coverage math failed: expected 60, got ${sgData.coveragePercentage}`);
    }
    if (sgData.totalRequiredSkills !== 5) {
      throw new Error(`Total required skills wrong: expected 5, got ${sgData.totalRequiredSkills}`);
    }
    if (!sgData.missingSkills.includes('Docker') || !sgData.missingSkills.includes('MongoDB')) {
      throw new Error('Missing skills list incorrect');
    }
    console.log('PASS: Skill-gap deterministic math verified (coverage, missing, available)');

    // ============================================
    console.log('\n===========================================');
    console.log('  ALL PHASE 4 BACKEND TESTS PASSED 100%!  ');
    console.log('  Tests: 14/14 PASSED');
    console.log('===========================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 4 TEST ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit();
  }
};

runPhase4Tests();
