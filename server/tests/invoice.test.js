/**
 * Invoice Backend Integration Tests — CWMS Phase 2D
 * Runs against a real MongoDB instance (localhost:27017/cwms_invoice_test).
 */
'use strict';
process.env.NODE_ENV = 'test';
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });
process.env.MONGO_URI = 'mongodb://localhost:27017/cwms_invoice_test';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

// Build app (mirrors server.js but adds invoice routes)
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

let adminToken, custAToken, custBToken, siteMgrToken;
let inventoryId, requestAId, requestBId;

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
  test('register admin via DB seed', async () => {
    const User = require('../models/User');
    const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'adminpass', role: 'admin' });
    await admin.save();
    const r = await post('/api/auth/login', { email: 'admin@test.com', password: 'adminpass' });
    assert.equal(r.status, 200);
    adminToken = r.body.token;
  });
  test('register customer A', async () => {
    const r = await post('/api/auth/register', { name: 'Cust A', email: 'a@test.com', password: 'pass1234', role: 'customer' });
    assert.equal(r.status, 201);
    custAToken = r.body.token;
  });
  test('register customer B', async () => {
    const r = await post('/api/auth/register', { name: 'Cust B', email: 'b@test.com', password: 'pass1234', role: 'customer' });
    assert.equal(r.status, 201);
    custBToken = r.body.token;
  });
  test('register site manager', async () => {
    const r = await post('/api/auth/register', { name: 'Mgr', email: 'mgr@test.com', password: 'pass1234', role: 'siteManager' });
    assert.equal(r.status, 201);
    siteMgrToken = r.body.token;
  });
  test('create inventory (admin)', async () => {
    const r = await post('/api/inventory', {
      materialName: 'Steel', materialType: 'Metal', quantity: 100, unit: 'kg', estimatedValue: 5000, status: 'Available'
    }, adminToken);
    assert.equal(r.status, 201);
    inventoryId = r.body._id;
  });
});

describe('Invoice generation and access', () => {
  test('customer A creates request', async () => {
    const r = await post('/api/requests', { material: 'Steel', quantity: 5, inventory: inventoryId }, custAToken);
    assert.equal(r.status, 201);
    requestAId = r.body._id;
  });
  test('admin approves request A – invoice created', async () => {
    const r = await put(`/api/requests/${requestAId}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'Approved');
  });
  test('customer B creates another request', async () => {
    const r = await post('/api/requests', { material: 'Steel', quantity: 3, inventory: inventoryId }, custBToken);
    assert.equal(r.status, 201);
    requestBId = r.body._id;
  });
  test('admin approves request B – second invoice', async () => {
    const r = await put(`/api/requests/${requestBId}/status`, { status: 'Approved', inventoryId }, adminToken);
    assert.equal(r.status, 200);
  });
  test('customer A lists own invoices – sees 1', async () => {
    const r = await get('/api/invoices', custAToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 1);
  });
  test('admin lists all invoices – sees 2', async () => {
    const r = await get('/api/invoices', adminToken);
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 2);
  });
  test('customer A cannot access B invoice detail', async () => {
    const list = await get('/api/invoices', adminToken);
    const bInvoice = list.body.find(inv => inv.customer && inv.customer !== list.body[0].customer);
    const r = await get(`/api/invoices/${bInvoice._id}`, custAToken);
    assert.equal(r.status, 403);
  });
  test('customer A can fetch own invoice detail', async () => {
    const list = await get('/api/invoices', custAToken);
    const invId = list.body[0]._id;
    const r = await get(`/api/invoices/${invId}`, custAToken);
    assert.equal(r.status, 200);
    assert.equal(r.body._id, invId);
  });
});
