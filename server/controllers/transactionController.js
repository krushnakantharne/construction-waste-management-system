const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).populate('project', 'name');
    res.json(transactions);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({ ...req.body, createdBy: req.user._id });
    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (transaction) res.json(transaction);
    else res.status(404).json({ message: 'Transaction not found' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction) {
      await transaction.deleteOne();
      res.json({ message: 'Transaction removed' });
    } else { res.status(404).json({ message: 'Transaction not found' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
