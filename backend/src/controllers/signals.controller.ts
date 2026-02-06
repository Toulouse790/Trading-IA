/**
 * Signals Controller
 * Gestion des signaux de trading
 */

import { Request, Response, NextFunction } from 'express';
import * as signalsService from '../services/signals.service';
import { NotFoundError } from '../middlewares/errorHandler';
import type {
  ApiResponse,
  SignalResponse,
  GetSignalsQuery,
  CreateSignalBody,
} from '../types';

/**
 * GET /signals
 * Retourne les signaux avec filtres
 */
export async function getSignals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as GetSignalsQuery;
    const signals = await signalsService.getSignals(query);

    const response: ApiResponse<SignalResponse[]> = {
      success: true,
      data: signals,
      meta: {
        total: signals.length,
        timestamp: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /signals/:id
 * Retourne un signal par son ID
 */
export async function getSignalById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const signal = await signalsService.getSignalById(id);

    if (!signal) {
      throw new NotFoundError('Signal');
    }

    const response: ApiResponse<SignalResponse> = {
      success: true,
      data: signal,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /signals
 * Crée un nouveau signal (N8N/ML)
 */
export async function createSignal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as CreateSignalBody;
    const signal = await signalsService.createSignal(data);

    const response: ApiResponse<SignalResponse> = {
      success: true,
      data: signal,
      message: 'Signal created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /signals/:id/deactivate
 * Désactive un signal
 */
export async function deactivateSignal(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const signal = await signalsService.updateSignalStatus(id, false);

    if (!signal) {
      throw new NotFoundError('Signal');
    }

    const response: ApiResponse<SignalResponse> = {
      success: true,
      data: signal,
      message: 'Signal deactivated',
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /signals/stats
 * Retourne les statistiques des signaux
 */
export async function getSignalsStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await signalsService.getSignalsStats();

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
 * POST /signals/expire
 * Expire les anciens signaux
 */
export async function expireSignals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await signalsService.expireOldSignals();

    const response: ApiResponse<{ expired: number }> = {
      success: true,
      data: { expired: count },
      message: `${count} signals expired`,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}
