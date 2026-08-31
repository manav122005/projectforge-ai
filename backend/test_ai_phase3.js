const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const { calculateProjectHealth } = require('./src/services/healthEngineService');
const { validateArchitectureSemantics, validatePlanningSemantics } = require('./src/services/ai/aiValidator');
const { requestStructuredAi } = require('./src/services/ai/aiProviderService');
const AIAnalysis = require('./src/models/aiAnalysisModel');
const { z } = require('zod');
const http = require('http');

let server;
let port = 5097;

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

const runPhase3Tests = async () => {
  console.log('\n===========================================');
  console.log('  RUNNING PHASE 3 AI INTELLIGENCE VERIFICATION');
  console.log('===========================================\n');

  try {
    await connectDB();
    server = app.listen(port);
    console.log(`[Test Server] Listening on http://127.0.0.1:${port}`);

    // Register User 1 & User 2
    const u1 = await request('/api/auth/register', 'POST', {
      name: 'AI Lead',
      email: `ai.lead.${Date.now()}@projectforge.ai`,
      password: 'Password123!'
    });
    const token1 = u1.body.data.token;

    const u2 = await request('/api/auth/register', 'POST', {
      name: 'Unauth User',
      email: `unauth.${Date.now()}@projectforge.ai`,
      password: 'Password123!'
    });
    const token2 = u2.body.data.token;

    // Test 1: Health Engine Formula & Clamping Test
    console.log('\n[1] Testing Deterministic Health Score Engine Formula & Clamping ...');
    const healthResult = calculateProjectHealth({
      difficulty: 3,
      majorModulesCount: 4,
      estimatedDurationDays: 30,
      recommendedTeamSize: 3,
      mvpFeaturesCount: 4,
      futureFeaturesCount: 2,
      requiredSkills: ['React', 'Node.js'],
      availableSkills: ['React'],
      analystSubscores: { feasibilitySubscore: 80, skillReadinessSubscore: 50 }
    });
    console.log('Calculated Score:', healthResult.score);
    console.log('Breakdown:', healthResult.breakdown);
    console.log('Interpretation:', healthResult.interpretation);
    if (typeof healthResult.score !== 'number' || healthResult.score < 0 || healthResult.score > 100) {
      throw new Error('Health engine calculation failed or score not clamped');
    }

    // Test 2: Semantic Validation Rules (Architecture Edge Source/Target Check)
    console.log('\n[2] Testing Architecture Semantic Validation Rule (Edge Source Check) ...');
    let archErr = null;
    try {
      validateArchitectureSemantics({
        nodes: [{ id: 'n1', type: 'frontend', data: { label: 'FE' }, position: { x: 0, y: 0 } }],
        edges: [{ id: 'e1', source: 'n1', target: 'non-existent-node' }]
      });
    } catch (e) {
      archErr = e.message;
    }
    console.log('Caught Expected Error:', archErr);
    if (!archErr || !archErr.includes('does not reference any existing node')) {
      throw new Error('Architecture semantic validation failed to catch invalid target node');
    }

    // Test 3: Semantic Validation Rules (Planning MilestoneIndex Check)
    console.log('\n[3] Testing Planning Semantic Validation Rule (Milestone Index Check) ...');
    let planErr = null;
    try {
      validatePlanningSemantics({
        milestones: [{ name: 'M1' }],
        tasks: [{ title: 'T1', estimatedHours: 5, milestoneIndex: 99 }]
      });
    } catch (e) {
      planErr = e.message;
    }
    console.log('Caught Expected Error:', planErr);
    if (!planErr || !planErr.includes('invalid milestoneIndex')) {
      throw new Error('Planning semantic validation failed to catch out-of-bounds milestoneIndex');
    }

    // Test 4: Provider Fallback Cascade when Keys Missing (Deterministic Fallback)
    console.log('\n[4] Testing Provider Fallback Cascade with Missing Keys ...');
    const fallbackRes = await requestStructuredAi({
      systemPrompt: 'System',
      userPrompt: 'Test Prompt',
      validatorSchema: z.object({ value: z.string() }),
      deterministicFallbackFn: () => ({ value: 'fallback_ok' })
    });
    console.log('Provider Succeeded:', fallbackRes.provider);
    console.log('Output:', fallbackRes.data);
    if (fallbackRes.provider !== 'deterministic' || fallbackRes.data.value !== 'fallback_ok') {
      throw new Error('Deterministic fallback cascade failed');
    }

    // Test 5: POST /api/projects/analyze (Preview endpoint)
    console.log('\n[5] Testing POST /api/projects/analyze (Preview Endpoint) ...');
    const previewRes = await request('/api/projects/analyze', 'POST', {
      idea: 'Build an AI placement prediction system for college students.'
    });
    console.log('Status:', previewRes.status);
    console.log('Provider Used:', previewRes.body.data.provider);
    console.log('Health Score:', previewRes.body.data.health.score);
    if (previewRes.status !== 200 || !previewRes.body.success || !previewRes.body.data.analysis.projectName) {
      throw new Error('POST /api/projects/analyze preview failed');
    }

    // Create Project for User 1
    const p1 = await request('/api/projects', 'POST', {
      name: 'AI Placement System',
      description: 'College placement predictor.',
      originalIdea: 'Build an AI placement prediction system for college students.'
    }, token1);
    const projectId = p1.body.data.project._id;

    // Test 6: POST /api/projects/:id/analyze (Existing Project Analysis & Persistence)
    console.log('\n[6] Testing POST /api/projects/:id/analyze ...');
    const analyzeRes = await request(`/api/projects/${projectId}/analyze`, 'POST', null, token1);
    console.log('Status:', analyzeRes.status);
    console.log('Updated Health Score:', analyzeRes.body.data.project.healthScore);
    if (analyzeRes.status !== 200 || !analyzeRes.body.data.project.healthScore) {
      throw new Error('Project analysis failed');
    }

    // Test 7: Verify Persistence in AIAnalysis Collection
    console.log('\n[7] Verifying MongoDB AIAnalyses Record Persistence ...');
    const dbRecord = await AIAnalysis.findOne({ projectId });
    console.log('Analysis DB Record Found:', dbRecord ? dbRecord.analysisType : 'NONE');
    if (!dbRecord || dbRecord.analysisType !== 'full_blueprint') {
      throw new Error('AIAnalysis document was not persisted to MongoDB');
    }

    // Test 8: Authorization Check on Project Analysis Endpoint (User 2 should get 403)
    console.log('\n[8] Testing Authorization Check for User 2 on Project Analysis ...');
    const unauthRes = await request(`/api/projects/${projectId}/analyze`, 'POST', null, token2);
    console.log('Status:', unauthRes.status);
    if (unauthRes.status !== 403) {
      throw new Error('Unauthorized project analysis attempt was not blocked');
    }

    // Test 9: POST /api/projects/:id/generate-architecture
    console.log('\n[9] Testing POST /api/projects/:id/generate-architecture ...');
    const archRes = await request(`/api/projects/${projectId}/generate-architecture`, 'POST', null, token1);
    console.log('Status:', archRes.status);
    console.log('Nodes count:', archRes.body.data.architecture.nodes.length);
    if (archRes.status !== 200 || archRes.body.data.architecture.nodes.length === 0) {
      throw new Error('Architecture generation failed');
    }

    // Test 10: POST /api/projects/:id/generate-plan
    console.log('\n[10] Testing POST /api/projects/:id/generate-plan ...');
    const planRes = await request(`/api/projects/${projectId}/generate-plan`, 'POST', null, token1);
    console.log('Status:', planRes.status);
    console.log('Milestones count:', planRes.body.data.plan.milestones.length);
    if (planRes.status !== 200 || planRes.body.data.plan.milestones.length === 0) {
      throw new Error('Plan generation failed');
    }

    // Test 11: Non-exposure of API keys check
    console.log('\n[11] Verifying non-exposure of API secrets in responses ...');
    const responseStr = JSON.stringify(planRes.body);
    if (responseStr.includes('OPENROUTER_API_KEY') || responseStr.includes('GEMINI_API_KEY')) {
      throw new Error('API key detected in API response payload');
    }

    console.log('\n===========================================');
    console.log('  ALL PHASE 3 BACKEND TESTS PASSED 100%!  ');
    console.log('===========================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 3 TEST ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit();
  }
};

runPhase3Tests();
