/**
 * Pairs Controller
 * Gestion des paires Forex
 */

import { Request, Response, NextFunction } from 'express';
import * as pairsService from '../services/pairs.service';
import { NotFoundError } from '../middlewares/errorHandler';
import type { ApiResponse, PairResponse } from '../types';

/**
 * GET /pairs
 * Retourne toutes les paires actives
 */
export async function getPairs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    const pairs = await pairsService.getAllPairs(activeOnly);

    const response: ApiResponse<PairResponse[]> = {
      success: true,
      data: pairs,
      meta: {
        total: pairs.length,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /pairs/:symbol
 * Retourne une paire par son symbole
 */
export async function getPairBySymbol(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { symbol } = req.params;
    const pair = await pairsService.getPairBySymbol(symbol);

    if (!pair) {
      throw new NotFoundError(`Pair ${symbol}`);
    }

    const response: ApiResponse<PairResponse> = {
      success: true,
      data: pair,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
