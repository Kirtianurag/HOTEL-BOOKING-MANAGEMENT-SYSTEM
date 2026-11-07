import mongoose from 'mongoose';

/**
 * RateRule
 *
 * Allows dynamic pricing overrides for a given room type within a date range.
 * When calculating the nightly rate, the system should check for an active
 * RateRule that covers the stay date before falling back to the RoomType's
 * baseRate.
 */
const rateRuleSchema = new mongoose.Schema(
  {
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    nightlyRate: {
      type: Number,
      required: [true, 'Nightly rate is required'],
      min: [0, 'Nightly rate cannot be negative'],
    },
    name: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficiently querying rate rules by room type and date range
rateRuleSchema.index({ roomType: 1, startDate: 1, endDate: 1 });

const RateRule = mongoose.model('RateRule', rateRuleSchema);

export default RateRule;
