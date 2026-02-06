/**
 * Candles Service
 * Gestion des données OHLCV
 */

import { prisma } from './database';
import { getPairIdBySymbol } from './pairs.service';
import type { CandleResponse, GetCandlesQuery, BatchCandlesBody, Timeframe } from '../types';

/**
 * Récupère les bougies pour une paire et timeframe donnés
 */
export async function getCandles(query: GetCandlesQuery): Promise<CandleResponse[]> {
  const { pair, timeframe, limit, startDate, endDate } = query;

  // Normaliser le symbole
  const normalizedPair = pair.toUpperCase().replace('/', '');

  // Construire le filtre de date
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (startDate) dateFilter.gte = startDate;
  if (endDate) dateFilter.lte = endDate;

  const candles = await prisma.forexCandle.findMany({
    where: {
      pair: { symbol: normalizedPair },
      timeframe,
      ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter }),
    },
    include: {
      pair: {
        select: { symbol: true },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  // Inverser pour avoir l'ordre chronologique
  return candles.reverse().map(formatCandleResponse);
}

/**
 * Récupère la dernière bougie pour une paire
 */
export async function getLatestCandle(
  pair: string,
  timeframe: Timeframe
): Promise<CandleResponse | null> {
  const normalizedPair = pair.toUpperCase().replace('/', '');

  const candle = await prisma.forexCandle.findFirst({
    where: {
      pair: { symbol: normalizedPair },
      timeframe,
    },
    include: {
      pair: { select: { symbol: true } },
    },
    orderBy: { timestamp: 'desc' },
  });

  return candle ? formatCandleResponse(candle) : null;
}

/**
 * Insère des bougies en batch (utilisé par N8N)
 */
export async function insertCandlesBatch(data: BatchCandlesBody): Promise<number> {
  const { pair, timeframe, candles } = data;

  // Récupérer l'ID de la paire
  const pairId = await getPairIdBySymbol(pair);
  if (!pairId) {
    throw new Error(`Pair not found: ${pair}`);
  }

  // Préparer les données
  const candleData = candles.map(candle => ({
    pairId,
    timeframe,
    timestamp: candle.timestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  }));

  // Upsert en batch (ignore les doublons)
  const result = await prisma.forexCandle.createMany({
    data: candleData,
    skipDuplicates: true,
  });

  return result.count;
}

/**
 * Supprime les anciennes bougies (nettoyage)
 */
export async function cleanupOldCandles(
  pair: string,
  timeframe: Timeframe,
  keepDays: number
): Promise<number> {
  const pairId = await getPairIdBySymbol(pair);
  if (!pairId) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - keepDays);

  const result = await prisma.forexCandle.deleteMany({
    where: {
      pairId,
      timeframe,
      timestamp: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * Récupère les statistiques des bougies stockées
 */
export async function getCandlesStats(): Promise<{
  totalCandles: number;
  byPair: { pair: string; count: number }[];
  byTimeframe: { timeframe: string; count: number }[];
  oldestCandle: Date | null;
  newestCandle: Date | null;
}> {
  const [total, byPair, byTimeframe, oldest, newest] = await Promise.all([
    prisma.forexCandle.count(),
    prisma.forexCandle.groupBy({
      by: ['pairId'],
      _count: true,
    }),
    prisma.forexCandle.groupBy({
      by: ['timeframe'],
      _count: true,
    }),
    prisma.forexCandle.findFirst({
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true },
    }),
    prisma.forexCandle.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    }),
  ]);

  // Enrichir avec les symboles des paires
  const pairs = await prisma.forexPair.findMany({
    where: { id: { in: byPair.map(p => p.pairId) } },
    select: { id: true, symbol: true },
  });

  const pairMap = new Map(pairs.map(p => [p.id, p.symbol]));

  return {
    totalCandles: total,
    byPair: byPair.map(p => ({
      pair: pairMap.get(p.pairId) || 'Unknown',
      count: p._count,
    })),
    byTimeframe: byTimeframe.map(t => ({
      timeframe: t.timeframe,
      count: t._count,
    })),
    oldestCandle: oldest?.timestamp || null,
    newestCandle: newest?.timestamp || null,
  };
}

/**
 * Formate la réponse d'une bougie
 */
function formatCandleResponse(candle: {
  id: string;
  pair: { symbol: string };
  timeframe: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}): CandleResponse {
  return {
    id: candle.id,
    pair: candle.pair.symbol,
    timeframe: candle.timeframe,
    timestamp: candle.timestamp.toISOString(),
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  };
}
