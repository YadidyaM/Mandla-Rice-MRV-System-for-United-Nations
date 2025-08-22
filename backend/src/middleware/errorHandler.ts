/**
 * Error Handling Middleware for Mandla Rice MRV System
 * Centralized error handling with proper logging and user-friendly responses
 */

import { Request, Response, NextFunction } from 'express';
import { logger, logContext } from '../utils/logger';
import { Prisma } from '@prisma/client';

// Custom error class for application-specific errors
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication errors
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

// Authorization errors
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

// Validation errors
export class ValidationError extends AppError {
  public details?: any;

  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Not found errors
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// Conflict errors
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

// Rate limit errors
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

// External service errors
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message || `External service ${service} is unavailable`, 503, 'EXTERNAL_SERVICE_ERROR');
  }
}

// Handle Prisma errors
const handlePrismaError = (error: any): AppError => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new ConflictError(`Duplicate entry for ${error.meta?.target || 'field'}`);
      case 'P2014':
        return new ValidationError('Invalid data provided');
      case 'P2003':
        return new ValidationError('Foreign key constraint violation');
      case 'P2025':
        return new NotFoundError('Record');
      default:
        return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data format');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database connection failed', 500, 'DATABASE_CONNECTION_ERROR');
  }

  return new AppError('Database error', 500, 'DATABASE_ERROR');
};

// Handle Joi validation errors
const handleJoiError = (error: any): ValidationError => {
  const details = error.details?.map((detail: any) => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));

  return new ValidationError('Validation failed', details);
};

// Handle JWT errors
const handleJWTError = (error: any): AuthenticationError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  return new AuthenticationError('Authentication failed');
};

// Handle Axios errors (for external API calls)
const handleAxiosError = (error: any): ExternalServiceError => {
  const service = error.config?.baseURL || 'External service';
  const message = error.response?.data?.message || error.message || 'Service unavailable';
  return new ExternalServiceError(service, message);
};

// Send error response
const sendErrorResponse = (res: Response, error: AppError, isDevelopment: boolean) => {
  const response: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
    },
  };

  // Add details for validation errors
  if (error instanceof ValidationError && error.details) {
    response.error.details = error.details;
  }

  // Include stack trace in development
  if (isDevelopment && error.stack) {
    response.error.stack = error.stack;
  }

  // Add request ID if available
  if ((res as any).requestId) {
    response.requestId = (res as any).requestId;
  }

  res.status(error.statusCode).json(response);
};

// Main error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  let appError: AppError;

  // Log the original error
  logContext.error(error, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Convert known errors to AppError instances
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name && error.name.includes('Prisma')) {
    appError = handlePrismaError(error);
  } else if (error.isJoi || error.name === 'ValidationError') {
    appError = handleJoiError(error);
  } else if (error.name && error.name.includes('JsonWebToken')) {
    appError = handleJWTError(error);
  } else if (error.isAxiosError) {
    appError = handleAxiosError(error);
  } else if (error.type === 'entity.too.large') {
    appError = new ValidationError('File too large');
  } else if (error.type === 'entity.parse.failed') {
    appError = new ValidationError('Invalid JSON format');
  } else {
    // Unknown error
    appError = new AppError(
      isDevelopment ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }

  sendErrorResponse(res, appError, isDevelopment);
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
};

// Async error wrapper to catch Promise rejections
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error logging for unhandled errors
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
