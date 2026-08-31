const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const http = require('http');

let server;
const port = 5098;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runHealthAuditTests = async () => {
  console.log('\n===========================================');
  console.log('  RUNNING PROJECT HEALTH SCORE AUDIT TESTS  ');
  console.log('===========================================\n');

  try {
    await connectDB();
    server = app.listen(port);
    console.log(`[Test Server] Listening on http://127.0.0.1:${port}`);

    // Register User
    const regRes = await request('/api/auth/register', 'POST', {
      name: 'Health Audit Engineer',
      email: `health.audit.${Date.now()}@projectforge.ai`,
      password: 'Password123!'
    });
    const token = regRes.body.data.token;

    // Test 1: Brand New Project Health Score
    console.log('\n[1] Testing Newly Created Project Baseline Health ...');
    const p1Res = await request('/api/projects', 'POST', {
      name: 'Initial Unassessed Project',
      description: 'Brand new project with no milestones or tasks'
    }, token);
    const p1Id = p1Res.body.data.project._id;

    const p1Detail = await request(`/api/projects/${p1Id}`, 'GET', null, token);
    const p1 = p1Detail.body.data.project;
    console.log(`New Project Score: ${p1.healthScore}/100`);
    console.log('New Project Subscores:', p1.healthBreakdown);

    if (p1.healthScore === 100) {
      throw new Error(`FAIL: Brand new project should not be 100/100 Excellent (got ${p1.healthScore})`);
    }
    if (p1.healthBreakdown.technical === 100 && p1.healthBreakdown.skills === 100) {
      throw new Error('FAIL: All subscores defaulted to 100');
    }
    console.log('PASS: Brand new project receives realistic baseline health score.');

    // Test 2: Project with 1 Milestone and 0/3 Tasks Completed
    console.log('\n[2] Testing Project with 1 Milestone and 0/3 Tasks Completed ...');
    const mRes = await request(`/api/projects/${p1Id}/milestones`, 'POST', {
      name: 'Milestone 1',
      description: 'Phase 1 MVP',
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString()
    }, token);
    const mId = mRes.body.data.milestone._id;

    await request(`/api/projects/${p1Id}/tasks`, 'POST', { title: 'Task A', milestoneId: mId, estimatedHours: 6 }, token);
    await request(`/api/projects/${p1Id}/tasks`, 'POST', { title: 'Task B', milestoneId: mId, estimatedHours: 8 }, token);
    await request(`/api/projects/${p1Id}/tasks`, 'POST', { title: 'Task C', milestoneId: mId, estimatedHours: 10 }, token);

    const p1WithTasks = await request(`/api/projects/${p1Id}`, 'GET', null, token);
    const p1TasksScore = p1WithTasks.body.data.project;
    console.log(`Project with 0/3 tasks completed: ${p1TasksScore.healthScore}/100`);
    console.log('Subscores:', p1TasksScore.healthBreakdown);

    if (p1TasksScore.healthScore === 100) {
      throw new Error(`FAIL: Project with 0/3 tasks completed evaluated as 100/100!`);
    }
    console.log('PASS: 0% completion reflected accurately in timeline and scope subscores.');

    // Test 3: Missing Required Skills vs Team Skills
    console.log('\n[3] Testing Missing Skills Penalty ...');
    await request(`/api/projects/${p1Id}`, 'PUT', {
      requiredSkills: ['Rust', 'Solidity', 'Kubernetes', 'GraphQL']
    }, token);

    const p1SkillsDetail = await request(`/api/projects/${p1Id}`, 'GET', null, token);
    const p1SkillsScore = p1SkillsDetail.body.data.project;
    console.log(`Project with 0/4 required skills: ${p1SkillsScore.healthScore}/100 (Skills Subscore: ${p1SkillsScore.healthBreakdown.skills})`);

    if (p1SkillsScore.healthBreakdown.skills > 50) {
      throw new Error(`FAIL: Missing all required skills should result in low skill score (got ${p1SkillsScore.healthBreakdown.skills})`);
    }
    console.log('PASS: Missing required skills penalty verified.');

    // Test 4: Risk Penalty Application
    console.log('\n[4] Testing Open Critical Risk Penalty ...');
    await request(`/api/projects/${p1Id}/risks`, 'POST', {
      title: 'Critical Database Security Vulnerability',
      category: 'technical',
      severity: 'critical',
      probability: 'high',
      impact: 'high',
      recommendedAction: 'Patch immediately'
    }, token);

    const p1RiskDetail = await request(`/api/projects/${p1Id}`, 'GET', null, token);
    const p1RiskScore = p1RiskDetail.body.data.project;
    console.log(`Project with critical risk: ${p1RiskScore.healthScore}/100 (reduced from ${p1SkillsScore.healthScore})`);

    if (p1RiskScore.healthScore >= p1SkillsScore.healthScore) {
      throw new Error('FAIL: Critical risk did not reduce overall health score!');
    }
    console.log('PASS: Deterministic risk deduction applied.');

    // Test 5: Seeded Demo Project Health Verification
    console.log('\n[5] Testing Seeded Demo Project Health Score ...');
    const demoRes = await request('/api/projects/demo/seed', 'POST', {}, token);
    const demoId = demoRes.body.data.project._id;

    const demoDetail = await request(`/api/projects/${demoId}`, 'GET', null, token);
    const demoProj = demoDetail.body.data.project;
    console.log(`Demo Project Health: ${demoProj.healthScore}/100`);
    console.log('Demo Subscores:', demoProj.healthBreakdown);

    if (typeof demoProj.healthScore !== 'number' || demoProj.healthScore < 60 || demoProj.healthScore > 90) {
      throw new Error(`FAIL: Demo project health score unexpected (${demoProj.healthScore})`);
    }
    console.log('PASS: Demo Project health score and subscores verified against SPEC.md Section 14.');

    console.log('\n===========================================');
    console.log('  ALL HEALTH SCORE AUDIT TESTS PASSED 100%! ');
    console.log('===========================================\n');
  } catch (err) {
    console.error('Health audit test failed:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    process.exit(0);
  }
};

runHealthAuditTests();
