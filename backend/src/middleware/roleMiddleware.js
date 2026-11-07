/**
 * Role-Based Authorization Middleware - StayEase Hotel Booking Management System
 *
 * Must be used AFTER the `protect` middleware so that `req.user` is populated.
 */

/**
 * authorize – Higher-order middleware that restricts access to specific roles.
 *
 * @param  {...string} roles  One or more allowed role names (e.g. 'admin', 'staff', 'guest').
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.get('/admin-only', protect, authorize('admin'), handler);
 *   router.get('/staff-or-admin', protect, authorize('admin', 'staff'), handler);
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Safety check – protect middleware should have run first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – authentication required',
      });
    }

    // Check if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden – role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
