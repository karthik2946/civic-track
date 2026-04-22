import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  status?: number;
  details?: unknown;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${status}] ${message}`, err.details);

  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined,
    },
  });
};
