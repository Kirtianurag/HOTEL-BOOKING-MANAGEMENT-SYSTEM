/**
 * Validation Middleware - StayEase Hotel Booking Management System
 *
 * Wraps express-validator validation chains so they can be applied as a
 * single middleware array. If any validation fails, responds with 400.
 */

import { validationResult } from 'express-validator';

/**
 * validate – Runs an array of express-validator validation chains and, if
 * any produce errors, returns a 400 response with structured error details.
 *
 * @param {import('express-validator').ValidationChain[]} validations
 *   Array of express-validator validation chains to execute.
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   import { body } from 'express-validator';
 *   import { validate } from '../middleware/validateMiddleware.js';
 *
 *   router.post(
 *     '/rooms',
 *     validate([
 *       body('roomNumber').notEmpty().withMessage('Room number is required'),
 *       body('floor').isInt({ min: 1 }).withMessage('Floor must be >= 1'),
 *     ]),
 *     roomController.createRoom,
 *   );
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run every validation chain sequentially
    for (const validation of validations) {
      await validation.run(req);
    }

    // Collect results
    const result = validationResult(req);

    if (result.isEmpty()) {
      return next();
    }

    // Map errors to a clean shape
    const errors = result.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  };
};
