/**
 * Signals Service
 * Gestion des signaux de trading
 */

import { Prisma } from '@prisma/client';
import { prisma } from './database';
import { getPairIdBySymbol } from './pairs.service';
import type {
  SignalResponse,
  GetSignalsQuery,
  CreateSignalBody,
  SignalDirection,
  SignalSource,
} from '../types';

/**
 * Récupère les signaux avec filtres
 */
export async function getSignals(query: GetSignalsQuery): Promise<SignalResponse[]> {
  const { pair, timeframe, direction, source, limit, activeOnly } = query;

  // Construire le filtre
  const where: Prisma.SignalWhereInput = {};

  if (pair) {
    const pairId = await getPairIdBySymbol(pair);
    if (pairId) where.pairId = pairId;
  }

  if (timeframe) where.timeframe = timeframe;
  if (direction) where.direction = direction;
  if (source) where.source = source;
  if (activeOnly) where.isActive = true;

  const signals = await prisma.signal.findMany({
    where,
    include: {
      pair: {
        select: { symbol: true, displayName: true },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return signals.map(formatSignalResponse);
}

/**
 * Récupère un signal par son ID
 */
export async function getSignalById(id: string): Promise<SignalResponse | null> {
  const signal = await prisma.signal.findUnique({
    where: { id },
    include: {
      pair: {
        select: { symbol: true, displayName: true },
      },
    },
  });

  return signal ? formatSignalResponse(signal) : null;
}

/**
 * Crée un nouveau signal (utilisé par N8N/ML)
 */
export async function createSignal(data: CreateSignalBody): Promise<SignalResponse> {
  // Récupérer l'ID de la paire
  const pairId = await getPairIdBySymbol(data.pair);
  if (!pairId) {
    throw new Error(`Pair not found: ${data.pair}`);
  }

  // Désactiver les anciens signaux actifs pour cette paire/timeframe
  await prisma.signal.updateMany({
    where: {
      pairId,
      timeframe: data.timeframe,
      isActive: true,
    },
    data: { isActive: false },
  });

  // Créer le nouveau signal
  const signal = await prisma.signal.create({
    data: {
      pairId,
      timeframe: data.timeframe,
      direction: data.direction,
      confidence: data.confidence,
      entryPrice: data.entryPrice,
      takeProfit: data.takeProfit,
      stopLoss: data.stopLoss,
      riskReward: data.riskReward,
      reasonSummary: data.reasonSummary,
      reasonDetails: data.reasonDetails,
      source: data.source,
      modelVersion: data.modelVersion,
      modelName: data.modelName,
      indicators: data.indicators as Prisma.InputJsonValue,
      expiresAt: data.expiresAt,
      isActive: true,
    },
    include: {
      pair: {
        select: { symbol: true, displayName: true },
      },
    },
  });

  return formatSignalResponse(signal);
}

/**
 * Met à jour le statut d'un signal
 */
export async function updateSignalStatus(
  id: string,
  isActive: boolean
): Promise<SignalResponse | null> {
  try {
    const signal = await prisma.signal.update({
      where: { id },
      data: { isActive },
      include: {
        pair: {
          select: { symbol: true, displayName: true },
        },
      },
    });

    return formatSignalResponse(signal);
  } catch {
    return null;
  }
}

/**
 * Expire les signaux dépassés
 */
export async function expireOldSignals(): Promise<number> {
  const result = await prisma.signal.updateMany({
    where: {
      isActive: true,
      expiresAt: { lt: new Date() },
    },
    data: { isActive: false },
  });

  return result.count;
}

/**
 * Récupère les statistiques des signaux
 */
export async function getSignalsStats(): Promise<{
  total: number;
  active: number;
  byDirection: { direction: SignalDirection; count: number }[];
  bySource: { source: SignalSource; count: number }[];
  avgConfidence: number;
}> {
  const [total, active, byDirection, bySource, avgConf] = await Promise.all([
    prisma.signal.count(),
    prisma.signal.count({ where: { isActive: true } }),
    prisma.signal.groupBy({
      by: ['direction'],
      _count: true,
    }),
    prisma.signal.groupBy({
      by: ['source'],
      _count: true,
    }),
    prisma.signal.aggregate({
      _avg: { confidence: true },
    }),
  ]);

  return {
    total,
    active,
    byDirection: byDirection.map(d => ({
      direction: d.direction as SignalDirection,
      count: d._count,
    })),
    bySource: bySource.map(s => ({
      source: s.source as SignalSource,
      count: s._count,
    })),
    avgConfidence: avgConf._avg.confidence || 0,
  };
}

/**
 * Formate la réponse d'un signal
 */
function formatSignalResponse(signal: {
  id: string;
  pair: { symbol: string; displayName: string };
  timeframe: string;
  timestamp: Date;
  direction: string;
  confidence: number;
  entryPrice: number | null;
  takeProfit: number | null;
  stopLoss: number | null;
  riskReward: number | null;
  reasonSummary: string;
  source: string;
  modelVersion: string | null;
  isActive: boolean;
  indicators: Prisma.JsonValue;
}): SignalResponse {
  return {
    id: signal.id,
    pair: signal.pair.symbol,
    pairDisplayName: signal.pair.displayName,
    timeframe: signal.timeframe,
    timestamp: signal.timestamp.toISOString(),
    direction: signal.direction as SignalDirection,
    confidence: signal.confidence,
    entryPrice: signal.entryPrice,
    takeProfit: signal.takeProfit,
    stopLoss: signal.stopLoss,
    riskReward: signal.riskReward,
    reasonSummary: signal.reasonSummary,
    source: signal.source as SignalSource,
    modelVersion: signal.modelVersion,
    isActive: signal.isActive,
    indicators: signal.indicators as Record<string, unknown> | null,
  };
}
