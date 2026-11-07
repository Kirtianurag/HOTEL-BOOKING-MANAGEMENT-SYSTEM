import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: [true, 'Booking reference is required'],
      unique: true,
      index: true,
      trim: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guest is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'There must be at least 1 guest'],
    },
    numberOfNights: {
      type: Number,
      required: [true, 'Number of nights is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['HOLD', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT'],
        message: '{VALUE} is not a valid reservation status',
      },
      default: 'HOLD',
    },

    // ---- Pricing breakdown ----
    pricing: {
      nightlyRate: { type: Number },
      subtotal: { type: Number },
      taxRate: { type: Number, default: 0.12 },
      taxAmount: { type: Number },
      totalAmount: { type: Number },
    },

    // ---- Guest details snapshot (denormalised for invoicing / history) ----
    guestDetails: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      specialRequests: { type: String, trim: true },
    },

    // ---- Payment information ----
    payment: {
      method: { type: String, default: 'simulated' },
      status: {
        type: String,
        enum: {
          values: ['pending', 'completed', 'refunded'],
          message: '{VALUE} is not a valid payment status',
        },
        default: 'pending',
      },
      transactionId: { type: String },
      paidAt: { type: Date },
    },

    // ---- Lifecycle timestamps & metadata ----
    holdExpiresAt: { type: Date },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
    checkedInAt: { type: Date },
    checkedOutAt: { type: Date },
    cancelReason: { type: String, trim: true },

    /**
     * Idempotency key – ensures a client cannot accidentally create duplicate
     * reservations when retrying a request. The sparse option means documents
     * without this field are not included in the unique constraint.
     */
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query & lookup patterns
reservationSchema.index({ guest: 1 });
reservationSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ holdExpiresAt: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

export default Reservation;
