/**
 * Error Handler Middleware
 * Tüm hataları yakalar ve uygun formatta döndürür
 */

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase hataları
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null
      }
    });
  }

  // Validation hataları
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation Error',
        details: err.message
      }
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

