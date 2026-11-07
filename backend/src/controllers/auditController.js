import AuditLog from '../models/AuditLog.js';

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get audit logs with filtering and pagination
 * @route   GET /api/audit
 * @access  Private/Admin
 */
export const getAuditLogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.action) {
    filter.action = req.query.action;
  }

  if (req.query.entityType) {
    filter.entityType = req.query.entityType;
  }

  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) {
      filter.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  if (req.query.search) {
    filter.description = { $regex: req.query.search, $options: 'i' };
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});
