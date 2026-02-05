/**
 * Moteur de Backtesting pour stratégies de trading Forex
 */

import {
  Candle,
  BacktestConfig,
  BacktestResult,
  BacktestTrade,
  BacktestMetrics,
  BacktestStrategy,
  TimeFrame,
  SignalType,
} from '../types';
import {
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateStochastic,
  calculateATR,
  calculateSMA,
  calculateEMA,
} from './forexService';

// ============================================
// STRATÉGIES PRÉDÉFINIES
// ============================================

export const PREDEFINED_STRATEGIES: BacktestStrategy[] = [
  {
    id: 'rsi_reversal',
    name: 'RSI Reversal',
    description: 'Achète quand RSI < 30, vend quand RSI > 70',
    indicators: ['RSI'],
    entryConditions: ['RSI < 30 pour BUY', 'RSI > 70 pour SELL'],
    exitConditions: ['RSI > 50 pour fermer BUY', 'RSI < 50 pour fermer SELL'],
    stopLossType: 'atr',
    stopLossValue: 2,
    takeProfitType: 'risk_reward',
    takeProfitValue: 2,
    riskPerTrade: 1,
    maxOpenPositions: 1,
    timeframes: [TimeFrame.H1, TimeFrame.H4],
  },
  {
    id: 'macd_crossover',
    name: 'MACD Crossover',
    description: 'Entre sur les croisements MACD',
    indicators: ['MACD'],
    entryConditions: ['Crossover haussier pour BUY', 'Crossover baissier pour SELL'],
    exitConditions: ['Crossover opposé'],
    stopLossType: 'atr',
    stopLossValue: 1.5,
    takeProfitType: 'risk_reward',
    takeProfitValue: 2.5,
    riskPerTrade: 1.5,
    maxOpenPositions: 1,
    timeframes: [TimeFrame.H1, TimeFrame.H4, TimeFrame.D1],
  },
  {
    id: 'bollinger_bounce',
    name: 'Bollinger Bounce',
    description: 'Achète sur la bande inférieure, vend sur la bande supérieure',
    indicators: ['Bollinger Bands', 'RSI'],
    entryConditions: ['Prix touche bande inférieure + RSI < 40', 'Prix touche bande supérieure + RSI > 60'],
    exitConditions: ['Prix atteint la bande médiane'],
    stopLossType: 'percentage',
    stopLossValue: 0.5,
    takeProfitType: 'fixed',
    takeProfitValue: 30,
    riskPerTrade: 1,
    maxOpenPositions: 2,
    timeframes: [TimeFrame.M15, TimeFrame.H1],
  },
  {
    id: 'trend_following',
    name: 'Trend Following MA',
    description: 'Suit la tendance avec SMA 20/50',
    indicators: ['SMA 20', 'SMA 50', 'ATR'],
    entryConditions: ['SMA 20 > SMA 50 pour BUY', 'SMA 20 < SMA 50 pour SELL'],
    exitConditions: ['Croisement opposé des SMA'],
    stopLossType: 'atr',
    stopLossValue: 2,
    takeProfitType: 'atr',
    takeProfitValue: 4,
    riskPerTrade: 2,
    maxOpenPositions: 1,
    timeframes: [TimeFrame.H4, TimeFrame.D1],
  },
  {
    id: 'stochastic_divergence',
    name: 'Stochastic Oversold/Overbought',
    description: 'Entre sur les extrêmes du stochastique',
    indicators: ['Stochastic', 'ATR'],
    entryConditions: ['Stochastic K < 20 et croise D à la hausse', 'Stochastic K > 80 et croise D à la baisse'],
    exitConditions: ['Stochastic atteint zone neutre (40-60)'],
    stopLossType: 'atr',
    stopLossValue: 1.5,
    takeProfitType: 'risk_reward',
    takeProfitValue: 2,
    riskPerTrade: 1,
    maxOpenPositions: 1,
    timeframes: [TimeFrame.M30, TimeFrame.H1],
  },
];

// ============================================
// MOTEUR DE BACKTESTING
// ============================================

interface BacktestState {
  balance: number;
  equity: number;
  position: {
    type: 'long' | 'short';
    entryPrice: number;
    entryTime: Date;
    lotSize: number;
    stopLoss: number;
    takeProfit: number;
  } | null;
  trades: BacktestTrade[];
  equityCurve: { date: Date; equity: number }[];
  maxEquity: number;
  maxDrawdown: number;
}

export async function runBacktest(
  candles: Candle[],
  config: BacktestConfig,
  onProgress?: (progress: number) => void
): Promise<BacktestResult> {
  const state: BacktestState = {
    balance: config.initialBalance,
    equity: config.initialBalance,
    position: null,
    trades: [],
    equityCurve: [],
    maxEquity: config.initialBalance,
    maxDrawdown: 0,
  };

  const startIndex = Math.max(200, Math.floor(candles.length * 0.1));
  const totalIterations = candles.length - startIndex;

  for (let i = startIndex; i < candles.length; i++) {
    const currentCandles = candles.slice(0, i + 1);
    const currentCandle = candles[i];

    // Mise à jour de la position si ouverte
    if (state.position) {
      updatePosition(state, currentCandle, config);
    }

    // Vérifier les conditions d'entrée si pas de position
    if (!state.position) {
      checkEntryConditions(state, currentCandles, currentCandle, config);
    }

    // Mise à jour de l'equity curve
    const currentEquity = calculateEquity(state, currentCandle);
    state.equity = currentEquity;
    state.equityCurve.push({ date: currentCandle.date, equity: currentEquity });

    // Mise à jour du max drawdown
    if (currentEquity > state.maxEquity) {
      state.maxEquity = currentEquity;
    }
    const drawdown = (state.maxEquity - currentEquity) / state.maxEquity * 100;
    if (drawdown > state.maxDrawdown) {
      state.maxDrawdown = drawdown;
    }

    // Callback de progression
    if (onProgress && i % 50 === 0) {
      onProgress(((i - startIndex) / totalIterations) * 100);
    }
  }

  // Fermer la position finale si ouverte
  if (state.position) {
    closePosition(state, candles[candles.length - 1], 'Fin du backtest');
  }

  const metrics = calculateMetrics(state.trades, config.initialBalance, state.maxDrawdown);

  return {
    id: `bt_${Date.now()}`,
    config,
    metrics,
    trades: state.trades,
    equityCurve: state.equityCurve,
    drawdownCurve: calculateDrawdownCurve(state.equityCurve),
    monthlyReturns: calculateMonthlyReturns(state.trades),
    startDate: candles[startIndex].date,
    endDate: candles[candles.length - 1].date,
    duration: candles.length - startIndex,
    finalBalance: state.balance,
    totalReturn: state.balance - config.initialBalance,
    totalReturnPercent: ((state.balance - config.initialBalance) / config.initialBalance) * 100,
    createdAt: new Date(),
  };
}

function checkEntryConditions(
  state: BacktestState,
  candles: Candle[],
  currentCandle: Candle,
  config: BacktestConfig
): void {
  const strategy = config.strategy;
  const signal = evaluateStrategy(strategy, candles);

  if (signal === SignalType.HOLD) return;

  const atr = calculateATR(candles);
  const atrValue = atr.value * 0.0001;

  let stopLossDistance: number;
  switch (strategy.stopLossType) {
    case 'atr':
      stopLossDistance = atrValue * strategy.stopLossValue;
      break;
    case 'percentage':
      stopLossDistance = currentCandle.close * (strategy.stopLossValue / 100);
      break;
    default:
      stopLossDistance = strategy.stopLossValue * 0.0001;
  }

  let takeProfitDistance: number;
  switch (strategy.takeProfitType) {
    case 'atr':
      takeProfitDistance = atrValue * strategy.takeProfitValue;
      break;
    case 'percentage':
      takeProfitDistance = currentCandle.close * (strategy.takeProfitValue / 100);
      break;
    case 'risk_reward':
      takeProfitDistance = stopLossDistance * strategy.takeProfitValue;
      break;
    default:
      takeProfitDistance = strategy.takeProfitValue * 0.0001;
  }

  const riskAmount = state.balance * (strategy.riskPerTrade / 100);
  const stopLossPips = stopLossDistance / 0.0001;
  const pipValue = 10;
  const lotSize = Math.max(0.01, Math.min(10, riskAmount / (stopLossPips * pipValue)));

  if (signal === SignalType.BUY) {
    state.position = {
      type: 'long',
      entryPrice: currentCandle.close + config.spread,
      entryTime: currentCandle.date,
      lotSize,
      stopLoss: currentCandle.close - stopLossDistance,
      takeProfit: currentCandle.close + takeProfitDistance,
    };
  } else if (signal === SignalType.SELL) {
    state.position = {
      type: 'short',
      entryPrice: currentCandle.close,
      entryTime: currentCandle.date,
      lotSize,
      stopLoss: currentCandle.close + stopLossDistance,
      takeProfit: currentCandle.close - takeProfitDistance,
    };
  }
}

function evaluateStrategy(strategy: BacktestStrategy, candles: Candle[]): SignalType {
  switch (strategy.id) {
    case 'rsi_reversal':
      return evaluateRSIReversal(candles);
    case 'macd_crossover':
      return evaluateMACDCrossover(candles);
    case 'bollinger_bounce':
      return evaluateBollingerBounce(candles);
    case 'trend_following':
      return evaluateTrendFollowing(candles);
    case 'stochastic_divergence':
      return evaluateStochastic(candles);
    default:
      return SignalType.HOLD;
  }
}

function evaluateRSIReversal(candles: Candle[]): SignalType {
  const rsi = calculateRSI(candles);
  const prevRsi = calculateRSI(candles.slice(0, -1));

  if (rsi.value < 30 && prevRsi.value >= 30) return SignalType.BUY;
  if (rsi.value > 70 && prevRsi.value <= 70) return SignalType.SELL;
  return SignalType.HOLD;
}

function evaluateMACDCrossover(candles: Candle[]): SignalType {
  const macd = calculateMACD(candles);
  if (macd.crossover === 'bullish') return SignalType.BUY;
  if (macd.crossover === 'bearish') return SignalType.SELL;
  return SignalType.HOLD;
}

function evaluateBollingerBounce(candles: Candle[]): SignalType {
  const bb = calculateBollingerBands(candles);
  const rsi = calculateRSI(candles);
  const currentPrice = candles[candles.length - 1].close;

  if (currentPrice <= bb.lower && rsi.value < 40) return SignalType.BUY;
  if (currentPrice >= bb.upper && rsi.value > 60) return SignalType.SELL;
  return SignalType.HOLD;
}

function evaluateTrendFollowing(candles: Candle[]): SignalType {
  const closes = candles.map(c => c.close);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  const currentSma20 = sma20[sma20.length - 1];
  const currentSma50 = sma50[sma50.length - 1];
  const prevSma20 = sma20[sma20.length - 2];
  const prevSma50 = sma50[sma50.length - 2];

  if (prevSma20 <= prevSma50 && currentSma20 > currentSma50) return SignalType.BUY;
  if (prevSma20 >= prevSma50 && currentSma20 < currentSma50) return SignalType.SELL;
  return SignalType.HOLD;
}

function evaluateStochastic(candles: Candle[]): SignalType {
  const stoch = calculateStochastic(candles);
  const prevStoch = calculateStochastic(candles.slice(0, -1));

  if (stoch.k < 20 && prevStoch.k <= prevStoch.d && stoch.k > stoch.d) return SignalType.BUY;
  if (stoch.k > 80 && prevStoch.k >= prevStoch.d && stoch.k < stoch.d) return SignalType.SELL;
  return SignalType.HOLD;
}

function updatePosition(state: BacktestState, candle: Candle, config: BacktestConfig): void {
  if (!state.position) return;

  const pos = state.position;

  // Vérifier Stop Loss
  if (pos.type === 'long' && candle.low <= pos.stopLoss) {
    closePosition(state, candle, 'Stop Loss', pos.stopLoss);
    return;
  }
  if (pos.type === 'short' && candle.high >= pos.stopLoss) {
    closePosition(state, candle, 'Stop Loss', pos.stopLoss);
    return;
  }

  // Vérifier Take Profit
  if (pos.type === 'long' && candle.high >= pos.takeProfit) {
    closePosition(state, candle, 'Take Profit', pos.takeProfit);
    return;
  }
  if (pos.type === 'short' && candle.low <= pos.takeProfit) {
    closePosition(state, candle, 'Take Profit', pos.takeProfit);
    return;
  }
}

function closePosition(
  state: BacktestState,
  candle: Candle,
  reason: string,
  exitPrice?: number
): void {
  if (!state.position) return;

  const pos = state.position;
  const actualExitPrice = exitPrice || candle.close;

  let pnl: number;
  if (pos.type === 'long') {
    pnl = (actualExitPrice - pos.entryPrice) * pos.lotSize * 100000;
  } else {
    pnl = (pos.entryPrice - actualExitPrice) * pos.lotSize * 100000;
  }

  const pnlPercent = (pnl / state.balance) * 100;

  state.trades.push({
    entryTime: pos.entryTime,
    exitTime: candle.date,
    type: pos.type,
    entryPrice: pos.entryPrice,
    exitPrice: actualExitPrice,
    lotSize: pos.lotSize,
    pnl,
    pnlPercent,
    drawdown: 0,
    reason,
  });

  state.balance += pnl;
  state.position = null;
}

function calculateEquity(state: BacktestState, candle: Candle): number {
  if (!state.position) return state.balance;

  const pos = state.position;
  let unrealizedPnl: number;

  if (pos.type === 'long') {
    unrealizedPnl = (candle.close - pos.entryPrice) * pos.lotSize * 100000;
  } else {
    unrealizedPnl = (pos.entryPrice - candle.close) * pos.lotSize * 100000;
  }

  return state.balance + unrealizedPnl;
}

function calculateMetrics(
  trades: BacktestTrade[],
  initialBalance: number,
  maxDrawdown: number
): BacktestMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      grossProfit: 0,
      grossLoss: 0,
      netProfit: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      maxDrawdown,
      maxDrawdownPercent: maxDrawdown,
      recoveryFactor: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      averageHoldingTime: 0,
      expectancy: 0,
    };
  }

  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl <= 0);

  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const netProfit = grossProfit - grossLoss;

  const averageWin = winningTrades.length > 0
    ? grossProfit / winningTrades.length
    : 0;
  const averageLoss = losingTrades.length > 0
    ? grossLoss / losingTrades.length
    : 0;

  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;

  for (const trade of trades) {
    if (trade.pnl > 0) {
      currentWins++;
      currentLosses = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
    } else {
      currentLosses++;
      currentWins = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
    }
  }

  const returns = trades.map(t => t.pnlPercent);
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0;

  const negativeReturns = returns.filter(r => r < 0);
  const downsideVariance = negativeReturns.length > 0
    ? negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length
    : 0;
  const downsideStdDev = Math.sqrt(downsideVariance);
  const sortinoRatio = downsideStdDev > 0 ? (meanReturn / downsideStdDev) * Math.sqrt(252) : 0;

  const totalHoldingTime = trades.reduce((sum, t) => {
    return sum + (t.exitTime.getTime() - t.entryTime.getTime());
  }, 0);
  const averageHoldingTime = totalHoldingTime / trades.length / (1000 * 60 * 60);

  const winRate = (winningTrades.length / trades.length) * 100;
  const expectancy = (winRate / 100) * averageWin - ((100 - winRate) / 100) * averageLoss;

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate,
    grossProfit,
    grossLoss,
    netProfit,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    averageWin,
    averageLoss,
    largestWin: Math.max(...trades.map(t => t.pnl), 0),
    largestLoss: Math.min(...trades.map(t => t.pnl), 0),
    maxConsecutiveWins,
    maxConsecutiveLosses,
    maxDrawdown,
    maxDrawdownPercent: maxDrawdown,
    recoveryFactor: maxDrawdown > 0 ? netProfit / (initialBalance * maxDrawdown / 100) : 0,
    sharpeRatio,
    sortinoRatio,
    calmarRatio: maxDrawdown > 0 ? (netProfit / initialBalance * 100) / maxDrawdown : 0,
    averageHoldingTime,
    expectancy,
  };
}

function calculateDrawdownCurve(
  equityCurve: { date: Date; equity: number }[]
): { date: Date; drawdown: number }[] {
  let maxEquity = 0;
  return equityCurve.map(point => {
    if (point.equity > maxEquity) maxEquity = point.equity;
    const drawdown = maxEquity > 0 ? ((maxEquity - point.equity) / maxEquity) * 100 : 0;
    return { date: point.date, drawdown };
  });
}

function calculateMonthlyReturns(
  trades: BacktestTrade[]
): { month: string; return: number }[] {
  const monthlyPnl: Record<string, number> = {};

  for (const trade of trades) {
    const month = trade.exitTime.toISOString().slice(0, 7);
    monthlyPnl[month] = (monthlyPnl[month] || 0) + trade.pnl;
  }

  return Object.entries(monthlyPnl)
    .map(([month, pnl]) => ({ month, return: pnl }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// ============================================
// OPTIMISATION DE STRATÉGIE
// ============================================

export async function optimizeStrategy(
  candles: Candle[],
  baseStrategy: BacktestStrategy,
  parameterRanges: {
    stopLossRange: number[];
    takeProfitRange: number[];
    riskRange: number[];
  },
  onProgress?: (progress: number) => void
): Promise<{ bestConfig: BacktestConfig; results: BacktestResult[] }> {
  const results: BacktestResult[] = [];
  const totalCombinations =
    parameterRanges.stopLossRange.length *
    parameterRanges.takeProfitRange.length *
    parameterRanges.riskRange.length;

  let current = 0;

  for (const sl of parameterRanges.stopLossRange) {
    for (const tp of parameterRanges.takeProfitRange) {
      for (const risk of parameterRanges.riskRange) {
        const strategy: BacktestStrategy = {
          ...baseStrategy,
          stopLossValue: sl,
          takeProfitValue: tp,
          riskPerTrade: risk,
        };

        const config: BacktestConfig = {
          strategy,
          startDate: candles[0].date,
          endDate: candles[candles.length - 1].date,
          initialBalance: 10000,
          leverage: 100,
          commission: 0,
          spread: 0.00015,
          slippage: 0,
        };

        const result = await runBacktest(candles, config);
        results.push(result);

        current++;
        if (onProgress) {
          onProgress((current / totalCombinations) * 100);
        }
      }
    }
  }

  // Trouver la meilleure configuration (basée sur le profit factor et le sharpe ratio)
  const bestResult = results.reduce((best, current) => {
    const currentScore = current.metrics.profitFactor * 0.4 +
                        current.metrics.sharpeRatio * 0.3 +
                        current.metrics.winRate / 100 * 0.3;
    const bestScore = best.metrics.profitFactor * 0.4 +
                     best.metrics.sharpeRatio * 0.3 +
                     best.metrics.winRate / 100 * 0.3;
    return currentScore > bestScore ? current : best;
  });

  return { bestConfig: bestResult.config, results };
}
