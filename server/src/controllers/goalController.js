import Goal from '../models/Goal.js';
import { isValidObjectId } from '../utils/validationHelpers.js';

/**
 * Get all financial goals for the authenticated user
 * @route GET /api/goals
 */
export const getGoals = async (req, res) => {
  try {
    const userId = req.user._id;
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: {
        goals
      }
    });
  } catch (error) {
    console.error('[Get Goals Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching financial goals.'
    });
  }
};

/**
 * Create a new financial goal
 * @route POST /api/goals
 */
export const createGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, targetAmount, currentAmount = 0, targetDate, category = 'other' } = req.body;

    if (!name || targetAmount === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Goal name and targetAmount are required.'
      });
    }

    const parsedTarget = Number(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'targetAmount must be a positive number greater than 0.'
      });
    }

    const parsedCurrent = Number(currentAmount);
    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'currentAmount cannot be a negative number.'
      });
    }

    const validCategories = ['emergency', 'education', 'travel', 'purchase', 'investment', 'other'];
    const normalizedCategory = String(category).toLowerCase().trim();
    if (!validCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        status: 'error',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    const goal = await Goal.create({
      userId,
      name: String(name).trim(),
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      category: normalizedCategory
    });

    return res.status(201).json({
      status: 'success',
      message: 'Financial goal created successfully.',
      data: {
        goal
      }
    });
  } catch (error) {
    console.error('[Create Goal Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating financial goal.'
    });
  }
};

/**
 * Update a financial goal
 * @route PUT /api/goals/:id
 */
export const updateGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid goal ID format.'
      });
    }

    const { name, targetAmount, currentAmount, targetDate, category } = req.body;

    const updatePayload = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Goal name cannot be empty.'
        });
      }
      updatePayload.name = String(name).trim();
    }

    if (targetAmount !== undefined) {
      const parsedTarget = Number(targetAmount);
      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'targetAmount must be a positive number greater than 0.'
        });
      }
      updatePayload.targetAmount = parsedTarget;
    }

    if (currentAmount !== undefined) {
      const parsedCurrent = Number(currentAmount);
      if (isNaN(parsedCurrent) || parsedCurrent < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'currentAmount cannot be a negative number.'
        });
      }
      updatePayload.currentAmount = parsedCurrent;
    }

    if (targetDate !== undefined) {
      updatePayload.targetDate = targetDate ? new Date(targetDate) : null;
    }

    if (category !== undefined) {
      const validCategories = ['emergency', 'education', 'travel', 'purchase', 'investment', 'other'];
      const normalizedCategory = String(category).toLowerCase().trim();
      if (!validCategories.includes(normalizedCategory)) {
        return res.status(400).json({
          status: 'error',
          message: `Category must be one of: ${validCategories.join(', ')}`
        });
      }
      updatePayload.category = normalizedCategory;
    }

    // Strictly enforce ownership by matching BOTH goal _id AND authenticated userId
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found or unauthorized access.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Financial goal updated successfully.',
      data: {
        goal
      }
    });
  } catch (error) {
    console.error('[Update Goal Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating financial goal.'
    });
  }
};

/**
 * Delete a financial goal
 * @route DELETE /api/goals/:id
 */
export const deleteGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid goal ID format.'
      });
    }

    // Strictly enforce ownership by matching BOTH goal _id AND authenticated userId
    const goal = await Goal.findOneAndDelete({ _id: id, userId });

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found or unauthorized access.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Financial goal deleted successfully.',
      data: {
        id: goal._id
      }
    });
  } catch (error) {
    console.error('[Delete Goal Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error deleting financial goal.'
    });
  }
};

export default {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
