const mongoose = require('mongoose');
const Request = require('../models/Request');
const Inventory = require('../models/Inventory');
require('../models/Project');
require('../models/User');

// ── Role helpers ───────────────────────────────────────────────────────────────
const STAFF_ROLES = ['admin', 'siteManager', 'recycler'];
const isStaff = (role) => STAFF_ROLES.includes(role);

// ── GET /api/requests ─────────────────────────────────────────────────────────
// B5: Customers only see their own requests; staff see all (with optional filter).
const getRequests = async (req, res) => {
  try {
    let query = {};

    // Status filter (available to all roles)
    if (req.query.status) query.status = req.query.status;

    // B5: Scope to own records for customer role
    if (!isStaff(req.user.role)) {
      query.customer = req.user._id;
    }

    const requests = await Request.find(query)
      .populate('customer', 'name email')
      .populate('sourceProject', 'name')
      .populate('inventory', 'materialName unit estimatedValue')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── GET /api/requests/:id ─────────────────────────────────────────────────────
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('sourceProject', 'name')
      .populate('inventory', 'materialName unit estimatedValue');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // B5: Customers may only access their own request
    if (!isStaff(req.user.role) && request.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this request' });
    }

    res.json(request);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── POST /api/requests ────────────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const bodyData = { ...req.body, customer: req.user?._id };

    if (bodyData.sourceProject && !mongoose.Types.ObjectId.isValid(bodyData.sourceProject)) {
      delete bodyData.sourceProject;
    }
    if (bodyData.inventory && !mongoose.Types.ObjectId.isValid(bodyData.inventory)) {
      delete bodyData.inventory;
    }

    const request = new Request(bodyData);
    const createdRequest = await request.save();
    res.status(201).json(createdRequest);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ── PUT /api/requests/:id/status (staff only, enforced at route level) ────────
//
// B3: Idempotency – re-approving an already-approved request is rejected.
// B4: Rejection/cancellation restores reservedQuantity (not quantity – the stock
//     was reserved, not yet deducted).
// B14: Atomic stock reservation via findOneAndUpdate with a conditional filter,
//      so concurrent approvals cannot double-reserve.
//
// Stock lifecycle:
//   Pending → Approved   : inventory.reservedQuantity += req.quantity  (atomic)
//   Approved → Processing: no inventory change
//   Processing → Completed: inventory.quantity -= req.quantity,
//                            inventory.reservedQuantity -= req.quantity (fulfill)
//   Any → Rejected/Cancelled: inventory.reservedQuantity -= req.quantity (release)
//
// NOTE: The existing codebase deducted inventory.quantity immediately at Approve.
// Historical requests that were already Approved before this fix will have had
// their quantity deducted already. We do NOT retroactively restore those records.
// This fix only applies to NEW status transitions going forward.
// ── Module-level replica-set detection cache ─────────────────────────────────
// Populated lazily on first updateRequestStatus call. Avoids repeated DB admin
// commands. undefined = not yet probed, true/false = result cached.
let _isReplicaSet;
async function detectReplicaSet() {
  if (_isReplicaSet !== undefined) return _isReplicaSet;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    _isReplicaSet = !!hello.setName;
  } catch {
    _isReplicaSet = false;
  }
  return _isReplicaSet;
}

const updateRequestStatus = async (req, res) => {
  // Use a session for multi-document atomicity where replica sets are available.
  // Standalone MongoDB does not support transactions; we detect this once and
  // fall back gracefully. B14 atomicity is still guaranteed on standalone via
  // the conditional findOneAndUpdate filter (no TOCTOU window).
  const replicaSet = await detectReplicaSet();
  let session = null;
  let useTransaction = false;
  if (replicaSet) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch {
      if (session) { session.endSession().catch(() => {}); }
      session = null;
      useTransaction = false;
    }
  }

  try {
    const sessionOpt = useTransaction ? { session } : {};

    const request = await Request.findById(req.params.id).session(session);
    if (!request) {
      if (useTransaction) await session.abortTransaction();
      return res.status(404).json({ message: 'Request not found' });
    }

    const { status, inventoryId } = req.body;

    // ── B3: Idempotency guard ────────────────────────────────────────────────
    if (request.status === status) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({
        message: `Request is already in status '${status}'. No change made.`,
      });
    }

    // Prevent backward / invalid transitions
    const VALID_TRANSITIONS = {
      Pending:    ['Approved', 'Rejected'],
      Approved:   ['Processing', 'Rejected'],
      Processing: ['Completed', 'Rejected'],
      Completed:  [],       // terminal
      Rejected:   [],       // terminal
      Cancelled:  [],       // terminal
    };

    const allowed = VALID_TRANSITIONS[request.status] || [];
    if (!allowed.includes(status)) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot transition from '${request.status}' to '${status}'.`,
      });
    }

    // ── Approved: reserve stock (B14 atomic) ─────────────────────────────────
    if (status === 'Approved') {
      const targetInventoryId = inventoryId || request.inventory;
      if (!targetInventoryId || !mongoose.Types.ObjectId.isValid(String(targetInventoryId))) {
        if (useTransaction) await session.abortTransaction();
        return res.status(400).json({ message: 'A valid inventoryId is required to approve a request.' });
      }

      // B14: Single atomic update with a filter that ensures sufficient
      // unreserved stock. If two concurrent approvals race, only one will
      // satisfy the filter; the second gets null back and is rejected.
      const updatedInventory = await Inventory.findOneAndUpdate(
        {
          _id: targetInventoryId,
          status: 'Available',
          // availableQty = quantity - reservedQuantity >= request.quantity
          $expr: {
            $gte: [
              { $subtract: ['$quantity', { $ifNull: ['$reservedQuantity', 0] }] },
              request.quantity,
            ],
          },
        },
        { $inc: { reservedQuantity: request.quantity } },
        { returnDocument: 'after', ...sessionOpt }
      );

      if (!updatedInventory) {
        if (useTransaction) await session.abortTransaction();
        return res.status(400).json({
          message: 'Insufficient available stock or inventory item not found.',
        });
      }

      request.inventory = updatedInventory._id;
    }

    // ── Completed: fulfill reservation (deduct actual stock) ─────────────────
    if (status === 'Completed' && request.inventory) {
      await Inventory.findByIdAndUpdate(
        request.inventory,
        {
          $inc: {
            quantity: -request.quantity,
            reservedQuantity: -request.quantity,
          },
        },
        { ...sessionOpt }
      );

      // Mark inventory as Used/Sold if quantity reaches zero
      const inv = await Inventory.findById(request.inventory).session(session);
      if (inv && inv.quantity <= 0) {
        inv.quantity = 0;
        inv.status = 'Sold';
        await inv.save(sessionOpt);
      }
    }

    // ── B4: Rejected / Cancelled: release reservation ────────────────────────
    // Only release if the request was already in Approved/Processing state
    // (meaning a reservation was actually placed by this system).
    if ((status === 'Rejected' || status === 'Cancelled') &&
        (request.status === 'Approved' || request.status === 'Processing') &&
        request.inventory) {
      await Inventory.findByIdAndUpdate(
        request.inventory,
        { $inc: { reservedQuantity: -request.quantity } },
        { ...sessionOpt }
      );
    }

    request.status = status;
    if (status === 'Rejected' || status === 'Cancelled') {
      request.cancelledAt = new Date();
    }

    const updatedRequest = await request.save(sessionOpt);

    if (useTransaction) await session.commitTransaction();

    res.json(updatedRequest);
  } catch (error) {
    if (useTransaction) await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    if (useTransaction) session.endSession();
  }
};

module.exports = { getRequests, getRequestById, createRequest, updateRequestStatus };
