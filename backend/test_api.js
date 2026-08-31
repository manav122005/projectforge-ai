const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const http = require('http');

let server;
let port = 5099;

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

const runTests = async () => {
  console.log('\n===========================================');
  console.log('  RUNNING PHASE 1 AUTOMATED VERIFICATION');
  console.log('===========================================\n');

  try {
    await connectDB();
    server = app.listen(port);
    console.log(`[Test Server] Listening on http://127.0.0.1:${port}`);

    // Test 1: Health check
    console.log('\n[1] Testing GET /api/health ...');
    const healthRes = await request('/api/health');
    console.log('Status:', healthRes.status);
    console.log('Response:', JSON.stringify(healthRes.body, null, 2));
    if (healthRes.status !== 200 || !healthRes.body.success) throw new Error('Health check failed');

    // Test 2: User Registration
    console.log('\n[2] Testing POST /api/auth/register ...');
    const testUser = {
      name: 'Phase1 Lead Architect',
      email: `lead.arch.${Date.now()}@projectforge.ai`,
      password: 'SecurePassword123!',
    };
    const regRes = await request('/api/auth/register', 'POST', testUser);
    console.log('Status:', regRes.status);
    console.log('Response:', JSON.stringify(regRes.body, null, 2));
    if (regRes.status !== 201 || !regRes.body.success || !regRes.body.data.token) {
      throw new Error('Registration failed');
    }
    const token = regRes.body.data.token;

    // Test 3: Duplicate Registration
    console.log('\n[3] Testing duplicate POST /api/auth/register ...');
    const dupRes = await request('/api/auth/register', 'POST', testUser);
    console.log('Status:', dupRes.status);
    console.log('Response:', JSON.stringify(dupRes.body, null, 2));
    if (dupRes.status !== 400 || dupRes.body.error.code !== 'DUPLICATE_EMAIL') {
      throw new Error('Duplicate email protection failed');
    }

    // Test 4: Valid Login
    console.log('\n[4] Testing POST /api/auth/login ...');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password,
    });
    console.log('Status:', loginRes.status);
    console.log('Response:', JSON.stringify(loginRes.body, null, 2));
    if (loginRes.status !== 200 || !loginRes.body.success || !loginRes.body.data.token) {
      throw new Error('Login failed');
    }

    // Test 5: Invalid Login
    console.log('\n[5] Testing invalid POST /api/auth/login ...');
    const invalidLoginRes = await request('/api/auth/login', 'POST', {
      email: testUser.email,
      password: 'WrongPassword123!',
    });
    console.log('Status:', invalidLoginRes.status);
    console.log('Response:', JSON.stringify(invalidLoginRes.body, null, 2));
    if (invalidLoginRes.status !== 401 || invalidLoginRes.body.error.code !== 'INVALID_CREDENTIALS') {
      throw new Error('Invalid login check failed');
    }

    // Test 6: Auth Me
    console.log('\n[6] Testing GET /api/auth/me with Bearer token ...');
    const meRes = await request('/api/auth/me', 'GET', null, token);
    console.log('Status:', meRes.status);
    console.log('Response:', JSON.stringify(meRes.body, null, 2));
    if (meRes.status !== 200 || !meRes.body.success || meRes.body.data.user.email !== testUser.email) {
      throw new Error('/api/auth/me failed');
    }

    // Test 7: Unauthenticated Auth Me
    console.log('\n[7] Testing GET /api/auth/me without token ...');
    const unauthRes = await request('/api/auth/me', 'GET');
    console.log('Status:', unauthRes.status);
    console.log('Response:', JSON.stringify(unauthRes.body, null, 2));
    if (unauthRes.status !== 401 || unauthRes.body.error.code !== 'NO_TOKEN') {
      throw new Error('Unauthenticated protection failed');
    }

    // Test 8: Logout
    console.log('\n[8] Testing POST /api/auth/logout with token ...');
    const logoutRes = await request('/api/auth/logout', 'POST', null, token);
    console.log('Status:', logoutRes.status);
    console.log('Response:', JSON.stringify(logoutRes.body, null, 2));
    if (logoutRes.status !== 200 || !logoutRes.body.success) {
      throw new Error('Logout failed');
    }

    console.log('\n===========================================');
    console.log('  ALL PHASE 1 BACKEND TESTS PASSED 100%!  ');
    console.log('===========================================\n');
  } catch (err) {
    console.error('\n❌ TEST ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit();
  }
};

runTests();
