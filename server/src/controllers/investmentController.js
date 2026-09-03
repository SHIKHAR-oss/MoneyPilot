import Investment from '../models/Investment.js';
import { isValidObjectId } from '../utils/validationHelpers.js';

/**
 * Get all investments for the authenticated user
 * @route GET /api/investments
 */
export const getInvestments = async (req, res) => {
  try {
    const userId = req.user._id;
    const investments = await Investment.find({ userId }).sort({ currentValue: -1 });

    return res.status(200).json({
      status: 'success',
      data: {
        investments
      }
    });
  } catch (error) {
    console.error('[Get Investments Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching investments.'
    });
  }
};

/**
 * Create a new investment
 * @route POST /api/investments
 */
export const createInvestment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, type, currentValue = 0, monthlyContribution = 0 } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Investment name and type are required.'
      });
    }

    const parsedValue = Number(currentValue);
    if (isNaN(parsedValue) || parsedValue < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'currentValue cannot be a negative number.'
      });
    }

    const parsedMonthly = Number(monthlyContribution);
    if (isNaN(parsedMonthly) || parsedMonthly < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'monthlyContribution cannot be a negative number.'
      });
    }

    const investment = await Investment.create({
      userId,
      name: String(name).trim(),
      type: String(type).trim(),
      currentValue: parsedValue,
      monthlyContribution: parsedMonthly
    });

    return res.status(201).json({
      status: 'success',
      message: 'Investment record created successfully.',
      data: {
        investment
      }
    });
  } catch (error) {
    console.error('[Create Investment Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating investment record.'
    });
  }
};

/**
 * Update an investment
 * @route PUT /api/investments/:id
 */
export const updateInvestment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid investment ID format.'
      });
    }

    const { name, type, currentValue, monthlyContribution } = req.body;

    const updatePayload = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Investment name cannot be empty.'
        });
      }
      updatePayload.name = String(name).trim();
    }

    if (type !== undefined) {
      if (!String(type).trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Investment type cannot be empty.'
        });
      }
      updatePayload.type = String(type).trim();
    }

    if (currentValue !== undefined) {
      const parsedValue = Number(currentValue);
      if (isNaN(parsedValue) || parsedValue < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'currentValue cannot be a negative number.'
        });
      }
      updatePayload.currentValue = parsedValue;
    }

    if (monthlyContribution !== undefined) {
      const parsedMonthly = Number(monthlyContribution);
      if (isNaN(parsedMonthly) || parsedMonthly < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'monthlyContribution cannot be a negative number.'
        });
      }
      updatePayload.monthlyContribution = parsedMonthly;
    }

    // Strictly enforce ownership by matching BOTH investment _id AND authenticated userId
    const investment = await Investment.findOneAndUpdate(
      { _id: id, userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment record not found or unauthorized access.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Investment record updated successfully.',
      data: {
        investment
      }
    });
  } catch (error) {
    console.error('[Update Investment Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating investment record.'
    });
  }
};

/**
 * Delete an investment
 * @route DELETE /api/investments/:id
 */
export const deleteInvestment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid investment ID format.'
      });
    }

    // Strictly enforce ownership by matching BOTH investment _id AND authenticated userId
    const investment = await Investment.findOneAndDelete({ _id: id, userId });

    if (!investment) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment record not found or unauthorized access.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Investment record deleted successfully.',
      data: {
        id: investment._id
      }
    });
  } catch (error) {
    console.error('[Delete Investment Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error deleting investment record.'
    });
  }
};

export default {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment
};
