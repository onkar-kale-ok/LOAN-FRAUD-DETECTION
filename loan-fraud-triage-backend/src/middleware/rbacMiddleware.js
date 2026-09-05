import { ROLES } from '../config/constants.js';

export function readUserRole(req) {
  return String(req.headers['x-user-role'] || '')
    .trim()
    .toUpperCase();
}

/**
 * Requires X-User-Role to match one of the allowed roles (e.g. ANALYST).
 */
export function requireRoles(...allowed) {
  const permitted = allowed.map((role) => String(role).toUpperCase());
  return (req, res, next) => {
    const role = readUserRole(req);
    if (!permitted.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Analyst role required for this action.',
      });
    }
    req.userRole = role;
    return next();
  };
}

export const requireAnalyst = requireRoles(ROLES.ANALYST);

export default { readUserRole, requireRoles, requireAnalyst, ROLES };
