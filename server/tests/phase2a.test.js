/**
 * Phase 2A Regression Tests — CWMS
 * Uses Node.js built-in test runner (node:test + node:assert).
 * Tests are pure logic / unit tests that do NOT require a running server or DB.
 * Integration tests that require a live server are clearly marked NOT_RUN.
 *
 * Run: node server/tests/phase2a.test.js
 */
'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers extracted from controllers — tested in isolation
// ─────────────────────────────────────────────────────────────────────────────

const PRIVILEGED_ROLES = ['admin'];
const safeRole = (role) =>
  PRIVILEGED_ROLES.includes(role) ? 'customer' : (role || 'customer');

const STAFF_ROLES = ['admin', 'siteManager', 'recycler'];
const isStaff = (role) => STAFF_ROLES.includes(role);

const VALID_TRANSITIONS = {
  Pending:    ['Approved', 'Rejected'],
  Approved:   ['Processing', 'Rejected'],
  Processing: ['Completed', 'Rejected'],
  Completed:  [],
  Rejected:   [],
  Cancelled:  [],
};

const canTransition = (from, to) => {
  if (from === to) return false;           // B3: same-status is always blocked
  return (VALID_TRANSITIONS[from] || []).includes(to);
};

// Simulated atomic reservation check (mirrors the $expr filter in requestController)
const canReserve = (inventory, requestedQty) => {
  const available = inventory.quantity - (inventory.reservedQuantity || 0);
  return inventory.status === 'Available' && available >= requestedQty;
};

// ─────────────────────────────────────────────────────────────────────────────
// B10 — Admin self-registration prevention
// ─────────────────────────────────────────────────────────────────────────────
describe('B10 — Admin registration prevention', () => {
  test('admin role is stripped to customer on public register', () => {
    assert.equal(safeRole('admin'), 'customer');
  });

  test('siteManager role is preserved (not privileged)', () => {
    assert.equal(safeRole('siteManager'), 'siteManager');
  });

  test('customer role is preserved', () => {
    assert.equal(safeRole('customer'), 'customer');
  });

  test('recycler role is preserved', () => {
    assert.equal(safeRole('recycler'), 'recycler');
  });

  test('empty role defaults to customer', () => {
    assert.equal(safeRole(undefined), 'customer');
    assert.equal(safeRole(''), 'customer');
    assert.equal(safeRole(null), 'customer');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B5 — Customer isolation
// ─────────────────────────────────────────────────────────────────────────────
describe('B5 — Customer isolation logic', () => {
  test('admin is classified as staff', () => {
    assert.equal(isStaff('admin'), true);
  });

  test('siteManager is classified as staff', () => {
    assert.equal(isStaff('siteManager'), true);
  });

  test('recycler is classified as staff', () => {
    assert.equal(isStaff('recycler'), true);
  });

  test('customer is NOT staff', () => {
    assert.equal(isStaff('customer'), false);
  });

  test('unknown role is NOT staff', () => {
    assert.equal(isStaff('guest'), false);
    assert.equal(isStaff(undefined), false);
  });

  test('non-staff query gets customer filter applied', () => {
    const userId = 'user123';
    const role = 'customer';
    const query = {};
    if (!isStaff(role)) query.customer = userId;
    assert.deepEqual(query, { customer: userId });
  });

  test('staff query has no customer filter', () => {
    const role = 'admin';
    const query = {};
    if (!isStaff(role)) query.customer = 'someId';
    assert.deepEqual(query, {});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B3 — Idempotency: repeated approval
// ─────────────────────────────────────────────────────────────────────────────
describe('B3 — Request transition idempotency', () => {
  test('re-approving an already-Approved request is blocked', () => {
    assert.equal(canTransition('Approved', 'Approved'), false);
  });

  test('re-submitting Pending→Pending is blocked', () => {
    assert.equal(canTransition('Pending', 'Pending'), false);
  });

  test('Completed cannot be re-approved (terminal)', () => {
    assert.equal(canTransition('Completed', 'Approved'), false);
  });

  test('Rejected cannot be re-opened (terminal)', () => {
    assert.equal(canTransition('Rejected', 'Pending'), false);
    assert.equal(canTransition('Rejected', 'Approved'), false);
  });

  test('valid Pending→Approved is allowed', () => {
    assert.equal(canTransition('Pending', 'Approved'), true);
  });

  test('valid Approved→Processing is allowed', () => {
    assert.equal(canTransition('Approved', 'Processing'), true);
  });

  test('valid Processing→Completed is allowed', () => {
    assert.equal(canTransition('Processing', 'Completed'), true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B4 — Rejection restores reservation only when applicable
// ─────────────────────────────────────────────────────────────────────────────
describe('B4 — Rejection/cancellation stock release', () => {
  test('Pending→Rejected is a valid transition (no reservation to release)', () => {
    assert.equal(canTransition('Pending', 'Rejected'), true);
  });

  test('Approved→Rejected is valid (reservation should be released)', () => {
    assert.equal(canTransition('Approved', 'Rejected'), true);
  });

  test('Processing→Rejected is valid (reservation should be released)', () => {
    assert.equal(canTransition('Processing', 'Rejected'), true);
  });

  test('release guard: only releases when prior status had a reservation', () => {
    // Mirrors: (status==='Rejected') && (request.status==='Approved'||'Processing') && request.inventory
    const shouldRelease = (currentStatus, newStatus, hasInventory) =>
      (newStatus === 'Rejected' || newStatus === 'Cancelled') &&
      (currentStatus === 'Approved' || currentStatus === 'Processing') &&
      hasInventory;

    assert.equal(shouldRelease('Pending', 'Rejected', false), false, 'Pending→Rejected no inventory, no release');
    assert.equal(shouldRelease('Approved', 'Rejected', true), true,  'Approved→Rejected with inventory, release');
    assert.equal(shouldRelease('Processing', 'Rejected', true), true, 'Processing→Rejected with inventory, release');
    assert.equal(shouldRelease('Approved', 'Rejected', false), false, 'Approved→Rejected no inventory linked, no release');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B14 — Concurrent approval / atomic reservation logic
// ─────────────────────────────────────────────────────────────────────────────
describe('B14 — Atomic reservation logic', () => {
  test('reservation allowed when available quantity >= requested', () => {
    const inv = { quantity: 100, reservedQuantity: 20, status: 'Available' };
    assert.equal(canReserve(inv, 50), true);  // 80 available, requesting 50
  });

  test('reservation denied when available quantity < requested', () => {
    const inv = { quantity: 100, reservedQuantity: 60, status: 'Available' };
    assert.equal(canReserve(inv, 50), false); // 40 available, requesting 50
  });

  test('reservation denied when inventory is not Available', () => {
    const inv = { quantity: 100, reservedQuantity: 0, status: 'Sold' };
    assert.equal(canReserve(inv, 10), false);
  });

  test('reservation denied when requesting exact remaining after another reservation', () => {
    const inv = { quantity: 100, reservedQuantity: 100, status: 'Available' };
    assert.equal(canReserve(inv, 1), false);  // 0 available
  });

  test('reservation allowed at exact boundary', () => {
    const inv = { quantity: 50, reservedQuantity: 0, status: 'Available' };
    assert.equal(canReserve(inv, 50), true);  // exactly 50 available
  });

  test('two concurrent approvals for same qty both cannot succeed (race simulation)', () => {
    // Simulate: inventory starts at qty=50, reserved=0.
    // First approval atomically increments reservedQuantity to 50.
    // Second approval checks the same filter — now available=0, fails.
    let inv = { quantity: 50, reservedQuantity: 0, status: 'Available' };
    const qty = 50;

    const first = canReserve(inv, qty);
    assert.equal(first, true);
    // Apply first reservation
    inv = { ...inv, reservedQuantity: inv.reservedQuantity + qty };

    const second = canReserve(inv, qty);
    assert.equal(second, false, 'Second concurrent approval must be denied');
  });

  test('reservedQuantity defaults to 0 when missing (handles legacy records)', () => {
    const inv = { quantity: 100, status: 'Available' }; // no reservedQuantity field
    // $ifNull in mongo handles this; mirror it:
    const available = inv.quantity - (inv.reservedQuantity || 0);
    assert.equal(available, 100);
    assert.equal(canReserve(inv, 50), true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B9 — Authorization middleware logic
// ─────────────────────────────────────────────────────────────────────────────
describe('B9 — authorize middleware logic', () => {
  // Inline reproduction of roleMiddleware.authorize
  const authorize = (...roles) => (userRole) => roles.includes(userRole);

  test('admin is authorized for admin-only route', () => {
    assert.equal(authorize('admin')('admin'), true);
  });

  test('customer is rejected from admin-only route', () => {
    assert.equal(authorize('admin')('customer'), false);
  });

  test('siteManager is authorized for staff routes', () => {
    assert.equal(authorize('admin', 'siteManager')('siteManager'), true);
  });

  test('customer is rejected from staff-only routes', () => {
    assert.equal(authorize('admin', 'siteManager')('customer'), false);
  });

  test('recycler is rejected from admin/siteManager routes', () => {
    assert.equal(authorize('admin', 'siteManager')('recycler'), false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B11 — JWT startup validation
// ─────────────────────────────────────────────────────────────────────────────
describe('B11 — JWT configuration guard', () => {
  const PLACEHOLDER = 'REPLACE_ME_WITH_A_STRONG_RANDOM_SECRET_AT_LEAST_64_CHARS';
  const shouldBlock = (secret) => !secret || secret === PLACEHOLDER;

  test('missing JWT_SECRET blocks startup', () => {
    assert.equal(shouldBlock(undefined), true);
    assert.equal(shouldBlock(''), true);
    assert.equal(shouldBlock(null), true);
  });

  test('placeholder value blocks startup', () => {
    assert.equal(shouldBlock(PLACEHOLDER), true);
  });

  test('real secret allows startup', () => {
    const realSecret = '34546dbfa309272d23f174ebd39e07c94209b6ecbb3d1102a8a8fdf776b4f859e34a59c8ff8e1ef45f3560edd2a541a8e929a8af14dd0dafad4e6a80dcfbfdd6';
    assert.equal(shouldBlock(realSecret), false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NOT_RUN — Integration tests requiring live server + DB
// ─────────────────────────────────────────────────────────────────────────────
describe('Integration tests (NOT_RUN — require live server)', () => {
  test.todo('POST /api/auth/register with role:admin returns role:customer');
  test.todo('POST /api/auth/admin/register without token returns 401');
  test.todo('POST /api/auth/admin/register with customer token returns 403');
  test.todo('POST /api/auth/admin/register with admin token succeeds');
  test.todo('GET /api/requests as customerA does not return customerB requests');
  test.todo('PUT /api/requests/:id/status as customer returns 403');
  test.todo('PUT /api/requests/:id/status Approved twice returns 400 on second call');
  test.todo('PUT /api/requests/:id/status Rejected restores reservedQuantity');
  test.todo('POST /api/inventory (create) as customer returns 403');
  test.todo('DELETE /api/inventory/:id as siteManager returns 403');
  test.todo('GET /api/reports/financial as customer returns 403');
  test.todo('Server startup with missing JWT_SECRET exits process');
  test.todo('Concurrent Approve race: only one succeeds when qty=requested');
});
