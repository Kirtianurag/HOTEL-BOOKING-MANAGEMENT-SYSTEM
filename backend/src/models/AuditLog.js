import mongoose from 'mongoose';

/**
 * AuditLog
 *
 * Immutable record of significant actions performed in the system.
 * Stores the previous and new values so changes can be reviewed or rolled back.
 */
const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userRole: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      index: true,
    },
    entityType: {
      type: String,
      trim: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.Mixed,
    },
    previousValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Recent-first retrieval of audit logs
auditLogSchema.index({ createdAt: -1 });

// Compound index for filtering by action + entity type
auditLogSchema.index({ action: 1, entityType: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
