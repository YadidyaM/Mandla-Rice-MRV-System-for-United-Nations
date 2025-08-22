import { Request, Response, NextFunction } from 'express';
import { Sentry } from '../config/sentry';

/**
 * Sentry request handler middleware
 * This should be added before your routes
 */
export const sentryRequestHandler = Sentry.requestHandler();

/**
 * Sentry tracing handler middleware
 * This should be added before your routes for performance monitoring
 */
export const sentryTracingHandler = Sentry.tracingHandler();

/**
 * Sentry error handler middleware
 * This should be added after your routes but before other error handlers
 */
export const sentryErrorHandler = Sentry.errorHandler();

/**
 * Custom error handler that integrates with Sentry
 */
export const sentryCustomErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Capture the error in Sentry
  Sentry.captureException(err, {
    extra: {
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: (req as any).user?.id,
    },
  });

  // Set the Sentry event ID in the response
  (res as any).sentry = Sentry.lastEventId();

  // Pass to the next error handler
  next(err);
};

/**
 * Test endpoint to verify Sentry is working
 */
export const testSentryEndpoint = (req: Request, res: Response) => {
  try {
    throw new Error('Test Sentry Error - This is intentional for testing purposes');
  } catch (error) {
    Sentry.captureException(error as Error);
    res.status(500).json({
      error: 'Test error captured by Sentry',
      sentryId: Sentry.lastEventId(),
      message: 'Check your Sentry dashboard for this error',
    });
  }
};
