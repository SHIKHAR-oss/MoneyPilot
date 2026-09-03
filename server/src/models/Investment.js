import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Investment name is required'],
      trim: true,
      maxlength: [100, 'Investment name cannot exceed 100 characters']
    },
    type: {
      type: String,
      required: [true, 'Investment type is required'],
      trim: true,
      maxlength: [50, 'Investment type cannot exceed 50 characters']
    },
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
      min: [0, 'Current value cannot be negative'],
      default: 0
    },
    monthlyContribution: {
      type: Number,
      min: [0, 'Monthly contribution cannot be negative'],
      default: 0
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

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
