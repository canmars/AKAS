/**
 * Async Handler Middleware
 * Async route handler'ları için hata yakalama wrapper'ı
 */

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

