/**
 * Trades Controller
 * Gestion des trades
 */

import { Request, Response, NextFunction } from 'express';
import * as tradesService from '../services/trades.service';
import { NotFoundError, ValidationError } from '../middlewares/errorHandler';
import type {
  ApiResponse,
  TradeResponse,
  CreateTradeBody,
  CloseTradeBody,
} from '../types';

/**
 * GET /trades
 * Retourne tous les trades
 */
export async function getTrades(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pair, status, limit, offset } = req.query as {
      pair?: string;
      status?: 'OPEN' | 'CLOSED' | 'CANCELLED';
      limit?: string;
      offset?: string;
    };

    const trades = await tradesService.getTrades({
      pair,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    const response: ApiResponse<TradeResponse[]> = {
      success: true,
      data: trades,
      meta: {
        total: trades.length,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /trades/open
 * Retourne les trades ouverts
 */
export async function getOpenTrades(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trades = await tradesService.getOpenTrades();

    const response: ApiResponse<TradeResponse[]> = {
      success: true,
      data: trades,
      meta: {
        total: trades.length,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /trades/:id
 * Retourne un trade par son ID
 */
export async function getTradeById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const trade = await tradesService.getTradeById(id);

    if (!trade) {
      throw new NotFoundError('Trade');
    }

    const response: ApiResponse<TradeResponse> = {
      success: true,
      data: trade,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /trades
 * Crée un nouveau trade
 */
export async function createTrade(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as CreateTradeBody;
    const trade = await tradesService.createTrade(data);

    const response: ApiResponse<TradeResponse> = {
      success: true,
      data: trade,
      message: 'Trade created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /trades/:id/close
 * Ferme un trade
 */
export async function closeTrade(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body as CloseTradeBody;

    const trade = await tradesService.closeTrade(id, data);

    if (!trade) {
      throw new NotFoundError('Trade');
    }

    const response: ApiResponse<TradeResponse> = {
      success: true,
      data: trade,
      message: `Trade closed with P&L: ${trade.pnl?.toFixed(2) || 0}`,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not open')) {
      next(new ValidationError(error.message));
    } else {
      next(error);
    }
  }
}

/**
 * DELETE /trades/:id
 * Annule un trade
 */
export async function cancelTrade(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const trade = await tradesService.cancelTrade(id);

    if (!trade) {
      throw new NotFoundError('Trade (or already closed)');
    }

    const response: ApiResponse<TradeResponse> = {
      success: true,
      data: trade,
      message: 'Trade cancelled',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /trades/stats
 * Retourne les statistiques des trades
 */
export async function getTradesStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await tradesService.getTradesStats();

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
