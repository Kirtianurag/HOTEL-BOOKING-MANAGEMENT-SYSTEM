/**
 * Central Error-Handling Middleware - StayEase Hotel Booking Management System
 *
 * Exports:
 *   - AppError   – custom operational error class
 *   - notFound   – 404 catch-all for unmatched routes
 *   - errorHandler – Express error-handling middleware (4-arg signature)
 */

/**
 * AppError – Custom application error.
 *
 * Use this to throw predictable, operational errors with an HTTP status code.
 * The central error handler treats `isOperational = true` errors as safe to
 * relay to the client, while non-operational errors get a generic 500.
 */
export class AppError extends Error {
  /**
   * @param {string} message   Human-readable error description.
   * @param {number} statusCode  HTTP status code (default 500).
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture a clean stack trace (excluding the constructor frame)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * notFound – 404 handler for routes that don't match any defined endpoint.
 *
 * Mount this AFTER all route definitions but BEFORE the errorHandler.
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Not found – ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

/**
 * errorHandler – Central Express error-handling middleware.
 *
 * Normalizes various error types (Mongoose, JWT, custom) into a
 * consistent JSON response: { success: false, message, errors? }
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose ValidationError (field-level validation failures) ──
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose CastError (e.g. invalid ObjectId) ──
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── MongoDB duplicate key error ──
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value for field(s): ${duplicateField}. Please use another value.`;
  }

  // ── JWT errors ──
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token – authorization denied';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired – please log in again';
  }

  // ── Log in development mode ──
  if (process.env.NODE_ENV === 'development') {
    console.error('──── ERROR ────');
    console.error('Status:', statusCode);
    console.error('Message:', message);
    if (errors) console.error('Details:', JSON.stringify(errors, null, 2));
    console.error('Stack:', err.stack);
    console.error('───────────────');
  }

  // ── Build response payload ──
  const payload = {
    success: false,
    message,
  };

  if (errors) {
    payload.errors = errors;
  }

  // In development, include the stack trace for debugging convenience
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

export default AppError;
