const Invoice = require('../models/Invoice');
const { protect } = require('../middleware/authMiddleware');
const STAFF_ROLES = ['admin', 'siteManager', 'recycler'];
const isStaff = (role) => STAFF_ROLES.includes(role);

// GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const filter = isStaff(req.user.role) ? {} : { customer: req.user._id };
    const invoices = await Invoice.find(filter)
      .populate('request', 'material quantity')
      .populate('customer', 'name email');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('request', 'material quantity')
      .populate('customer', 'name email');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (!isStaff(req.user.role) && invoice.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getInvoices, getInvoiceById };
