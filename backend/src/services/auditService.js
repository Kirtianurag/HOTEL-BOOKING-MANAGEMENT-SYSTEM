/**
 * Audit Service - StayEase Hotel Booking Management System
 *
 * Creates immutable audit log entries for every significant action.
 * Errors are caught silently so that auditing never disrupts the main
 * application flow.
 */

import AuditLog from '../models/AuditLog.js';

/**
 * Create an audit log document.
 *
 * @param {Object} params
 * @param {import('mongoose').Types.ObjectId|string} params.userId        Who performed the action.
 * @param {string}  params.userRole       Role of the acting user (e.g. 'admin', 'guest').
 * @param {string}  params.action         Action identifier (e.g. 'RESERVATION_CREATED').
 * @param {string}  params.entityType     Type of entity affected (e.g. 'Reservation', 'Room').
 * @param {import('mongoose').Types.ObjectId|string} params.entityId      ID of the affected entity.
 * @param {Object}  [params.previousValues]  Snapshot of the entity before the change.
 * @param {Object}  [params.newValues]       Snapshot of the entity after the change.
 * @param {string}  [params.ipAddress]       Client IP address.
 * @param {string}  [params.userAgent]       Client User-Agent string.
 * @returns {Promise<Object|null>} The created audit log document, or null on failure.
 */
export const createAuditLog = async ({
  userId,
  userRole,
  action,
  entityType,
  entityId,
  previousValues,
  newValues,
  ipAddress,
  userAgent,
}) => {
  try {
    const log = await AuditLog.create({
      userId,
      userRole,
      action,
      entityType,
      entityId,
      previousValues,
      newValues,
      ipAddress,
      userAgent,
    });

    return log;
  } catch (error) {
    // Audit logging must NEVER break the main application flow
    console.error('[AuditService] Failed to create audit log:', error.message);
    return null;
  }
};

export default {
  createAuditLog,
};
