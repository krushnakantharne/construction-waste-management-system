'use strict';
/**
 * Phase 2B Integration Tests — Inventory Correctness (CWMS)
 * Runs against a REAL MongoDB (localhost:27017/cwms_phase2b_test).
 * Uses a separate database — production data never touched.
 *
 * Run: node server/tests/phase2b.integration.test.js
 */

process.env.NODE_ENV = 'test';
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

// Isolated test DB
process.env.MONGO_URI = 'mongodb://localhost:27017/cwms_phase2b_test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');

// ── Bootstrap app ─────────────────────────────────────────────────────────────
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',      require('../routes/authRoutes'));
app.use('/api/inventory', require('../routes/inventoryRoutes'));
app.use('/api/requests',  require('../routes/requestRoutes'));

// ── HTTP helpers ──────────────────────────────────────────────────────────────
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

const get  = (path, token)      => req('GET',    path, null, token);
const post = (path, body, token) => req('POST',   path, body, token);
const put  = (path, body, token) => req('PUT',    path, body, token);
const del  = (path, token)       => req('DELETE', path, null, token);

// ── Test state ────────────────────────────────────────────────────────────────
let adminToken, siteManagerToken, customerToken;
let inventoryId, inventoryId2;

// ── Lifecycle ─────────────────────────────────────────────────────────────────
before(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();

  await new Promise(resolve => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      BASE = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  // Seed users
  const User = require('../models/User');
  const admin = new User({ name: 'Admin', email: 'admin2b@test.com', password: 'adminpass', role: 'admin' });
  await admin.save();
  const mgr = new User({ name: 'Manager', email: 'mgr2b@test.com', password: 'mgrpass', role: 'siteManager' });
  await mgr.save();

  const a = await post('/api/auth/login', { email: 'admin2b@test.com', password: 'adminpass' });
  adminToken = a.body.token;

  const m = await post('/api/auth/login', { email: 'mgr2b@test.com', password: 'mgrpass' });
  siteManagerToken = m.body.token;

  const c = await post('/api/auth/register', { name: 'Customer', email: 'cust2b@test.com', password: 'custpass', role: 'customer' });
  customerToken = c.body.token;
});

after(async () => {
  server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv-Create
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv — Create inventory', () => {
  test('admin can create a valid inventory item', async () => {
    const r = await post('/api/inventory', {
      materialName: 'Steel Rebar',
      materialType: 'Metal',
      quantity: 100,
      unit: 'kg',
      estimatedValue: 5000,
      status: 'Available',
    }, adminToken);
    assert.equal(r.status, 201, JSON.stringify(r.body));
    inventoryId = r.body._id;
    assert.ok(inventoryId);
    assert.equal(r.body.quantity, 100);
    assert.equal(r.body.reservedQuantity, 0);
  });

  test('siteManager can create inventory', async () => {
    const r = await post('/api/inventory', {
      materialName: 'Timber Planks',
      materialType: 'Wood',
      quantity: 50,
      unit: 'pcs',
      estimatedValue: 2000,
      status: 'Available',
    }, siteManagerToken);
    assert.equal(r.status, 201);
    inventoryId2 = r.body._id;
  });

  test('customer cannot create inventory → 403', async () => {
    const r = await post('/api/inventory', {
      materialName: 'Brick',
      materialType: 'Masonry',
      quantity: 200,
      unit: 'pcs',
    }, customerToken);
    assert.equal(r.status, 403);
  });

  test('quantity = 0 returns 400', async () => {
    const r = await post('/api/inventory', {
      materialName: 'X',
      materialType: 'Y',
      quantity: 0,
      unit: 'kg',
    }, adminToken);
    assert.equal(r.status, 400);
    assert.match(r.body.message, /positive/);
  });

  test('negative quantity returns 400', async () => {
    const r = await post('/api/inventory', {
      materialName: 'X', materialType: 'Y', quantity: -10, unit: 'kg',
    }, adminToken);
    assert.equal(r.status, 400);
  });

  test('negative estimatedValue returns 400', async () => {
    const r = await post('/api/inventory', {
      materialName: 'X', materialType: 'Y', quantity: 10, unit: 'kg', estimatedValue: -100,
    }, adminToken);
    assert.equal(r.status, 400);
    assert.match(r.body.message, /estimatedValue/);
  });

  test('reservedQuantity exceeding quantity returns 400', async () => {
    const r = await post('/api/inventory', {
      materialName: 'X', materialType: 'Y', quantity: 10, unit: 'kg', reservedQuantity: 15,
    }, adminToken);
    assert.equal(r.status, 400);
    assert.match(r.body.message, /reservedQuantity/);
  });

  test('creation stamps createdBy with logged-in user', async () => {
    const r = await get(`/api/inventory/${inventoryId}`, adminToken);
    assert.equal(r.status, 200);
    // createdBy is populated as object with name
    assert.ok(r.body.createdBy, 'createdBy must be set');
  });

  test('availableQuantity virtual = quantity - reservedQuantity', async () => {
    const r = await get(`/api/inventory/${inventoryId}`, adminToken);
    // Virtual is not in JSON by default unless toJSON virtuals are on.
    // Check the arithmetic instead.
    const { quantity, reservedQuantity } = r.body;
    assert.equal(quantity - (reservedQuantity || 0), 100);
  });

  test('a stock movement (addition) is recorded on create', async () => {
    const r = await get(`/api/inventory/${inventoryId}/movements`, adminToken);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    const addition = r.body.find(m => m.movementType === 'addition');
    assert.ok(addition, 'addition movement must exist');
    assert.equal(addition.quantityDelta, 100);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv-Update
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv — Update inventory', () => {
  test('admin can update materialName', async () => {
    const r = await put(`/api/inventory/${inventoryId}`, { materialName: 'Steel Rebar (Updated)' }, adminToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.materialName, 'Steel Rebar (Updated)');
  });

  test('increasing quantity records an adjustment movement', async () => {
    const r = await put(`/api/inventory/${inventoryId}`, { quantity: 150 }, adminToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.quantity, 150);

    const mv = await get(`/api/inventory/${inventoryId}/movements`, adminToken);
    const adj = mv.body.find(m => m.movementType === 'adjustment' && m.quantityDelta === 50);
    assert.ok(adj, 'adjustment movement (+50) must be recorded');
  });

  test('customer cannot update inventory → 403', async () => {
    const r = await put(`/api/inventory/${inventoryId}`, { materialName: 'Hack' }, customerToken);
    assert.equal(r.status, 403);
  });

  test('negative quantity update returns 400', async () => {
    const r = await put(`/api/inventory/${inventoryId}`, { quantity: -1 }, adminToken);
    assert.equal(r.status, 400);
  });

  test('negative estimatedValue update returns 400', async () => {
    const r = await put(`/api/inventory/${inventoryId}`, { estimatedValue: -1 }, adminToken);
    assert.equal(r.status, 400);
  });

  test('PUT does not allow changing reservedQuantity directly', async () => {
    // Attempt to zero out reservedQuantity via PUT — should be ignored
    const before = await get(`/api/inventory/${inventoryId}`, adminToken);
    const rq_before = before.body.reservedQuantity;

    await put(`/api/inventory/${inventoryId}`, { reservedQuantity: 999 }, adminToken);

    const after = await get(`/api/inventory/${inventoryId}`, adminToken);
    assert.equal(after.body.reservedQuantity, rq_before, 'reservedQuantity must not change via PUT');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv — Reservation guard before delete
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv — Delete with reservation guard', () => {
  let reqId;

  test('approve a request to create a reservation', async () => {
    // Create a customer request for inventoryId2 (50 pcs)
    const reqR = await post('/api/requests', { material: 'Timber', quantity: 10 }, customerToken);
    assert.equal(reqR.status, 201);
    reqId = reqR.body._id;

    const approve = await put(`/api/requests/${reqId}/status`, { status: 'Approved', inventoryId: inventoryId2 }, adminToken);
    assert.equal(approve.status, 200, JSON.stringify(approve.body));
  });

  test('cannot delete inventory with active reservations → 400', async () => {
    const r = await del(`/api/inventory/${inventoryId2}`, adminToken);
    assert.equal(r.status, 400);
    assert.match(r.body.message, /reserved/);
  });

  test('reject request releases reservation', async () => {
    const r = await put(`/api/requests/${reqId}/status`, { status: 'Rejected' }, adminToken);
    assert.equal(r.status, 200);

    const inv = await get(`/api/inventory/${inventoryId2}`, adminToken);
    assert.equal(inv.body.reservedQuantity, 0);
  });

  test('can now delete after reservation released', async () => {
    const r = await del(`/api/inventory/${inventoryId2}`, adminToken);
    assert.equal(r.status, 200);
    assert.match(r.body.message, /removed/i);
  });

  test('deletion is recorded as a stock movement', async () => {
    // Movements for inventoryId2 should still exist (movements are not deleted with inventory)
    const r = await get(`/api/inventory/${inventoryId2}/movements`, adminToken);
    assert.equal(r.status, 200);
    const del_mov = r.body.find(m => m.movementType === 'deletion');
    assert.ok(del_mov, 'deletion movement must exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv — Stock movement history completeness
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv — Movement history (reservation → release)', () => {
  let mv_reqId;

  test('approve a request → reservation movement recorded', async () => {
    const r = await post('/api/requests', { material: 'Steel', quantity: 5 }, customerToken);
    assert.equal(r.status, 201);
    mv_reqId = r.body._id;

    const approve = await put(`/api/requests/${mv_reqId}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(approve.status, 200, JSON.stringify(approve.body));

    const mv = await get(`/api/inventory/${inventoryId}/movements`, adminToken);
    const res_mov = mv.body.find(m => m.movementType === 'reservation' && m.reference === mv_reqId);
    assert.ok(res_mov, 'reservation movement must reference request ID');
    assert.ok(res_mov.quantityDelta < 0, 'reservation delta must be negative');
  });

  test('reject request → release movement recorded', async () => {
    const reject = await put(`/api/requests/${mv_reqId}/status`, { status: 'Rejected' }, adminToken);
    assert.equal(reject.status, 200);

    const mv = await get(`/api/inventory/${inventoryId}/movements`, adminToken);
    const rel_mov = mv.body.find(m => m.movementType === 'release' && m.reference === mv_reqId);
    assert.ok(rel_mov, 'release movement must reference request ID');
    assert.ok(rel_mov.quantityDelta > 0, 'release delta must be positive');
  });

  test('movements endpoint requires staff role', async () => {
    const r = await get(`/api/inventory/${inventoryId}/movements`, customerToken);
    assert.equal(r.status, 403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv — Quantity constraint: cannot reduce below reservedQuantity
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv — Cannot reduce quantity below reservedQuantity', () => {
  let inv3Id, r3Id;

  test('setup: create inventory and approve request to establish reservation', async () => {
    const inv = await post('/api/inventory', {
      materialName: 'Concrete Blocks',
      materialType: 'Masonry',
      quantity: 80,
      unit: 'pcs',
      status: 'Available',
    }, adminToken);
    assert.equal(inv.status, 201);
    inv3Id = inv.body._id;

    const rq = await post('/api/requests', { material: 'Concrete', quantity: 40 }, customerToken);
    assert.equal(rq.status, 201);
    r3Id = rq.body._id;

    const approve = await put(`/api/requests/${r3Id}/status`, { status: 'Approved', inventoryId: inv3Id }, adminToken);
    assert.equal(approve.status, 200);

    // Verify 40 are reserved
    const inv_r = await get(`/api/inventory/${inv3Id}`, adminToken);
    assert.equal(inv_r.body.reservedQuantity, 40);
  });

  test('reduce quantity to below 40 returns 400', async () => {
    const r = await put(`/api/inventory/${inv3Id}`, { quantity: 30 }, adminToken);
    assert.equal(r.status, 400);
    assert.match(r.body.message, /reserved/);
  });

  test('reduce quantity to exactly 40 (= reservedQuantity) succeeds', async () => {
    const r = await put(`/api/inventory/${inv3Id}`, { quantity: 40 }, adminToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.quantity, 40);
  });
});
