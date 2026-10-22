/**
 * Phase 2A Integration Tests — CWMS
 * Runs against a REAL MongoDB instance (localhost:27017/cwms_test).
 * Uses a separate database (cwms_test) so production data is never touched.
 * Starts an Express app in-process — no separate server required.
 *
 * Run: node server/tests/phase2a.integration.test.js
 *
 * Prerequisites: MongoDB must be running on localhost:27017.
 * The test database (cwms_test) is created and dropped automatically.
 */
'use strict';

process.env.NODE_ENV = 'test';

const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

// Override DB to isolated test database — NEVER touches cwms (production)
process.env.MONGO_URI = 'mongodb://localhost:27017/cwms_phase2a_test';

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');

// ── App bootstrap (mirrors server.js but without process.exit guard for tests)
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',         require('../routes/authRoutes'));
app.use('/api/projects',     require('../routes/projectRoutes'));
app.use('/api/waste',        require('../routes/wasteRoutes'));
app.use('/api/inventory',    require('../routes/inventoryRoutes'));
app.use('/api/requests',     require('../routes/requestRoutes'));
app.use('/api/pickups',      require('../routes/pickupRoutes'));
app.use('/api/transactions', require('../routes/transactionRoutes'));
app.use('/api/feedback',     require('../routes/feedbackRoutes'));
app.use('/api/dashboard',    require('../routes/dashboardRoutes'));
app.use('/api/reports',      require('../routes/reportRoutes'));

// ── HTTP helper (no external deps — pure node:http)
let server;
let BASE;

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token  ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let json;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });
    r.on('error', reject);
    if (payload) r.write(payload);
    r.end();
  });
}

const get  = (path, token)        => req('GET',    path, null,  token);
const post = (path, body, token)   => req('POST',   path, body,  token);
const put  = (path, body, token)   => req('PUT',    path, body,  token);
const del  = (path, token)         => req('DELETE', path, null,  token);

// ── Test state
let adminToken, customerAToken, customerBToken, siteManagerToken;
let customerAId, customerBId;
let inventoryId, requestAId;

// ── Lifecycle
before(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  // Clean slate — only safe because it's cwms_phase2a_test
  await mongoose.connection.dropDatabase();

  await new Promise(resolve => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      BASE = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup: seed users and inventory
// ─────────────────────────────────────────────────────────────────────────────
describe('Setup — seed test users', () => {
  test('register customerA', async () => {
    const r = await post('/api/auth/register', { name: 'Customer A', email: 'a@test.com', password: 'pass1234', role: 'customer' });
    assert.equal(r.status, 201);
    customerAToken = r.body.token;
    customerAId    = r.body._id;
    assert.ok(customerAToken, 'token must be returned');
  });

  test('register customerB', async () => {
    const r = await post('/api/auth/register', { name: 'Customer B', email: 'b@test.com', password: 'pass1234', role: 'customer' });
    assert.equal(r.status, 201);
    customerBToken = r.body.token;
    customerBId    = r.body._id;
  });

  test('register siteManager', async () => {
    const r = await post('/api/auth/register', { name: 'Site Mgr', email: 'mgr@test.com', password: 'pass1234', role: 'siteManager' });
    assert.equal(r.status, 201);
    siteManagerToken = r.body.token;
  });

  // Admin must be created via /admin/register — but that itself requires an admin.
  // Bootstrap: register admin first via direct DB seed using mongoose User model.
  test('seed admin via DB (no public endpoint for admin role)', async () => {
    const User = require('../models/User');
    const adminUser = new User({ name: 'Admin', email: 'admin@test.com', password: 'adminpass', role: 'admin' });
    await adminUser.save();
    const r = await post('/api/auth/login', { email: 'admin@test.com', password: 'adminpass' });
    assert.equal(r.status, 200);
    adminToken = r.body.token;
    assert.equal(r.body.role, 'admin');
  });

  test('create inventory item (admin)', async () => {
    const r = await post('/api/inventory', {
      materialName: 'Steel Rebar',
      materialType: 'Metal',
      quantity: 100,
      unit: 'kg',
      estimatedValue: 5000,
      status: 'Available',
    }, adminToken);
    assert.equal(r.status, 201);
    inventoryId = r.body._id;
    assert.ok(inventoryId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B10 — Admin self-registration prevention
// ─────────────────────────────────────────────────────────────────────────────
describe('B10 — Admin registration prevention (integration)', () => {
  test('POST /register with role:admin returns role:customer', async () => {
    const r = await post('/api/auth/register', {
      name: 'Evil Admin', email: 'evil@test.com', password: 'pass1234', role: 'admin'
    });
    assert.equal(r.status, 201, 'should succeed but downgrade role');
    assert.equal(r.body.role, 'customer', 'role must be customer, not admin');
  });

  test('POST /admin/register without token returns 401', async () => {
    const r = await post('/api/auth/admin/register', { name: 'X', email: 'x@test.com', password: 'pass' });
    assert.equal(r.status, 401);
  });

  test('POST /admin/register with customer token returns 403', async () => {
    const r = await post('/api/auth/admin/register',
      { name: 'X2', email: 'x2@test.com', password: 'pass', role: 'admin' },
      customerAToken
    );
    assert.equal(r.status, 403);
  });

  test('POST /admin/register with admin token succeeds', async () => {
    const r = await post('/api/auth/admin/register',
      { name: 'Staff', email: 'staff@test.com', password: 'pass1234', role: 'siteManager' },
      adminToken
    );
    assert.equal(r.status, 201);
    assert.equal(r.body.role, 'siteManager');
    // Note: no token returned from admin/register — by design
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B9 — Authorization enforcement
// ─────────────────────────────────────────────────────────────────────────────
describe('B9 — Route authorization (integration)', () => {
  test('POST /inventory as customer returns 403', async () => {
    const r = await post('/api/inventory', { materialName: 'X', materialType: 'Y', quantity: 1, unit: 'kg' }, customerAToken);
    assert.equal(r.status, 403);
  });

  test('DELETE /inventory/:id as siteManager returns 403 (admin-only)', async () => {
    const r = await del(`/api/inventory/${inventoryId}`, siteManagerToken);
    assert.equal(r.status, 403);
  });

  test('GET /reports/financial as customer returns 403', async () => {
    const r = await get('/api/reports/financial', customerAToken);
    assert.equal(r.status, 403);
  });

  test('PUT /requests/:id/status as customer returns 403', async () => {
    // Create a dummy request first
    const reqR = await post('/api/requests', {
      material: 'Steel', quantity: 5, inventory: inventoryId
    }, customerAToken);
    assert.equal(reqR.status, 201);
    requestAId = reqR.body._id;

    const r = await put(`/api/requests/${requestAId}/status`, { status: 'Approved', inventoryId }, customerAToken);
    assert.equal(r.status, 403);
  });

  test('GET /transactions as customer returns 403', async () => {
    const r = await get('/api/transactions', customerAToken);
    assert.equal(r.status, 403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B5 — Customer isolation
// ─────────────────────────────────────────────────────────────────────────────
describe('B5 — Customer isolation (integration)', () => {
  let requestBId;

  test('customerB creates their own request', async () => {
    const r = await post('/api/requests', { material: 'Concrete', quantity: 2 }, customerBToken);
    assert.equal(r.status, 201);
    requestBId = r.body._id;
  });

  test('GET /requests as customerA does NOT return customerB requests', async () => {
    const r = await get('/api/requests', customerAToken);
    assert.equal(r.status, 200);
    const ids = r.body.map(req => req._id);
    assert.equal(ids.includes(requestBId), false, 'customerA must not see customerB requests');
    // customerA should see their own request (requestAId)
    assert.equal(ids.includes(requestAId), true, 'customerA must see their own requests');
  });

  test('GET /requests/:id for customerB request returns 403 for customerA', async () => {
    const r = await get(`/api/requests/${requestBId}`, customerAToken);
    assert.equal(r.status, 403);
  });

  test('GET /requests as admin returns all requests', async () => {
    const r = await get('/api/requests', adminToken);
    assert.equal(r.status, 200);
    const ids = r.body.map(req => req._id);
    // Admin sees both
    assert.equal(ids.includes(requestAId), true);
    assert.equal(ids.includes(requestBId), true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B3 — Idempotency: repeated approval
// ─────────────────────────────────────────────────────────────────────────────
describe('B3 — Repeated approval idempotency (integration)', () => {
  test('first approval succeeds and reserves stock', async () => {
    const r = await put(`/api/requests/${requestAId}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(r.status, 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    assert.equal(r.body.status, 'Approved');
  });

  test('second approval of the same request returns 400 (idempotency)', async () => {
    const r = await put(`/api/requests/${requestAId}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(r.status, 400, 'Re-approval must be rejected');
    assert.match(r.body.message, /already in status|Cannot transition/i);
  });

  test('inventory reservedQuantity incremented only once', async () => {
    const r = await get(`/api/inventory/${inventoryId}`, adminToken);
    assert.equal(r.status, 200);
    // requestAId.quantity = 5; reserved should be exactly 5 (not 10)
    assert.equal(r.body.reservedQuantity, 5, 'reservedQuantity must be 5, not doubled');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B4 — Rejection restores reservedQuantity
// ─────────────────────────────────────────────────────────────────────────────
describe('B4 — Rejection restores reservation (integration)', () => {
  let reqForRejection;

  test('create and approve a new request for rejection test', async () => {
    const create = await post('/api/requests', { material: 'Steel', quantity: 10, inventory: inventoryId }, customerAToken);
    assert.equal(create.status, 201);
    reqForRejection = create.body._id;

    const approve = await put(`/api/requests/${reqForRejection}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(approve.status, 200, `Approve failed: ${JSON.stringify(approve.body)}`);

    // Verify reserved increased
    const inv = await get(`/api/inventory/${inventoryId}`, adminToken);
    // Now: 5 (from requestA) + 10 (new) = 15 reserved
    assert.equal(inv.body.reservedQuantity, 15);
  });

  test('reject the Approved request releases reservedQuantity', async () => {
    const r = await put(`/api/requests/${reqForRejection}/status`, { status: 'Rejected' }, adminToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'Rejected');

    const inv = await get(`/api/inventory/${inventoryId}`, adminToken);
    // 15 - 10 = 5 (requestA's reservation remains)
    assert.equal(inv.body.reservedQuantity, 5, 'reservedQuantity must drop back to 5 after rejection');
  });

  test('rejecting a Pending request does NOT alter reservedQuantity', async () => {
    const create = await post('/api/requests', { material: 'Steel', quantity: 3 }, customerBToken);
    assert.equal(create.status, 201);
    const pendingId = create.body._id;

    const invBefore = await get(`/api/inventory/${inventoryId}`, adminToken);
    const reservedBefore = invBefore.body.reservedQuantity;

    // Reject from Pending (no inventory was reserved)
    const r = await put(`/api/requests/${pendingId}/status`, { status: 'Rejected' }, adminToken);
    assert.equal(r.status, 200);

    const invAfter = await get(`/api/inventory/${inventoryId}`, adminToken);
    assert.equal(invAfter.body.reservedQuantity, reservedBefore, 'Pending→Rejected must not change reservedQuantity');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B14 — Concurrent approvals cannot oversell
// ─────────────────────────────────────────────────────────────────────────────
describe('B14 — Concurrent approval safety (integration)', () => {
  let concReqId1, concReqId2;

  test('setup: create two requests that together exceed remaining available stock', async () => {
    // Available = quantity(100) - reserved(5) = 95
    // Create two requests each for 80 — sum 160, exceeds 95
    const r1 = await post('/api/requests', { material: 'Steel', quantity: 80, inventory: inventoryId }, customerAToken);
    const r2 = await post('/api/requests', { material: 'Steel', quantity: 80, inventory: inventoryId }, customerBToken);
    assert.equal(r1.status, 201);
    assert.equal(r2.status, 201);
    concReqId1 = r1.body._id;
    concReqId2 = r2.body._id;
  });

  test('concurrent approvals: only one succeeds, one fails with insufficient stock', async () => {
    // Fire both approvals simultaneously
    const [res1, res2] = await Promise.all([
      put(`/api/requests/${concReqId1}/status`, { status: 'Approved', inventoryId }, adminToken),
      put(`/api/requests/${concReqId2}/status`, { status: 'Approved', inventoryId }, adminToken),
    ]);

    const statuses = [res1.status, res2.status].sort();
    // One must succeed (200), one must fail (400)
    assert.deepEqual(statuses, [200, 400], `Expected one 200 and one 400, got ${JSON.stringify(statuses)}`);
  });

  test('after concurrent race, inventory is not oversold', async () => {
    const inv = await get(`/api/inventory/${inventoryId}`, adminToken);
    const { quantity, reservedQuantity } = inv.body;
    assert.ok(
      reservedQuantity <= quantity,
      `reservedQuantity(${reservedQuantity}) must not exceed quantity(${quantity})`
    );
  });

  test('insufficient stock request returns 400', async () => {
    // Create a request for more than total quantity
    const r = await post('/api/requests', { material: 'Steel', quantity: 999, inventory: inventoryId }, customerAToken);
    assert.equal(r.status, 201);
    const bigId = r.body._id;

    const approveR = await put(`/api/requests/${bigId}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(approveR.status, 400);
    assert.match(approveR.body.message, /insufficient|stock|not found/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B11 — Server startup JWT guard (process-level, tested via logic in unit tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('B11 — JWT in-flight verification (integration)', () => {
  test('request with no token returns 401', async () => {
    const r = await get('/api/requests');
    assert.equal(r.status, 401);
  });

  test('request with tampered token returns 401', async () => {
    const r = await get('/api/requests', 'tampered.token.value');
    assert.equal(r.status, 401);
  });

  test('valid token returns 200', async () => {
    const r = await get('/api/requests', customerAToken);
    assert.equal(r.status, 200);
  });
});
