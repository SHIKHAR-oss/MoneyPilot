import Transaction from '../models/Transaction.js';
import { isValidObjectId } from '../utils/validationHelpers.js';

/**
 * Get all transactions for the authenticated user
 * @route GET /api/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, category, limit = 50, page = 1 } = req.query;

    const query = { userId };
    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }
    if (category) {
      query.category = category;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('[Get Transactions Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching transactions.'
    });
  }
};

/**
 * Create a new transaction
 * @route POST /api/transactions
 */
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, amount, category, description, date } = req.body;

    if (!type || amount === undefined || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction type, amount, and category are required.'
      });
    }

    const normalizedType = String(type).toLowerCase().trim();
    if (!['income', 'expense'].includes(normalizedType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction type must be either "income" or "expense".'
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Transaction amount must be a positive number greater than 0.'
      });
    }

    const transaction = await Transaction.create({
      userId,
      type: normalizedType,
      amount: parsedAmount,
      category: String(category).trim(),
      description: description ? String(description).trim() : '',
      date: date ? new Date(date) : new Date()
    });

    return res.status(201).json({
      status: 'success',
      message: 'Transaction created successfully.',
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('[Create Transaction Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating transaction.'
    });
  }
};

/**
 * Update a transaction
 * @route PUT /api/transactions/:id
 */
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid transaction ID format.'
      });
    }

    const { type, amount, category, description, date } = req.body;

    const updatePayload = {};

    if (type !== undefined) {
      const normalizedType = String(type).toLowerCase().trim();
      if (!['income', 'expense'].includes(normalizedType)) {
        return res.status(400).json({
          status: 'error',
          message: 'Transaction type must be either "income" or "expense".'
        });
      }
      updatePayload.type = normalizedType;
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Transaction amount must be a positive number greater than 0.'
        });
      }
      updatePayload.amount = parsedAmount;
    }

    if (category !== undefined) {
      if (!String(category).trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Category cannot be empty.'
        });
      }
      updatePayload.category = String(category).trim();
    }

    if (description !== undefined) {
      updatePayload.description = String(description).trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format.'
        });
      }
      updatePayload.date = parsedDate;
    }

    // Strictly enforce ownership by matching BOTH transaction _id AND authenticated userId
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found or unauthorized access.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Transaction updated successfully.',
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error('[Update Transaction Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating transaction.'
    });
  }
};

/**
 * Delete a transaction
 * @route DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid transaction ID format.'
      });
    }

    // Strictly enforce ownership by matching BOTH transaction _id AND authenticated userId
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found or unauthorized access.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Transaction deleted successfully.',
      data: {
        id: transaction._id
      }
    });
  } catch (error) {
    console.error('[Delete Transaction Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error deleting transaction.'
    });
  }
};

export default {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
