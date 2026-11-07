import mongoose from 'mongoose';

/**
 * RoomNightLock
 * 
 * Each document represents a single room-night that is locked (held or
 * confirmed) for a reservation. The unique compound index on { room, stayDate }
 * is the **primary mechanism** that prevents double-booking: MongoDB will reject
 * any insert that duplicates an existing room + stayDate pair.
 *
 * The TTL index on expiresAt provides supplementary automatic cleanup for
 * locks that were never confirmed (e.g. abandoned holds).
 */
const roomNightLockSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room reference is required'],
    },
    stayDate: {
      type: Date,
      required: [true, 'Stay date is required'],
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: [true, 'Reservation reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['hold', 'confirmed'],
        message: '{VALUE} is not a valid lock status',
      },
      default: 'hold',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Unique compound index prevents double-booking a room on the same night
roomNightLockSchema.index({ room: 1, stayDate: 1 }, { unique: true });

// TTL index – MongoDB automatically removes documents once expiresAt has passed
roomNightLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Lookup all locks belonging to a given reservation
roomNightLockSchema.index({ reservation: 1 });

const RoomNightLock = mongoose.model('RoomNightLock', roomNightLockSchema);

export default RoomNightLock;
