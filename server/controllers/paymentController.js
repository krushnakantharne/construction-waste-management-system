const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/authMiddleware');

const STAFF_ROLES = ['admin', 'siteManager', 'recycler'];
const isStaff = role => STAFF_ROLES.includes(role);

// GET /api/payments - list
const getPayments = async (req, res) => {
  try {
    const filter = isStaff(req.user.role) ? {} : { 'invoice.customer': req.user._id };
    // populate nested invoice.customer
    const payments = await Payment.find(filter)
      .populate({ path: 'invoice', populate: { path: 'customer', select: 'name email' } })
      .populate('invoice');
    // filter by ownership for customers
    const result = payments.filter(p => isStaff(req.user.role) || p.invoice.customer._id.toString() === req.user._id.toString());
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/:id - detail
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('invoice');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    // ownership check
    const invoice = await Invoice.findById(payment.invoice._id);
    if (!isStaff(req.user.role) && invoice.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments - create payment
const createPayment = async (req, res) => {
  try {
    const { invoiceId, amount, method } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    // ownership check
    if (!isStaff(req.user.role) && invoice.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay this invoice' });
    }
    // compute total paid so far
    const payments = await Payment.find({ invoice: invoiceId });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid + amount > invoice.amount) {
      return res.status(400).json({ message: 'Payment exceeds invoice amount' });
    }
    const payment = await Payment.create({ invoice: invoiceId, amount, method });
    // update invoice paid flag if fully paid
    if (totalPaid + amount === invoice.amount) {
      invoice.paid = true;
      await invoice.save();
    }
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPayments, getPaymentById, createPayment };
