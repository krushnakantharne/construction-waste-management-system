'use strict';
const mongoose = require('mongoose');

/**
 * StockMovement — append-only ledger for inventory changes.
 *
 * movementType values:
 *   addition        — new stock added (POST /api/inventory)
 *   adjustment      — manual quantity/value edit (PUT /api/inventory/:id)
 *   reservation     — stock reserved when request Approved
 *   release         — reservation freed when request Rejected/Cancelled
 *   consumption     — stock deducted when request Completed
 *   deletion        — item removed from inventory
 */
const stockMovementSchema = new mongoose.Schema(
  {
    inventory:    { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true, index: true },
    movementType: {
      type: String,
      required: true,
      enum: ['addition', 'adjustment', 'reservation', 'release', 'consumption', 'deletion'],
    },
    quantityDelta: { type: Number, required: true }, // positive = stock in, negative = stock out
    quantityAfter: { type: Number },                 // quantity field value after the movement
    reservedAfter: { type: Number },                 // reservedQuantity after the movement
    reference:    { type: String },                  // e.g. request ID or "manual"
    notes:        { type: String },
    performedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// No updates allowed — movements are immutable. Guard at the model level.
stockMovementSchema.pre('findOneAndUpdate', function () {
  throw new Error('StockMovement records are immutable.');
});
stockMovementSchema.pre('updateOne', function () {
  throw new Error('StockMovement records are immutable.');
});
stockMovementSchema.pre('updateMany', function () {
  throw new Error('StockMovement records are immutable.');
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);
