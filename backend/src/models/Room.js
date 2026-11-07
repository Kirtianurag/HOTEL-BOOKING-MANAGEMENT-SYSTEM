import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Room type is required'],
    },
    floor: {
      type: Number,
      required: [true, 'Floor is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'cleaning', 'maintenance', 'inactive'],
        message: '{VALUE} is not a valid room status',
      },
      default: 'available',
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

// Indexes for common query patterns
roomSchema.index({ roomType: 1, status: 1 });
roomSchema.index({ status: 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
