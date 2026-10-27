'use strict';
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
require('../models/Project');

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Record one stock movement; never throws — logs on failure. */
async function recordMovement(data) {
  try {
    await StockMovement.create(data);
  } catch (err) {
    console.error('[StockMovement] Failed to record movement:', err.message);
  }
}

 // ── GET /api/inventory ────────────────────────────────────────────────────────
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({})
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ materialName: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ── GET /api/inventory/:id ────────────────────────────────────────────────────
const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('project', 'name')
      .populate('createdBy', 'name');
    if (inventory) res.json(inventory);
    else res.status(404).json({ message: 'Inventory item not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── GET /api/inventory/:id/movements ─────────────────────────────────────────
const getMovements = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid inventory ID' });
    }
    const movements = await StockMovement.find({ inventory: req.params.id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(movements);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── POST /api/inventory ───────────────────────────────────────────────────────
// B2-Inv-1: Validates quantity > 0, estimatedValue >= 0.
// B2-Inv-2: Stamps createdBy from authenticated user.
const createInventory = async (req, res) => {
  try {
    const { quantity, estimatedValue, reservedQuantity } = req.body;

    // Guard: quantity must be a positive number
    if (quantity == null || isNaN(quantity) || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'quantity must be a positive number.' });
    }

    // Guard: estimatedValue must be non-negative if provided
    if (estimatedValue != null && (isNaN(estimatedValue) || Number(estimatedValue) < 0)) {
      return res.status(400).json({ message: 'estimatedValue must be >= 0.' });
    }

    // Guard: reservedQuantity must not exceed quantity on creation
    const rq = Number(reservedQuantity) || 0;
    if (rq > Number(quantity)) {
      return res.status(400).json({ message: 'reservedQuantity cannot exceed quantity.' });
    }

    const inventoryData = {
      ...req.body,
      quantity: Number(quantity),
      reservedQuantity: rq,
      createdBy: req.user._id,
    };
    // Clean empty strings for ObjectId refs
    if (inventoryData.project === '') delete inventoryData.project;
    if (inventoryData.sourceWaste === '') delete inventoryData.sourceWaste;

    const inventory = new Inventory(inventoryData);
    const created = await inventory.save();

    await recordMovement({
      inventory:    created._id,
      movementType: 'addition',
      quantityDelta: created.quantity,
      quantityAfter: created.quantity,
      reservedAfter: created.reservedQuantity,
      reference:    'initial',
      notes:        `Created: ${created.materialName}`,
      performedBy:  req.user._id,
    });

    res.status(201).json(created);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── PUT /api/inventory/:id ────────────────────────────────────────────────────
// B2-Inv-3: Prevents quantity from going below reservedQuantity.
// B2-Inv-4: Prevents negative quantity.
// Records an 'adjustment' movement for quantity changes.
const updateInventory = async (req, res) => {
  try {
    const existing = await Inventory.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Inventory item not found' });

    const { quantity, estimatedValue } = req.body;

    // Guard: if quantity is being changed, validate it
    if (quantity != null) {
      const newQty = Number(quantity);
      if (isNaN(newQty) || newQty < 0) {
        return res.status(400).json({ message: 'quantity must be >= 0.' });
      }
      // Cannot set quantity below what is already reserved
      if (newQty < existing.reservedQuantity) {
        return res.status(400).json({
          message: `Cannot reduce quantity to ${newQty}: ${existing.reservedQuantity} units are currently reserved.`,
        });
      }
    }

    // Guard: estimatedValue non-negative
    if (estimatedValue != null && (isNaN(estimatedValue) || Number(estimatedValue) < 0)) {
      return res.status(400).json({ message: 'estimatedValue must be >= 0.' });
    }

    // Strip fields that must not be changed via direct PUT
    // (reservedQuantity is managed only through request status transitions)
    const updateData = { ...req.body };
    delete updateData.reservedQuantity; // immutable via this endpoint

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' }
    );

    // Record movement if quantity changed
    const oldQty = existing.quantity;
    const newQty = updated.quantity;
    if (oldQty !== newQty) {
      await recordMovement({
        inventory:    updated._id,
        movementType: 'adjustment',
        quantityDelta: newQty - oldQty,
        quantityAfter: newQty,
        reservedAfter: updated.reservedQuantity,
        reference:    'manual',
        notes:        `Adjusted from ${oldQty} to ${newQty} ${updated.unit}`,
        performedBy:  req.user._id,
      });
    }

    res.json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── DELETE /api/inventory/:id ─────────────────────────────────────────────────
// B2-Inv-5: Prevents deletion of items with active reservations.
const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });

    // Guard: cannot delete if stock is reserved
    if ((inventory.reservedQuantity || 0) > 0) {
      return res.status(400).json({
        message: `Cannot delete: ${inventory.reservedQuantity} units are currently reserved. Reject or cancel the pending requests first.`,
      });
    }

    // Record deletion before removing the document
    await recordMovement({
      inventory:    inventory._id,
      movementType: 'deletion',
      quantityDelta: -inventory.quantity,
      quantityAfter: 0,
      reservedAfter: 0,
      reference:    'deleted',
      notes:        `Deleted: ${inventory.materialName} (${inventory.quantity} ${inventory.unit})`,
      performedBy:  req.user._id,
    });

    await inventory.deleteOne();
    res.json({ message: 'Inventory removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  getInventory,
  getInventoryById,
  getMovements,
  createInventory,
  updateInventory,
  deleteInventory,
};
