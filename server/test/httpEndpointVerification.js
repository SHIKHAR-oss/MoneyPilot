import http from 'http';
import assert from 'assert';
import app from '../src/app.js';
import { generateToken } from '../src/utils/jwt.js';

let totalTests = 0;
let passedTests = 0;

function logTest(name, passed, err = null) {
  totalTests++;
  if (passed) {
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    if (err) console.error(`    Error: ${err.message}`);
  }
}

const server = http.createServer(app);

server.listen(5099, async () => {
  const BASE = 'http://127.0.0.1:5099';
  const testToken = generateToken('507f1f77bcf86cd799439011');

  console.log('================================================================');
  console.log(' MoneyPilot Phase 6: HTTP Endpoints & Security Route Tests     ');
  console.log('================================================================\n');

  try {
    // 1. Health Check
    {
      const res = await fetch(`${BASE}/api/health`);
      const data = await res.json();
      logTest('GET /api/health: Returns 200 with service status', res.status === 200 && data.status === 'healthy');
    }

    // 2. Protected Route without Token (Overview)
    {
      const res = await fetch(`${BASE}/api/financial/overview`);
      const data = await res.json();
      logTest('GET /api/financial/overview without token: Returns 401 AUTH_TOKEN_MISSING', res.status === 401 && data.code === 'AUTH_TOKEN_MISSING');
    }

    // 3. Protected Route with Invalid Token
    {
      const res = await fetch(`${BASE}/api/transactions`, {
        headers: { Authorization: 'Bearer invalid.tampered.token' }
      });
      const data = await res.json();
      logTest('GET /api/transactions with invalid token: Returns 401 AUTH_TOKEN_INVALID', res.status === 401 && data.code === 'AUTH_TOKEN_INVALID');
    }

    // 4. Protected Route without Bearer prefix
    {
      const res = await fetch(`${BASE}/api/profile`, {
        headers: { Authorization: 'Basic dXNlcjpwYXNz' }
      });
      const data = await res.json();
      logTest('GET /api/profile with non-Bearer auth: Returns 401 AUTH_TOKEN_MISSING', res.status === 401 && data.code === 'AUTH_TOKEN_MISSING');
    }

    // 5. Malformed JSON Body Parsing Error Handling
    {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"invalidJson": '
      });
      const data = await res.json();
      logTest('POST with malformed JSON body: Returns 400 Invalid JSON payload', res.status === 400 && data.message.includes('Invalid JSON payload'));
    }

    // 6. DB Unavailable Graceful Degradation / ID Validation
    {
      const res = await fetch(`${BASE}/api/transactions/invalid-mongo-id`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: 100 })
      });
      const data = await res.json();
      const isExpected = res.status === 503 ? data.code === 'DB_UNAVAILABLE' : (res.status === 400 && data.message.includes('Invalid transaction ID format'));
      logTest('PUT /api/transactions/invalid-id: Handled safely (503 DB_UNAVAILABLE or 400 Invalid ID)', isExpected);
    }

    // 7. Goals DB Protection / ID Validation
    {
      const res = await fetch(`${BASE}/api/goals/not-a-valid-id`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetAmount: 5000 })
      });
      const data = await res.json();
      const isExpected = res.status === 503 ? data.code === 'DB_UNAVAILABLE' : (res.status === 400 && data.message.includes('Invalid goal ID format'));
      logTest('PUT /api/goals/invalid-id: Handled safely (503 DB_UNAVAILABLE or 400 Invalid ID)', isExpected);
    }

    // 8. Investments DB Protection / ID Validation
    {
      const res = await fetch(`${BASE}/api/investments/123456`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testToken}`
        }
      });
      const data = await res.json();
      const isExpected = res.status === 503 ? data.code === 'DB_UNAVAILABLE' : (res.status === 400 && data.message.includes('Invalid investment ID format'));
      logTest('DELETE /api/investments/invalid-id: Handled safely (503 DB_UNAVAILABLE or 400 Invalid ID)', isExpected);
    }

    // 9. Unknown Route Handler (404)
    {
      const res = await fetch(`${BASE}/api/unknown-endpoint-xyz`);
      const data = await res.json();
      logTest('GET /api/unknown-route: Returns 404 with structured JSON error', res.status === 404 && data.status === 'error');
    }

    // 10. Root Health Redirect
    {
      const res = await fetch(`${BASE}/health`, { redirect: 'manual' });
      logTest('GET /health: Redirects to /api/health', res.status === 302 || res.status === 301);
    }
  } catch (err) {
    console.error('HTTP Test Execution Error:', err);
  } finally {
    console.log('\n================================================================');
    console.log(` Test Results: ${passedTests} / ${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log('================================================================');
    server.close();
    if (passedTests !== totalTests) {
      process.exit(1);
    }
  }
});
