const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const http = require('http');

let server;
let port = 5098;

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

const runProjectTests = async () => {
  console.log('\n===========================================');
  console.log('  RUNNING PHASE 2 PROJECT CRUD VERIFICATION');
  console.log('===========================================\n');

  try {
    await connectDB();
    server = app.listen(port);
    console.log(`[Test Server] Listening on http://127.0.0.1:${port}`);

    // Register User 1
    const user1Data = {
      name: 'Owner User',
      email: `owner.${Date.now()}@projectforge.ai`,
      password: 'Password123!',
    };
    const reg1Res = await request('/api/auth/register', 'POST', user1Data);
    const token1 = reg1Res.body.data.token;

    // Register User 2
    const user2Data = {
      name: 'Other User',
      email: `other.${Date.now()}@projectforge.ai`,
      password: 'Password123!',
    };
    const reg2Res = await request('/api/auth/register', 'POST', user2Data);
    const token2 = reg2Res.body.data.token;

    // Test 1: Create Project by User 1
    console.log('\n[1] Testing POST /api/projects (Create Project) ...');
    const newProject = {
      name: 'AI Placement Predictor',
      description: 'System to predict placement probability using student profiles.',
      originalIdea: 'Build an AI platform for predicting student placements.'
    };
    const createRes = await request('/api/projects', 'POST', newProject, token1);
    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(createRes.body, null, 2));
    if (createRes.status !== 201 || !createRes.body.success || !createRes.body.data.project._id) {
      throw new Error('Project creation failed');
    }
    const projectId = createRes.body.data.project._id;

    // Test 2: List User 1 Projects
    console.log('\n[2] Testing GET /api/projects for User 1 ...');
    const list1Res = await request('/api/projects', 'GET', null, token1);
    console.log('Status:', list1Res.status);
    console.log('Projects count:', list1Res.body.data.projects.length);
    if (list1Res.status !== 200 || list1Res.body.data.projects.length !== 1) {
      throw new Error('User 1 project listing failed');
    }

    // Test 3: List User 2 Projects (Authorization Isolation)
    console.log('\n[3] Testing GET /api/projects for User 2 (Should be 0) ...');
    const list2Res = await request('/api/projects', 'GET', null, token2);
    console.log('Status:', list2Res.status);
    console.log('Projects count for User 2:', list2Res.body.data.projects.length);
    if (list2Res.status !== 200 || list2Res.body.data.projects.length !== 0) {
      throw new Error('User project isolation failed');
    }

    // Test 4: User 2 Unauthorized Access to Project 1
    console.log('\n[4] Testing GET /api/projects/:id by unauthorized User 2 (Should 403) ...');
    const unauthAccessRes = await request(`/api/projects/${projectId}`, 'GET', null, token2);
    console.log('Status:', unauthAccessRes.status);
    console.log('Response:', JSON.stringify(unauthAccessRes.body, null, 2));
    if (unauthAccessRes.status !== 403 || unauthAccessRes.body.error.code !== 'FORBIDDEN_PROJECT_ACCESS') {
      throw new Error('Unauthorized project access protection failed');
    }

    // Test 5: Search and Filter Projects
    console.log('\n[5] Testing search filter GET /api/projects?search=Placement ...');
    const searchRes = await request('/api/projects?search=Placement', 'GET', null, token1);
    console.log('Status:', searchRes.status);
    console.log('Search matches:', searchRes.body.data.projects.length);
    if (searchRes.status !== 200 || searchRes.body.data.projects.length !== 1) {
      throw new Error('Project search failed');
    }

    // Test 6: Update Project
    console.log('\n[6] Testing PUT /api/projects/:id (Update) ...');
    const updateRes = await request(`/api/projects/${projectId}`, 'PUT', { status: 'active' }, token1);
    console.log('Status:', updateRes.status);
    console.log('Updated status:', updateRes.body.data.project.status);
    if (updateRes.status !== 200 || updateRes.body.data.project.status !== 'active') {
      throw new Error('Project update failed');
    }

    // Test 7: Duplicate Project
    console.log('\n[7] Testing POST /api/projects/:id/duplicate ...');
    const dupRes = await request(`/api/projects/${projectId}/duplicate`, 'POST', null, token1);
    console.log('Status:', dupRes.status);
    console.log('Duplicated name:', dupRes.body.data.project.name);
    if (dupRes.status !== 201 || !dupRes.body.data.project.name.includes('(Copy)')) {
      throw new Error('Project duplication failed');
    }
    const dupProjectId = dupRes.body.data.project._id;

    // Test 8: Archive Project
    console.log('\n[8] Testing POST /api/projects/:id/archive ...');
    const archiveRes = await request(`/api/projects/${projectId}/archive`, 'POST', null, token1);
    console.log('Status:', archiveRes.status);
    console.log('Archived status:', archiveRes.body.data.project.status);
    if (archiveRes.status !== 200 || archiveRes.body.data.project.status !== 'archived') {
      throw new Error('Project archive failed');
    }

    // Test 9: Delete Duplicated Project
    console.log('\n[9] Testing DELETE /api/projects/:id ...');
    const delRes = await request(`/api/projects/${dupProjectId}`, 'DELETE', null, token1);
    console.log('Status:', delRes.status);
    if (delRes.status !== 200 || !delRes.body.success) {
      throw new Error('Project deletion failed');
    }

    console.log('\n===========================================');
    console.log('  ALL PHASE 2 BACKEND TESTS PASSED 100%!  ');
    console.log('===========================================\n');
  } catch (err) {
    console.error('\n❌ PHASE 2 TEST ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit();
  }
};

runProjectTests();
