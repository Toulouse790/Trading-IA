/**
 * Health Controller
 * Endpoint de santé pour monitoring
 */

import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../services/database';
import type { ApiResponse } from '../types';

/**
 * GET /health
 * Retourne le statut de l'API et de la base de données
 */
export async function getHealth(req: Request, res: Response): Promise<void> {
  const dbConnected = await checkDatabaseConnection();

  const response: ApiResponse<{
    status: string;
    timestamp: string;
    database: string;
    uptime: number;
  }> = {
    success: true,
    data: {
      status: dbConnected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    },
  };

  res.status(dbConnected ? 200 : 503).json(response);
}
