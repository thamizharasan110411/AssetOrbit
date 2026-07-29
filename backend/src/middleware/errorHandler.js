import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Something went wrong';

  if (error.code === '23505') {
    statusCode = 409;
    message = 'A record with the same unique value already exists.';
  }

  if (error.code === '23514') {
    statusCode = 400;
    message = 'One or more values failed validation.';
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token.';
  }

  res.status(statusCode).json({
    message,
    details: error.details,
    stack: env.nodeEnv === 'development' ? error.stack : undefined
  });
}
