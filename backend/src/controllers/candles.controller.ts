/**
 * Candles Controller
 * Gestion des données OHLCV
 */

import { Request, Response, NextFunction } from 'express';
import * as candlesService from '../services/candles.service';
import type { ApiResponse, CandleResponse, GetCandlesQuery, BatchCandlesBody } from '../types';

/**
 * GET /candles
 * Retourne les bougies pour une paire/timeframe
 */
export async function getCandles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // req.query est déjà validé par le middleware
    const query = req.query as unknown as GetCandlesQuery;
    const candles = await candlesService.getCandles(query);

    const response: ApiResponse<CandleResponse[]> = {
      success: true,
      data: candles,
      meta: {
        total: candles.length,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /candles/latest
 * Retourne la dernière bougie pour une paire/timeframe
 */
export async function getLatestCandle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pair, timeframe = 'H1' } = req.query as { pair: string; timeframe?: string };

    const candle = await candlesService.getLatestCandle(pair, timeframe as any);

    const response: ApiResponse<CandleResponse | null> = {
      success: true,
      data: candle,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /candles/batch
 * Insère des bougies en batch (N8N)
 */
export async function insertCandlesBatch(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as BatchCandlesBody;
    const count = await candlesService.insertCandlesBatch(data);

    const response: ApiResponse<{ inserted: number }> = {
      success: true,
      data: { inserted: count },
      message: `${count} candles inserted successfully`,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /candles/stats
 * Retourne les statistiques des bougies stockées
 */
export async function getCandlesStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await candlesService.getCandlesStats();

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /candles/cleanup
 * Supprime les anciennes bougies
 */
export async function cleanupCandles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pair, timeframe, keepDays = 365 } = req.body as {
      pair: string;
      timeframe: string;
      keepDays?: number;
    };

    const deleted = await candlesService.cleanupOldCandles(pair, timeframe as any, keepDays);

    const response: ApiResponse<{ deleted: number }> = {
      success: true,
      data: { deleted },
      message: `${deleted} old candles deleted`,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
