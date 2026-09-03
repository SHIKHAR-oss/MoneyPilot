import mongoose from 'mongoose';

const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    monthlyIncome: {
      type: Number,
      required: [true, 'Monthly income is required'],
      min: [0, 'Monthly income cannot be negative'],
      default: 0
    },
    currentSavings: {
      type: Number,
      required: [true, 'Current savings is required'],
      min: [0, 'Current savings cannot be negative'],
      default: 0
    },
    emergencyFund: {
      type: Number,
      required: [true, 'Emergency fund is required'],
      min: [0, 'Emergency fund cannot be negative'],
      default: 0
    },
    riskProfile: {
      type: String,
      enum: {
        values: ['conservative', 'moderate', 'aggressive'],
        message: '{VALUE} is not a valid risk profile'
      },
      default: 'moderate',
      lowercase: true,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

const FinancialProfile = mongoose.model('FinancialProfile', financialProfileSchema);

export default FinancialProfile;
