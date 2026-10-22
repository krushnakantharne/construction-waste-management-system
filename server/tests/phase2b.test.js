'use strict';
/**
 * Phase 2B Unit Tests — Inventory Correctness (CWMS)
 * Pure logic tests — no DB or HTTP required.
 *
 * Run: node server/tests/phase2b.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// ─────────────────────────────────────────────────────────────────────────────
// Inventory validation helpers (mirrors inventoryController logic)
// ─────────────────────────────────────────────────────────────────────────────

function validateCreate({ quantity, estimatedValue, reservedQuantity }) {
  if (quantity == null || isNaN(quantity) || Number(quantity) <= 0) {
    return { ok: false, message: 'quantity must be a positive number.' };
  }
  if (estimatedValue != null && (isNaN(estimatedValue) || Number(estimatedValue) < 0)) {
    return { ok: false, message: 'estimatedValue must be >= 0.' };
  }
  const rq = Number(reservedQuantity) || 0;
  if (rq > Number(quantity)) {
    return { ok: false, message: 'reservedQuantity cannot exceed quantity.' };
  }
  return { ok: true };
}

function validateUpdate(existing, { quantity, estimatedValue }) {
  if (quantity != null) {
    const newQty = Number(quantity);
    if (isNaN(newQty) || newQty < 0) {
      return { ok: false, message: 'quantity must be >= 0.' };
    }
    if (newQty < existing.reservedQuantity) {
      return {
        ok: false,
        message: `Cannot reduce quantity to ${newQty}: ${existing.reservedQuantity} units are currently reserved.`,
      };
    }
  }
  if (estimatedValue != null && (isNaN(estimatedValue) || Number(estimatedValue) < 0)) {
    return { ok: false, message: 'estimatedValue must be >= 0.' };
  }
  return { ok: true };
}

function validateDelete(existing) {
  if ((existing.reservedQuantity || 0) > 0) {
    return {
      ok: false,
      message: `Cannot delete: ${existing.reservedQuantity} units are currently reserved.`,
    };
  }
  return { ok: true };
}

// Available quantity calculation (mirrors Inventory virtual)
function availableQty(item) {
  return Math.max(0, item.quantity - (item.reservedQuantity || 0));
}

// Movement delta helpers
function reservationDelta(qty) { return { type: 'reservation', delta: -qty }; }
function releaseDelta(qty)     { return { type: 'release',     delta: +qty }; }
function consumptionDelta(qty) { return { type: 'consumption', delta: -qty }; }
function additionDelta(qty)    { return { type: 'addition',    delta: +qty }; }
function adjustmentDelta(oldQty, newQty) {
  return { type: 'adjustment', delta: newQty - oldQty };
}

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv-1 — Create validation
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv-1 — Create inventory validation', () => {
  test('quantity = 0 is rejected', () => {
    const r = validateCreate({ quantity: 0, estimatedValue: 100 });
    assert.equal(r.ok, false);
    assert.match(r.message, /positive/);
  });

  test('negative quantity is rejected', () => {
    const r = validateCreate({ quantity: -5, estimatedValue: 100 });
    assert.equal(r.ok, false);
  });

  test('null quantity is rejected', () => {
    const r = validateCreate({ quantity: null });
    assert.equal(r.ok, false);
  });

  test('positive quantity is accepted', () => {
    const r = validateCreate({ quantity: 10, estimatedValue: 500 });
    assert.equal(r.ok, true);
  });

  test('fractional quantity is accepted', () => {
    const r = validateCreate({ quantity: 0.5 });
    assert.equal(r.ok, true);
  });

  test('negative estimatedValue is rejected', () => {
    const r = validateCreate({ quantity: 10, estimatedValue: -1 });
    assert.equal(r.ok, false);
    assert.match(r.message, /estimatedValue/);
  });

  test('zero estimatedValue is accepted', () => {
    const r = validateCreate({ quantity: 10, estimatedValue: 0 });
    assert.equal(r.ok, true);
  });

  test('reservedQuantity > quantity is rejected on create', () => {
    const r = validateCreate({ quantity: 10, reservedQuantity: 15 });
    assert.equal(r.ok, false);
    assert.match(r.message, /reservedQuantity/);
  });

  test('reservedQuantity = quantity is accepted', () => {
    const r = validateCreate({ quantity: 10, reservedQuantity: 10 });
    assert.equal(r.ok, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv-3 — Update validation
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv-3 — Update inventory validation', () => {
  const existing = { quantity: 100, reservedQuantity: 30 };

  test('reducing quantity below reservedQuantity is rejected', () => {
    const r = validateUpdate(existing, { quantity: 20 });
    assert.equal(r.ok, false);
    assert.match(r.message, /reserved/);
  });

  test('reducing quantity to exactly reservedQuantity is allowed', () => {
    const r = validateUpdate(existing, { quantity: 30 });
    assert.equal(r.ok, true);
  });

  test('negative quantity is rejected', () => {
    const r = validateUpdate(existing, { quantity: -1 });
    assert.equal(r.ok, false);
    assert.match(r.message, /quantity must be/);
  });

  test('zero quantity is allowed (when reservedQty is 0)', () => {
    const noReserved = { quantity: 10, reservedQuantity: 0 };
    const r = validateUpdate(noReserved, { quantity: 0 });
    assert.equal(r.ok, true);
  });

  test('no quantity change passes', () => {
    const r = validateUpdate(existing, { estimatedValue: 999 });
    assert.equal(r.ok, true);
  });

  test('negative estimatedValue rejected on update', () => {
    const r = validateUpdate(existing, { estimatedValue: -10 });
    assert.equal(r.ok, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B2-Inv-5 — Delete validation
// ─────────────────────────────────────────────────────────────────────────────
describe('B2-Inv-5 — Delete inventory validation', () => {
  test('delete with active reservations is rejected', () => {
    const r = validateDelete({ reservedQuantity: 5 });
    assert.equal(r.ok, false);
    assert.match(r.message, /reserved/);
  });

  test('delete with zero reservedQuantity is allowed', () => {
    const r = validateDelete({ reservedQuantity: 0 });
    assert.equal(r.ok, true);
  });

  test('delete with undefined reservedQuantity is allowed (treated as 0)', () => {
    const r = validateDelete({});
    assert.equal(r.ok, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Available quantity calculation
// ─────────────────────────────────────────────────────────────────────────────
describe('Available quantity calculation', () => {
  test('availableQty = quantity - reservedQuantity', () => {
    assert.equal(availableQty({ quantity: 100, reservedQuantity: 30 }), 70);
  });

  test('availableQty floors at 0 (never negative)', () => {
    assert.equal(availableQty({ quantity: 5, reservedQuantity: 10 }), 0);
  });

  test('availableQty with no reservedQuantity defaults to quantity', () => {
    assert.equal(availableQty({ quantity: 50 }), 50);
  });

  test('availableQty = 0 when fully reserved', () => {
    assert.equal(availableQty({ quantity: 20, reservedQuantity: 20 }), 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stock movement delta helpers
// ─────────────────────────────────────────────────────────────────────────────
describe('Stock movement delta correctness', () => {
  test('reservation delta is negative (stock out from available)', () => {
    const m = reservationDelta(10);
    assert.equal(m.type, 'reservation');
    assert.equal(m.delta, -10);
  });

  test('release delta is positive (stock returned to available)', () => {
    const m = releaseDelta(10);
    assert.equal(m.type, 'release');
    assert.equal(m.delta, +10);
  });

  test('consumption delta is negative (permanently deducted)', () => {
    const m = consumptionDelta(5);
    assert.equal(m.type, 'consumption');
    assert.equal(m.delta, -5);
  });

  test('addition delta is positive', () => {
    const m = additionDelta(100);
    assert.equal(m.type, 'addition');
    assert.equal(m.delta, 100);
  });

  test('adjustment delta reflects direction of change', () => {
    assert.equal(adjustmentDelta(100, 80).delta, -20);
    assert.equal(adjustmentDelta(50, 70).delta, +20);
    assert.equal(adjustmentDelta(30, 30).delta, 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Consistent display: unit, estimatedValue per unit
// ─────────────────────────────────────────────────────────────────────────────
describe('Cost-per-unit calculation', () => {
  function costPerUnit(item) {
    if (!item.quantity || item.quantity <= 0) return 0;
    return (item.estimatedValue || 0) / item.quantity;
  }

  test('cost per unit calculated correctly', () => {
    assert.equal(costPerUnit({ quantity: 100, estimatedValue: 5000 }), 50);
  });

  test('cost per unit is 0 when estimatedValue is undefined', () => {
    assert.equal(costPerUnit({ quantity: 100 }), 0);
  });

  test('cost per unit is 0 when quantity is 0', () => {
    assert.equal(costPerUnit({ quantity: 0, estimatedValue: 5000 }), 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Duplicate movement guard (idempotency)
// ─────────────────────────────────────────────────────────────────────────────
describe('Duplicate stock movement prevention', () => {
  // Simulate a simple idempotency check: same (inventoryId, reference, type) not allowed twice
  function isUniqueMovement(existing, candidate) {
    return !existing.some(
      m => m.inventory === candidate.inventory &&
           m.reference === candidate.reference &&
           m.movementType === candidate.movementType
    );
  }

  test('duplicate reservation for same request is blocked', () => {
    const existing = [{ inventory: 'inv1', reference: 'req1', movementType: 'reservation' }];
    const candidate = { inventory: 'inv1', reference: 'req1', movementType: 'reservation' };
    assert.equal(isUniqueMovement(existing, candidate), false);
  });

  test('release for same request is not blocked (different type)', () => {
    const existing = [{ inventory: 'inv1', reference: 'req1', movementType: 'reservation' }];
    const candidate = { inventory: 'inv1', reference: 'req1', movementType: 'release' };
    assert.equal(isUniqueMovement(existing, candidate), true);
  });

  test('reservation for a different request is allowed', () => {
    const existing = [{ inventory: 'inv1', reference: 'req1', movementType: 'reservation' }];
    const candidate = { inventory: 'inv1', reference: 'req2', movementType: 'reservation' };
    assert.equal(isUniqueMovement(existing, candidate), true);
  });
});
