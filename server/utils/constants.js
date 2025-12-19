/**
 * Constants
 * Backend sabitleri
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export const RISK_SEVIYELERI = {
  DUSUK: { min: 0, max: 30 },
  ORTA: { min: 31, max: 50 },
  YUKSEK: { min: 51, max: 70 },
  KRITIK: { min: 71, max: 100 }
};

