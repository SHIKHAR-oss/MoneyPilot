import FinancialProfile from '../models/FinancialProfile.js';

/**
 * Get authenticated user's financial profile
 * @route GET /api/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    let profile = await FinancialProfile.findOne({ userId });

    if (!profile) {
      // Return a clean uninitialized baseline profile if user hasn't set one yet
      return res.status(200).json({
        status: 'success',
        data: {
          profile: {
            userId,
            monthlyIncome: 0,
            currentSavings: 0,
            emergencyFund: 0,
            riskProfile: 'moderate',
            isConfigured: false
          }
        }
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        profile: {
          ...profile.toJSON(),
          isConfigured: true
        }
      }
    });
  } catch (error) {
    console.error('[Get Profile Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error fetching financial profile.'
    });
  }
};

/**
 * Create or update authenticated user's financial profile
 * @route PUT /api/profile
 * @route POST /api/profile
 */
export const upsertProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { monthlyIncome, currentSavings, emergencyFund, riskProfile } = req.body;

    const updatePayload = {};

    if (monthlyIncome !== undefined) {
      const incomeNum = Number(monthlyIncome);
      if (isNaN(incomeNum) || incomeNum < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'monthlyIncome must be a non-negative number.'
        });
      }
      updatePayload.monthlyIncome = incomeNum;
    }

    if (currentSavings !== undefined) {
      const savingsNum = Number(currentSavings);
      if (isNaN(savingsNum) || savingsNum < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'currentSavings must be a non-negative number.'
        });
      }
      updatePayload.currentSavings = savingsNum;
    }

    if (emergencyFund !== undefined) {
      const emergencyNum = Number(emergencyFund);
      if (isNaN(emergencyNum) || emergencyNum < 0) {
        return res.status(400).json({
          status: 'error',
          message: 'emergencyFund must be a non-negative number.'
        });
      }
      updatePayload.emergencyFund = emergencyNum;
    }

    if (riskProfile !== undefined) {
      const normalizedRisk = String(riskProfile).toLowerCase().trim();
      if (!['conservative', 'moderate', 'aggressive'].includes(normalizedRisk)) {
        return res.status(400).json({
          status: 'error',
          message: 'riskProfile must be one of: conservative, moderate, aggressive.'
        });
      }
      updatePayload.riskProfile = normalizedRisk;
    }

    // Atomic upsert strictly bound to authenticated userId
    const profile = await FinancialProfile.findOneAndUpdate(
      { userId },
      { $set: updatePayload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Financial profile saved successfully.',
      data: {
        profile: {
          ...profile.toJSON(),
          isConfigured: true
        }
      }
    });
  } catch (error) {
    console.error('[Upsert Profile Error]:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating financial profile.'
    });
  }
};

export default {
  getProfile,
  upsertProfile
};
