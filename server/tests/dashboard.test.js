/* Dashboard aggregation tests – Phase 2E */
'use strict';
process.env.NODE_ENV = 'test';
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });
process.env.MONGO_URI = 'mongodb://localhost:27017/cwms_dashboard_test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// Build minimal app mirroring server.js routes needed for dashboard
const app = express();
app.use(cors());
app.use(express.json());

let server, BASE;
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
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const r = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
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
const get = (p, t) => req('GET', p, null, t);
const post = (p, b, t) => req('POST', p, b, t);

let adminToken;

before(async () => {
  // clear model & controller caches to avoid stale connection
  Object.keys(require.cache).forEach((k) => {
    if (k.includes('/models/Transaction') || k.includes('/controllers/dashboardController')) {
      delete require.cache[k];
    }
  });
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();
  // load routes after DB connection
  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/dashboard', require('../routes/dashboardRoutes'));
  app.use('/api/transactions', require('../routes/transactionRoutes'));
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  BASE = `http://127.0.0.1:${server.address().port}`;
  const User = require('../models/User');
  const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'adminpass', role: 'admin' });
  await admin.save();
  const r = await post('/api/auth/login', { email: 'admin@test.com', password: 'adminpass' });
  assert.equal(r.status, 200);
  adminToken = r.body.token;
});




after(async () => {
  server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Dashboard financial aggregation', () => {
  test('valid numeric amounts', async () => {
    const Transaction = require('../models/Transaction');
    await Transaction.deleteMany({});
    await Transaction.create({ type: 'Expense', amount: 100, category: 'Test' });
    await Transaction.create({ type: 'Income', amount: 250, category: 'Test' });
    const res = await get('/api/dashboard/summary', adminToken);
    assert.equal(res.status, 200);
    assert.equal(res.body.totalCost, 100);
    assert.equal(res.body.revenue, 250);
    assert.equal(res.body.netCost, -150);
  });

  test('non‑numeric amounts are ignored', async () => {
    const Transaction = require('../models/Transaction');
    await Transaction.deleteMany({});
    // baseline valid amounts
    await Transaction.create({ type: 'Expense', amount: 100, category: 'Test' });
    await Transaction.create({ type: 'Income', amount: 250, category: 'Test' });
    // non-numeric inserts
    await Transaction.collection.insertOne({ type: 'Expense', amount: 'abc' });
    await Transaction.collection.insertOne({ type: 'Income', amount: 'xyz' });
    const res = await get('/api/dashboard/summary', adminToken);
    assert.equal(res.status, 200);
    assert.equal(res.body.totalCost, 100);
    assert.equal(res.body.revenue, 250);
    assert.equal(res.body.netCost, -150);
  });

  test('mixed valid and invalid amounts', async () => {
    const Transaction = require('../models/Transaction');
    await Transaction.deleteMany({});
    // baseline valid amounts
    await Transaction.create({ type: 'Expense', amount: 100, category: 'Test' });
    await Transaction.create({ type: 'Income', amount: 250, category: 'Test' });
    // extra valid and invalid amounts
    await Transaction.create({ type: 'Expense', amount: 70 });
    await Transaction.collection.insertOne({ type: 'Expense', amount: 'bad' });
    await Transaction.create({ type: 'Income', amount: 30 });
    const res = await get('/api/dashboard/summary', adminToken);
    assert.equal(res.status, 200);
    assert.equal(res.body.totalCost, 170);
    assert.equal(res.body.revenue, 280);
    assert.equal(res.body.netCost, -110);
  });
});
