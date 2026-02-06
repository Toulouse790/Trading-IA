/**
 * Trades Service
 * Gestion des trades (simulés ou réels)
 */

import { Prisma, TradeStatus } from '@prisma/client';
import { prisma } from './database';
import { getPairIdBySymbol, getPairById } from './pairs.service';
import type {
  TradeResponse,
  CreateTradeBody,
  CloseTradeBody,
  TradeDirection,
} from '../types';

/**
 * Récupère tous les trades avec filtres optionnels
 */
export async function getTrades(options: {
  pair?: string;
  status?: TradeStatus;
  limit?: number;
  offset?: number;
}): Promise<TradeResponse[]> {
  const { pair, status, limit = 50, offset = 0 } = options;

  const where: Prisma.TradeWhereInput = {};

  if (pair) {
    const pairId = await getPairIdBySymbol(pair);
    if (pairId) where.pairId = pairId;
  }

  if (status) where.status = status;

  const trades = await prisma.trade.findMany({
    where,
    include: {
      pair: {
        select: { symbol: true, displayName: true, pipValue: true },
      },
    },
    orderBy: { openedAt: 'desc' },
    take: limit,
    skip: offset,
  });

  return trades.map(formatTradeResponse);
}

/**
 * Récupère les trades ouverts
 */
export async function getOpenTrades(): Promise<TradeResponse[]> {
  return getTrades({ status: 'OPEN' });
}

/**
 * Récupère un trade par son ID
 */
export async function getTradeById(id: string): Promise<TradeResponse | null> {
  const trade = await prisma.trade.findUnique({
    where: { id },
    include: {
      pair: {
        select: { symbol: true, displayName: true, pipValue: true },
      },
    },
  });

  return trade ? formatTradeResponse(trade) : null;
}

/**
 * Crée un nouveau trade
 */
export async function createTrade(data: CreateTradeBody): Promise<TradeResponse> {
  // Récupérer l'ID de la paire
  const pairId = await getPairIdBySymbol(data.pair);
  if (!pairId) {
    throw new Error(`Pair not found: ${data.pair}`);
  }

  const trade = await prisma.trade.create({
    data: {
      pairId,
      timeframe: data.timeframe,
      direction: data.direction,
      entryPrice: data.entryPrice,
      takeProfit: data.takeProfit,
      stopLoss: data.stopLoss,
      positionSize: data.positionSize,
      leverage: data.leverage,
      signalId: data.signalId,
      notes: data.notes,
      status: 'OPEN',
    },
    include: {
      pair: {
        select: { symbol: true, displayName: true, pipValue: true },
      },
    },
  });

  return formatTradeResponse(trade);
}

/**
 * Ferme un trade
 */
export async function closeTrade(
  id: string,
  data: CloseTradeBody
): Promise<TradeResponse | null> {
  // Récupérer le trade existant
  const existingTrade = await prisma.trade.findUnique({
    where: { id },
    include: {
      pair: {
        select: { symbol: true, displayName: true, pipValue: true, lotSize: true },
      },
    },
  });

  if (!existingTrade) {
    return null;
  }

  if (existingTrade.status !== 'OPEN') {
    throw new Error(`Trade ${id} is not open`);
  }

  // Calculer le P&L
  const { pnl, pnlPips, pnlPercent } = calculatePnL(
    existingTrade.direction as TradeDirection,
    existingTrade.entryPrice,
    data.exitPrice,
    existingTrade.positionSize,
    existingTrade.pair.pipValue,
    existingTrade.pair.lotSize
  );

  // Mettre à jour le trade
  const trade = await prisma.trade.update({
    where: { id },
    data: {
      exitPrice: data.exitPrice,
      closedAt: new Date(),
      pnl,
      pnlPips,
      pnlPercent,
      status: 'CLOSED',
      closeReason: data.closeReason || 'MANUAL',
      notes: data.notes ? `${existingTrade.notes || ''}\n${data.notes}` : existingTrade.notes,
    },
    include: {
      pair: {
        select: { symbol: true, displayName: true, pipValue: true },
      },
    },
  });

  return formatTradeResponse(trade);
}

/**
 * Annule un trade (sans exécution)
 */
export async function cancelTrade(id: string): Promise<TradeResponse | null> {
  try {
    const trade = await prisma.trade.update({
      where: { id, status: 'OPEN' },
      data: {
        status: 'CANCELLED',
        closedAt: new Date(),
        closeReason: 'CANCELLED',
      },
      include: {
        pair: {
          select: { symbol: true, displayName: true, pipValue: true },
        },
      },
    });

    return formatTradeResponse(trade);
  } catch {
    return null;
  }
}

/**
 * Récupère les statistiques des trades
 */
export async function getTradesStats(): Promise<{
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}> {
  const [total, open, closed, wins, losses, pnlStats] = await Promise.all([
    prisma.trade.count(),
    prisma.trade.count({ where: { status: 'OPEN' } }),
    prisma.trade.count({ where: { status: 'CLOSED' } }),
    prisma.trade.count({ where: { status: 'CLOSED', pnl: { gt: 0 } } }),
    prisma.trade.count({ where: { status: 'CLOSED', pnl: { lt: 0 } } }),
    prisma.trade.aggregate({
      where: { status: 'CLOSED' },
      _sum: { pnl: true },
      _avg: { pnl: true },
    }),
  ]);

  // Calculer les moyennes des gains et pertes
  const [avgWinResult, avgLossResult] = await Promise.all([
    prisma.trade.aggregate({
      where: { status: 'CLOSED', pnl: { gt: 0 } },
      _avg: { pnl: true },
    }),
    prisma.trade.aggregate({
      where: { status: 'CLOSED', pnl: { lt: 0 } },
      _avg: { pnl: true },
    }),
  ]);

  const totalPnl = pnlStats._sum.pnl || 0;
  const avgPnl = pnlStats._avg.pnl || 0;
  const avgWin = avgWinResult._avg.pnl || 0;
  const avgLoss = Math.abs(avgLossResult._avg.pnl || 0);

  // Calcul du profit factor
  const grossProfit = wins * avgWin;
  const grossLoss = losses * avgLoss;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  return {
    totalTrades: total,
    openTrades: open,
    closedTrades: closed,
    winningTrades: wins,
    losingTrades: losses,
    winRate: closed > 0 ? (wins / closed) * 100 : 0,
    totalPnl,
    avgPnl,
    avgWin,
    avgLoss,
    profitFactor: isFinite(profitFactor) ? profitFactor : 0,
  };
}

/**
 * Calcule le P&L d'un trade
 */
function calculatePnL(
  direction: TradeDirection,
  entryPrice: number,
  exitPrice: number,
  positionSize: number,
  pipValue: number,
  lotSize: number
): { pnl: number; pnlPips: number; pnlPercent: number } {
  // Calcul des pips
  const priceDiff = direction === 'LONG'
    ? exitPrice - entryPrice
    : entryPrice - exitPrice;

  const pnlPips = priceDiff / pipValue;

  // Calcul du P&L en devise
  // Pour Forex: PnL = Pips * PipValue * LotSize * PositionSize
  const pnl = pnlPips * pipValue * lotSize * positionSize;

  // Calcul du pourcentage (basé sur la valeur notionnelle)
  const notionalValue = entryPrice * lotSize * positionSize;
  const pnlPercent = notionalValue > 0 ? (pnl / notionalValue) * 100 : 0;

  return {
    pnl: Number(pnl.toFixed(2)),
    pnlPips: Number(pnlPips.toFixed(1)),
    pnlPercent: Number(pnlPercent.toFixed(4)),
  };
}

/**
 * Formate la réponse d'un trade
 */
function formatTradeResponse(trade: {
  id: string;
  pair: { symbol: string; displayName: string };
  timeframe: string | null;
  direction: string;
  entryPrice: number;
  exitPrice: number | null;
  takeProfit: number | null;
  stopLoss: number | null;
  positionSize: number;
  leverage: number;
  openedAt: Date;
  closedAt: Date | null;
  pnl: number | null;
  pnlPips: number | null;
  pnlPercent: number | null;
  status: string;
  closeReason: string | null;
  signalId: string | null;
}): TradeResponse {
  return {
    id: trade.id,
    pair: trade.pair.symbol,
    pairDisplayName: trade.pair.displayName,
    timeframe: trade.timeframe,
    direction: trade.direction as TradeDirection,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    takeProfit: trade.takeProfit,
    stopLoss: trade.stopLoss,
    positionSize: trade.positionSize,
    leverage: trade.leverage,
    openedAt: trade.openedAt.toISOString(),
    closedAt: trade.closedAt?.toISOString() || null,
    pnl: trade.pnl,
    pnlPips: trade.pnlPips,
    pnlPercent: trade.pnlPercent,
    status: trade.status as TradeStatus,
    closeReason: trade.closeReason,
    signalId: trade.signalId,
  };
}
