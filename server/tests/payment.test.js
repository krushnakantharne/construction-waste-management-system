/**
 * Payment Backend Integration Tests — CWMS Phase 2D
 */
'use strict';
process.env.NODE_ENV = 'test';
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });
process.env.MONGO_URI = 'mongodb://localhost:27017/cwms_payment_test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// Build app (mirrors server.js)
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/projects', require('../routes/projectRoutes'));
app.use('/api/waste', require('../routes/wasteRoutes'));
app.use('/api/inventory', require('../routes/inventoryRoutes'));
app.use('/api/requests', require('../routes/requestRoutes'));
app.use('/api/pickups', require('../routes/pickupRoutes'));
app.use('/api/transactions', require('../routes/transactionRoutes'));
app.use('/api/feedback', require('../routes/feedbackRoutes'));
app.use('/api/dashboard', require('../routes/dashboardRoutes'));
app.use('/api/reports', require('../routes/reportRoutes'));
app.use('/api/invoices', require('../routes/invoiceRoutes'));
app.use('/api/payments', require('../routes/paymentRoutes'));

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
const put = (p, b, t) => req('PUT', p, b, t);

let adminToken, custToken, inventoryId, requestId, invoiceId;

before(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  await mongoose.connection.dropDatabase();
  await new Promise((resolve) => {
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

describe('Setup users & inventory', () => {
  test('admin seed', async () => {
    const User = require('../models/User');
    const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'adminpass', role: 'admin' });
    await admin.save();
    const r = await post('/api/auth/login', { email: 'admin@test.com', password: 'adminpass' });
    assert.equal(r.status, 200);
    adminToken = r.body.token;
  });
  test('customer register', async () => {
    const r = await post('/api/auth/register', { name: 'Cust', email: 'c@test.com', password: 'pass1234', role: 'customer' });
    assert.equal(r.status, 201);
    custToken = r.body.token;
  });
  test('create inventory', async () => {
    const r = await post('/api/inventory', {
      materialName: 'Steel', materialType: 'Metal', quantity: 100, unit: 'kg', estimatedValue: 5000, status: 'Available'
    }, adminToken);
    assert.equal(r.status, 201);
    inventoryId = r.body._id;
  });
});

describe('Invoice generation', () => {
  test('customer creates request', async () => {
    const r = await post('/api/requests', { material: 'Steel', quantity: 10, inventory: inventoryId }, custToken);
    assert.equal(r.status, 201);
    requestId = r.body._id;
  });
  test('admin approves request – invoice', async () => {
    const r = await put(`/api/requests/${requestId}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(r.status, 200);
    // fetch invoice list for customer to get invoice id
    const invList = await get('/api/invoices', custToken);
    assert.equal(invList.status, 200);
    assert.equal(invList.body.length, 1);
    invoiceId = invList.body[0]._id;
  });
});

describe('Payment flow', () => {
  test('partial payment succeeds', async () => {
    const r = await post('/api/payments', { invoiceId, amount: 300, method: 'cash' }, custToken);
    assert.equal(r.status, 201);
    assert.equal(r.body.amount, 300);
  });
  test('second partial payment succeeds', async () => {
    const r = await post('/api/payments', { invoiceId, amount: 200, method: 'card' }, custToken);
    assert.equal(r.status, 201);
  });
  test('overpayment rejected', async () => {
    const r = await post('/api/payments', { invoiceId, amount: 1000, method: 'cash' }, custToken);
    assert.equal(r.status, 400);
  });
  test('invoice marked paid after partial payments', async () => {
    const inv = await get(`/api/invoices/${invoiceId}`, custToken);
    assert.equal(inv.status, 200);
    assert.equal(inv.body.paid, true);
  });
});
