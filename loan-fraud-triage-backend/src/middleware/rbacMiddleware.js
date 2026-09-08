import { ROLES } from '../config/constants.js';

export function readUserRole(req) {
  return String(req.headers['x-user-role'] || '')
    .trim()
    .toUpperCase();
}

/**
 * Requires X-User-Role to match one of the allowed roles.
 */
export function requireRoles(...allowed) {
  const permitted = allowed.map((role) => String(role).toUpperCase());
  return (req, res, next) => {
    const role = readUserRole(req);
    if (!role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: header X-User-Role is required (${permitted.join(' or ')}).`,
      });
    }
    if (!permitted.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires ${permitted.join(' or ')}.`,
      });
    }
    req.userRole = role;
    return next();
  };
}

/** Any simulated reviewer: ANALYST or GUEST (read + evaluate presets). */
export const requireReviewer = requireRoles(ROLES.ANALYST, ROLES.GUEST);

/** Writes that change risk decisions or chat. */
export const requireAnalyst = requireRoles(ROLES.ANALYST);

export default { readUserRole, requireRoles, requireAnalyst, requireReviewer, ROLES };
