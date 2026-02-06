/**
 * Global Error Handler Middleware
 * Gère toutes les erreurs de l'API
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import type { ApiResponse } from '../types';

// Types d'erreurs personnalisées
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Middleware de gestion des erreurs
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log l'erreur
  if (config.isDev) {
    console.error('❌ Error:', err);
  } else {
    console.error('❌ Error:', err.message);
  }

  // Erreur Zod (validation)
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      message: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
    res.status(400).json(response);
    return;
  }

  // Erreur applicative
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Erreur Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    const response: ApiResponse = {
      success: false,
      error: 'Database error',
      message: config.isDev ? err.message : 'A database error occurred',
    };
    res.status(400).json(response);
    return;
  }

  // Erreur inconnue
  const response: ApiResponse = {
    success: false,
    error: 'Internal server error',
    message: config.isDev ? err.message : 'An unexpected error occurred',
  };
  res.status(500).json(response);
}

/**
 * Middleware pour les routes non trouvées
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(response);
}
