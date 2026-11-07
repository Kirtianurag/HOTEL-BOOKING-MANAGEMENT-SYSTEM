/**
 * Authentication Middleware - StayEase Hotel Booking Management System
 *
 * Provides JWT-based authentication via cookies or Authorization header.
 * - `protect`      – requires a valid token; 401 if missing / invalid.
 * - `optionalAuth` – attaches user when a token is present, otherwise req.user = null.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

/**
 * Extracts the JWT from either the 'token' cookie or the Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractToken = (req) => {
  // 1. Try cookie first
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // 2. Fall back to Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

/**
 * protect – Mandatory authentication guard.
 *
 * Verifies the JWT, loads the user document (minus password), and attaches
 * it to `req.user`. Responds with 401 if the token is missing, invalid,
 * expired, or the user no longer exists / is deactivated.
 */
export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Find the user and exclude the password field
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – user no longer exists',
      });
    }

    // Ensure the account is still active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – account is deactivated',
      });
    }

    // Attach user to the request for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors with friendly messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized – token has expired',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }
};

/**
 * optionalAuth – Soft authentication.
 *
 * Behaves exactly like `protect` when a valid token is present, but does
 * NOT return an error when the token is missing or invalid. Instead it
 * sets `req.user = null` so downstream handlers can branch accordingly.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    req.user = user && user.isActive ? user : null;
    next();
  } catch {
    // Token invalid / expired – silently continue without a user
    req.user = null;
    next();
  }
};
