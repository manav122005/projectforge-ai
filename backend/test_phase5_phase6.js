const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const http = require('http');

let server;
const port = 5097;

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

const runPhase5And6Tests = async () => {
  console.log('\n======================================================');
  console.log('  RUNNING PHASE 5 & PHASE 6 COMPREHENSIVE TEST SUITE  ');
  console.log('======================================================\n');

  try {
    await connectDB();
    server = app.listen(port);
    console.log(`[Test Server] Listening on http://127.0.0.1:${port}`);

    // Setup Users
    const u1 = await request('/api/auth/register', 'POST', {
      name: 'Phase 5 Lead',
      email: `p5lead.${Date.now()}@projectforge.ai`,
      password: 'Password123!'
    });
    const token1 = u1.body.data.token;
    const userId1 = u1.body.data.user.id;

    // Create Test Project
    const p1Res = await request('/api/projects', 'POST', {
      name: 'Risk & Copilot Intelligence System',
      description: 'Autonomous risk mitigation and context-aware copilot test workspace.',
      originalIdea: 'Build full intelligence engine'
    }, token1);
    const projectId1 = p1Res.body.data.project._id;

    // Create Milestone
    const mRes = await request(`/api/projects/${projectId1}/milestones`, 'POST', {
      name: 'Core Risk Milestone',
      startDate: '2026-09-01',
      dueDate: '2026-09-10'
    }, token1);
    const milestoneId = mRes.body.data.milestone._id;

    // Create Team Member
    const memRes = await request(`/api/projects/${projectId1}/members`, 'POST', {
      displayName: 'Alex Backend',
      role: 'Backend Dev',
      skills: ['Node.js'],
      experienceLevel: 'intermediate',
      availabilityHours: 20
    }, token1);
    const memberId = memRes.body.data.member._id;

    // Create Tasks — 1 blocked task, 1 high workload task (25h on 20h member -> overload)
    const t1Res = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId,
      assignedMember: memberId,
      title: 'Heavy Processing Pipeline',
      estimatedHours: 25,
      priority: 'high',
      status: 'in_progress'
    }, token1);
    const taskId1 = t1Res.body.data.task._id;

    const t2Res = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId,
      title: 'Blocked External API Integration',
      estimatedHours: 8,
      priority: 'critical',
      status: 'blocked'
    }, token1);
    const taskId2 = t2Res.body.data.task._id;

    const t3Res = await request(`/api/projects/${projectId1}/tasks`, 'POST', {
      milestoneId,
      title: 'Blocked Secondary Service',
      estimatedHours: 4,
      priority: 'medium',
      status: 'blocked'
    }, token1);
    const taskId3 = t3Res.body.data.task._id;

    // ----------------------------------------------------
    // 1. Deterministic Risk Detection
    // ----------------------------------------------------
    console.log('\n[1] Testing Deterministic Risk Detection Engine ...');
    const detectRes = await request(`/api/projects/${projectId1}/risks/detect`, 'POST', null, token1);
    console.log('Detect Status:', detectRes.status);
    console.log('Detected Count:', detectRes.body.data.detectedCount);
    const openRisks = detectRes.body.data.risks;
    console.log('Risks found:', openRisks.map((r) => `${r.title} (${r.category}, ${r.severity})`));

    if (detectRes.status !== 200 || openRisks.length === 0) {
      throw new Error('Risk detection failed to identify project risks');
    }

    const hasWorkloadRisk = openRisks.some((r) => r.category === 'workload');
    const hasDependencyRisk = openRisks.some((r) => r.category === 'dependency');
    console.log('Has Workload Overload Risk:', hasWorkloadRisk);
    console.log('Has Blocked Dependency Risk:', hasDependencyRisk);

    if (!hasWorkloadRisk || !hasDependencyRisk) {
      throw new Error('Deterministic rules failed to flag workload overload or blocked dependencies');
    }
    console.log('PASS: Deterministic risk detection passed');

    // ----------------------------------------------------
    // 2. Risk Listing & Severity Summary
    // ----------------------------------------------------
    console.log('\n[2] Testing Risk Listing & Summary Breakdown ...');
    const listRes = await request(`/api/projects/${projectId1}/risks`, 'GET', null, token1);
    console.log('List Risks Status:', listRes.status);
    const summary = listRes.body.data.summary;
    console.log('Risk Summary Breakdown:', JSON.stringify(summary, null, 2));

    if (listRes.status !== 200 || typeof summary.open !== 'number' || typeof summary.critical !== 'number') {
      throw new Error('Risk listing & summary structure validation failed');
    }
    console.log('PASS: Risk listing & summary breakdown passed');

    // ----------------------------------------------------
    // 3. Manual Risk Creation & Resolution
    // ----------------------------------------------------
    console.log('\n[3] Testing Manual Risk Creation & Resolution ...');
    const createRiskRes = await request(`/api/projects/${projectId1}/risks`, 'POST', {
      title: 'Third-Party SMS Gateway Downtime',
      description: 'Vendor maintenance scheduled during deployment window.',
      category: 'resource',
      severity: 'medium',
      recommendedAction: 'Configure fallback email notification provider.'
    }, token1);
    console.log('Create Manual Risk Status:', createRiskRes.status);
    const manualRiskId = createRiskRes.body.data.risk._id;

    const resolveRes = await request(`/api/projects/${projectId1}/risks/${manualRiskId}/resolve`, 'POST', null, token1);
    console.log('Resolve Risk Status:', resolveRes.status);
    console.log('Resolved Status:', resolveRes.body.data.risk.status);
    console.log('Resolved At:', resolveRes.body.data.risk.resolvedAt);

    if (resolveRes.status !== 200 || resolveRes.body.data.risk.status !== 'resolved' || !resolveRes.body.data.risk.resolvedAt) {
      throw new Error('Risk resolution failed');
    }
    console.log('PASS: Manual risk creation and resolution verified');

    // ----------------------------------------------------
    // 4. AI Recovery Plan Generation
    // ----------------------------------------------------
    console.log('\n[4] Testing AI Recovery Plan Generation ...');
    const recoveryRes = await request(`/api/projects/${projectId1}/recovery-plan`, 'POST', null, token1);
    console.log('Recovery Plan Status:', recoveryRes.status);
    const plan = recoveryRes.body.data.recoveryPlan;
    console.log('Recovery Summary:', plan.summary);
    console.log('Strategies Count:', plan.strategies?.length);
    console.log('Sample Strategy:', plan.strategies?.[0]?.title);

    if (recoveryRes.status !== 200 || !plan.strategies || plan.strategies.length === 0) {
      throw new Error('Recovery plan generation failed');
    }
    console.log('PASS: Recovery recommendations generation passed');

    // ----------------------------------------------------
    // 5. Recovery Plan Approval & Execution Workflow
    // ----------------------------------------------------
    console.log('\n[5] Testing Recovery Plan Approval Workflow Execution ...');
    const unblockAction = {
      actionType: 'unblock',
      title: 'Triage and unblock secondary service',
      payload: {
        targetTaskId: taskId3,
        newStatus: 'todo'
      }
    };
    const applyRes = await request(`/api/projects/${projectId1}/recovery-plan/apply`, 'POST', unblockAction, token1);
    console.log('Apply Recovery Status:', applyRes.status);
    console.log('Apply Message:', applyRes.body.data.message);

    // Verify task status was actually updated to todo
    const verifyTasksRes = await request(`/api/projects/${projectId1}/tasks`, 'GET', null, token1);
    const task3Obj = verifyTasksRes.body.data.tasks.find((t) => t._id === taskId3);
    console.log('Task 3 status after recovery execution:', task3Obj.status);

    if (applyRes.status !== 200 || task3Obj.status !== 'todo') {
      throw new Error('Recovery plan execution failed to update project state');
    }
    console.log('PASS: Human-in-the-loop recovery execution verified');

    // ----------------------------------------------------
    // 6. Notifications System
    // ----------------------------------------------------
    console.log('\n[6] Testing Notifications Retrieval & Read Actions ...');
    const notifsRes = await request('/api/notifications', 'GET', null, token1);
    console.log('Get Notifications Status:', notifsRes.status);
    console.log('Notification Count:', notifsRes.body.data.notifications.length);
    console.log('Unread Count:', notifsRes.body.data.unreadCount);

    if (notifsRes.status !== 200 || notifsRes.body.data.notifications.length === 0) {
      throw new Error('Notifications were not generated during risk/recovery actions');
    }

    const readAllRes = await request('/api/notifications/read-all', 'PUT', null, token1);
    console.log('Mark All As Read Status:', readAllRes.status);
    const notifsAfterRead = await request('/api/notifications', 'GET', null, token1);
    console.log('Unread Count After Read All:', notifsAfterRead.body.data.unreadCount);

    if (notifsAfterRead.body.data.unreadCount !== 0) {
      throw new Error('Mark all as read failed');
    }
    console.log('PASS: Notifications workflow verified');

    // ----------------------------------------------------
    // 7. ProjectEvents Activity Timeline
    // ----------------------------------------------------
    console.log('\n[7] Testing Project Events Activity Timeline ...');
    const eventsRes = await request(`/api/projects/${projectId1}/events`, 'GET', null, token1);
    console.log('Get Events Status:', eventsRes.status);
    console.log('Events Count:', eventsRes.body.data.events.length);
    console.log('Recent Events:', eventsRes.body.data.events.slice(0, 3).map((e) => `[${e.type}] ${e.message}`));

    if (eventsRes.status !== 200 || eventsRes.body.data.events.length === 0) {
      throw new Error('Project events timeline is empty');
    }
    console.log('PASS: ProjectEvents timeline verified');

    // ----------------------------------------------------
    // 8. Grounded AI Copilot
    // ----------------------------------------------------
    console.log('\n[8] Testing Project-Context-Aware AI Copilot ...');
    const copilotQuery1 = await request(`/api/projects/${projectId1}/copilot`, 'POST', {
      message: 'Why is my project health score low?'
    }, token1);
    console.log('Copilot Query 1 Status:', copilotQuery1.status);
    console.log('Copilot Answer Snippet:', copilotQuery1.body.data.answer.slice(0, 150) + '...');
    console.log('Suggested Actions:', copilotQuery1.body.data.suggestedActions);

    if (copilotQuery1.status !== 200 || !copilotQuery1.body.data.answer || !copilotQuery1.body.data.answer.includes('Health')) {
      throw new Error('Copilot health query response failed');
    }

    const copilotQuery2 = await request(`/api/projects/${projectId1}/copilot`, 'POST', {
      message: 'Which team member is overloaded?'
    }, token1);
    console.log('Copilot Query 2 Status:', copilotQuery2.status);
    console.log('Copilot Overload Answer:', copilotQuery2.body.data.answer.slice(0, 150) + '...');

    if (copilotQuery2.status !== 200 || !copilotQuery2.body.data.answer.includes('Alex Backend')) {
      throw new Error('Copilot failed to identify real overloaded team member from context');
    }
    console.log('PASS: Grounded AI Copilot verified with real project context');

    // ----------------------------------------------------
    // 9. Full Demo Project Seeding & Verification
    // ----------------------------------------------------
    console.log('\n[9] Testing Demo Project Seeding & Complete Integrity ...');
    const demoRes = await request('/api/projects/demo/seed', 'POST', null, token1);
    console.log('Seed Demo Status:', demoRes.status);
    console.log('Seed Summary:', JSON.stringify(demoRes.body.data, null, 2));

    const demoProjectId = demoRes.body.data.project._id;
    if (demoRes.status !== 201 || !demoProjectId) {
      throw new Error('Demo project seeding failed');
    }

    // Verify 5 members, 5 milestones, 20+ tasks, risks, health history
    const demoMembersRes = await request(`/api/projects/${demoProjectId}/members`, 'GET', null, token1);
    const demoMilestonesRes = await request(`/api/projects/${demoProjectId}/milestones`, 'GET', null, token1);
    const demoTasksRes = await request(`/api/projects/${demoProjectId}/tasks`, 'GET', null, token1);
    const demoRisksRes = await request(`/api/projects/${demoProjectId}/risks`, 'GET', null, token1);
    const demoProjDetails = await request(`/api/projects/${demoProjectId}`, 'GET', null, token1);

    console.log('Demo Members Count:', demoMembersRes.body.data.members.length, '(expected 5)');
    console.log('Demo Milestones Count:', demoMilestonesRes.body.data.milestones.length, '(expected 5)');
    console.log('Demo Tasks Count:', demoTasksRes.body.data.tasks.length, '(expected >= 20)');
    console.log('Demo Risks Count:', demoRisksRes.body.data.risks.length, '(expected >= 4)');
    console.log('Demo Health History Count:', demoProjDetails.body.data.project.healthHistory?.length, '(expected 4)');

    if (demoMembersRes.body.data.members.length !== 5 ||
        demoMilestonesRes.body.data.milestones.length !== 5 ||
        demoTasksRes.body.data.tasks.length < 20 ||
        demoRisksRes.body.data.risks.length < 4 ||
        demoProjDetails.body.data.project.healthHistory?.length !== 4) {
      throw new Error('Demo project did not satisfy complete data requirements from SPEC.md Section 74');
    }
    console.log('PASS: Complete Demo Project verified with 5 members, 5 milestones, 20+ tasks, risks, and health history');

    console.log('\n======================================================');
    console.log('  ALL PHASE 5 & PHASE 6 BACKEND TESTS PASSED 100%!   ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 5 & 6 TEST ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit();
  }
};

runPhase5And6Tests();
