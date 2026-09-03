import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0.01, 'Target amount must be greater than 0']
    },
    currentAmount: {
      type: Number,
      min: [0, 'Current amount cannot be negative'],
      default: 0
    },
    targetDate: {
      type: Date
    },
    category: {
      type: String,
      enum: {
        values: ['emergency', 'education', 'travel', 'purchase', 'investment', 'other'],
        message: '{VALUE} is not a supported goal category'
      },
      default: 'other',
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

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
