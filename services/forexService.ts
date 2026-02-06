/**
 * Service de données Forex EUR/USD
 * Fournit les données de marché, calculs d'indicateurs techniques
 */

import {
  Candle,
  MarketData,
  TimeFrame,
  TechnicalIndicators,
  RSIData,
  MACDData,
  BollingerBandsData,
  MovingAverageData,
  StochasticData,
  ATRData,
  PivotPoints,
  FibonacciLevels,
  DEFAULT_FOREX_PAIR,
  TrendDirection,
  SignalType,
} from '../types';

// ============================================
// GÉNÉRATION DE DONNÉES SIMULÉES
// ============================================

let basePrice = 1.0850;
let lastUpdate = Date.now();

function generateRandomWalk(current: number, volatility: number = 0.0002): number {
  const change = (Math.random() - 0.5) * 2 * volatility;
  return Math.max(1.0000, Math.min(1.2000, current + change));
}

export function generateRealtimePrice(): { bid: number; ask: number; spread: number } {
  const now = Date.now();
  if (now - lastUpdate > 1000) {
    basePrice = generateRandomWalk(basePrice);
    lastUpdate = now;
  }

  const spread = 0.00015 + Math.random() * 0.00005;
  const bid = basePrice;
  const ask = basePrice + spread;

  return { bid, ask, spread };
}

export function generateHistoricalCandles(
  timeframe: TimeFrame,
  count: number = 500,
  endDate: Date = new Date()
): Candle[] {
  const candles: Candle[] = [];
  const intervalMs = getTimeframeMs(timeframe);

  let currentPrice = 1.0750 + Math.random() * 0.02;
  let timestamp = endDate.getTime() - count * intervalMs;

  for (let i = 0; i < count; i++) {
    const volatility = getVolatilityByTimeframe(timeframe);
    const trend = Math.sin(i / 50) * 0.0005;

    const open = currentPrice;
    const change1 = (Math.random() - 0.48 + trend) * volatility;
    const change2 = (Math.random() - 0.48 + trend) * volatility;
    const change3 = (Math.random() - 0.48 + trend) * volatility;

    const high = Math.max(open, open + Math.abs(change1), open + change2, open + change3);
    const low = Math.min(open, open - Math.abs(change1), open + change2, open + change3);
    const close = open + change1 + change2 * 0.5;

    currentPrice = close;

    candles.push({
      timestamp,
      date: new Date(timestamp),
      open: Number(open.toFixed(5)),
      high: Number(high.toFixed(5)),
      low: Number(low.toFixed(5)),
      close: Number(close.toFixed(5)),
      volume: Math.floor(1000 + Math.random() * 9000),
    });

    timestamp += intervalMs;
  }

  return candles;
}

function getTimeframeMs(timeframe: TimeFrame): number {
  const intervals: Record<TimeFrame, number> = {
    [TimeFrame.M1]: 60 * 1000,
    [TimeFrame.M5]: 5 * 60 * 1000,
    [TimeFrame.M15]: 15 * 60 * 1000,
    [TimeFrame.M30]: 30 * 60 * 1000,
    [TimeFrame.H1]: 60 * 60 * 1000,
    [TimeFrame.H4]: 4 * 60 * 60 * 1000,
    [TimeFrame.D1]: 24 * 60 * 60 * 1000,
    [TimeFrame.W1]: 7 * 24 * 60 * 60 * 1000,
  };
  return intervals[timeframe];
}

function getVolatilityByTimeframe(timeframe: TimeFrame): number {
  const volatility: Record<TimeFrame, number> = {
    [TimeFrame.M1]: 0.0003,
    [TimeFrame.M5]: 0.0005,
    [TimeFrame.M15]: 0.0008,
    [TimeFrame.M30]: 0.0012,
    [TimeFrame.H1]: 0.0018,
    [TimeFrame.H4]: 0.0035,
    [TimeFrame.D1]: 0.0070,
    [TimeFrame.W1]: 0.0150,
  };
  return volatility[timeframe];
}

// ============================================
// DONNÉES DE MARCHÉ
// ============================================

export function getMarketData(): MarketData {
  const { bid, ask, spread } = generateRealtimePrice();
  const previousClose = basePrice - 0.0015 + Math.random() * 0.003;
  const change24h = bid - previousClose;

  return {
    pair: DEFAULT_FOREX_PAIR,
    currentPrice: bid,
    bid,
    ask,
    spread,
    change24h,
    changePercent24h: (change24h / previousClose) * 100,
    high24h: bid + 0.0050 + Math.random() * 0.0030,
    low24h: bid - 0.0050 - Math.random() * 0.0030,
    volume24h: 50000000000 + Math.random() * 20000000000,
    lastUpdate: new Date(),
  };
}

// ============================================
// CALCUL DES INDICATEURS TECHNIQUES
// ============================================

export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    } else {
      const ema = (data[i] - result[i - 1]) * multiplier + result[i - 1];
      result.push(ema);
    }
  }
  return result;
}

export function calculateRSI(candles: Candle[], period: number = 14): RSIData {
  const closes = candles.map(c => c.close);
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  const recentGains = gains.slice(-period);
  const recentLosses = losses.slice(-period);

  const avgGain = recentGains.reduce((a, b) => a + b, 0) / period;
  const avgLoss = recentLosses.reduce((a, b) => a + b, 0) / period;

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return {
    value: Number(rsi.toFixed(2)),
    overbought: rsi > 70,
    oversold: rsi < 30,
    signal: rsi > 70 ? SignalType.SELL : rsi < 30 ? SignalType.BUY : SignalType.HOLD,
  };
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDData {
  const closes = candles.map(c => c.close);
  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(emaFast[i] - emaSlow[i]);
    }
  }

  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalLine = calculateEMA(validMacd, signalPeriod);

  const macd = validMacd[validMacd.length - 1] || 0;
  const signal = signalLine[signalLine.length - 1] || 0;
  const histogram = macd - signal;

  const prevMacd = validMacd[validMacd.length - 2] || 0;
  const prevSignal = signalLine[signalLine.length - 2] || 0;

  let crossover: 'bullish' | 'bearish' | 'none' = 'none';
  if (prevMacd <= prevSignal && macd > signal) crossover = 'bullish';
  if (prevMacd >= prevSignal && macd < signal) crossover = 'bearish';

  return {
    macd: Number((macd * 10000).toFixed(2)),
    signal: Number((signal * 10000).toFixed(2)),
    histogram: Number((histogram * 10000).toFixed(2)),
    crossover,
  };
}

export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsData {
  const closes = candles.map(c => c.close);
  const sma = calculateSMA(closes, period);
  const middle = sma[sma.length - 1];

  const recentCloses = closes.slice(-period);
  const variance = recentCloses.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);

  const upper = middle + stdDev * standardDeviation;
  const lower = middle - stdDev * standardDeviation;
  const bandwidth = (upper - lower) / middle;

  const currentPrice = closes[closes.length - 1];
  const percentB = (currentPrice - lower) / (upper - lower);

  return {
    upper: Number(upper.toFixed(5)),
    middle: Number(middle.toFixed(5)),
    lower: Number(lower.toFixed(5)),
    bandwidth: Number(bandwidth.toFixed(4)),
    percentB: Number(percentB.toFixed(2)),
  };
}

export function calculateMovingAverages(candles: Candle[]): MovingAverageData {
  const closes = candles.map(c => c.close);

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);

  const currentPrice = closes[closes.length - 1];
  const ma20 = sma20[sma20.length - 1];
  const ma50 = sma50[sma50.length - 1];
  const ma200 = sma200[sma200.length - 1];

  let trend: TrendDirection;
  if (currentPrice > ma20 && ma20 > ma50 && ma50 > ma200) {
    trend = TrendDirection.BULLISH;
  } else if (currentPrice < ma20 && ma20 < ma50 && ma50 < ma200) {
    trend = TrendDirection.BEARISH;
  } else {
    trend = TrendDirection.SIDEWAYS;
  }

  return {
    sma20: Number(ma20.toFixed(5)),
    sma50: Number(ma50.toFixed(5)),
    sma200: Number((ma200 || currentPrice).toFixed(5)),
    ema12: Number(ema12[ema12.length - 1].toFixed(5)),
    ema26: Number(ema26[ema26.length - 1].toFixed(5)),
    trend,
  };
}

export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): StochasticData {
  const recent = candles.slice(-kPeriod);
  const highs = recent.map(c => c.high);
  const lows = recent.map(c => c.low);
  const close = recent[recent.length - 1].close;

  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);

  const k = ((close - lowestLow) / (highestHigh - lowestLow)) * 100;

  const kValues: number[] = [];
  for (let i = kPeriod; i <= candles.length; i++) {
    const slice = candles.slice(i - kPeriod, i);
    const h = Math.max(...slice.map(c => c.high));
    const l = Math.min(...slice.map(c => c.low));
    const c = slice[slice.length - 1].close;
    kValues.push(((c - l) / (h - l)) * 100);
  }

  const dValues = calculateSMA(kValues, dPeriod);
  const d = dValues[dValues.length - 1];

  return {
    k: Number(k.toFixed(2)),
    d: Number(d.toFixed(2)),
    overbought: k > 80,
    oversold: k < 20,
  };
}

export function calculateATR(candles: Candle[], period: number = 14): ATRData {
  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );
    trueRanges.push(tr);
  }

  const recentTR = trueRanges.slice(-period);
  const atr = recentTR.reduce((a, b) => a + b, 0) / period;
  const atrPips = atr / 0.0001;

  let volatility: 'low' | 'medium' | 'high';
  if (atrPips < 30) volatility = 'low';
  else if (atrPips < 60) volatility = 'medium';
  else volatility = 'high';

  return {
    value: Number((atr * 10000).toFixed(1)),
    volatility,
  };
}

export function calculatePivotPoints(candles: Candle[]): PivotPoints {
  const lastCandle = candles[candles.length - 2];
  const { high, low, close } = lastCandle;

  const pivot = (high + low + close) / 3;
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  return {
    pivot: Number(pivot.toFixed(5)),
    r1: Number(r1.toFixed(5)),
    r2: Number(r2.toFixed(5)),
    r3: Number(r3.toFixed(5)),
    s1: Number(s1.toFixed(5)),
    s2: Number(s2.toFixed(5)),
    s3: Number(s3.toFixed(5)),
  };
}

export function calculateFibonacci(candles: Candle[], lookback: number = 50): FibonacciLevels {
  const recent = candles.slice(-lookback);
  const high = Math.max(...recent.map(c => c.high));
  const low = Math.min(...recent.map(c => c.low));
  const diff = high - low;

  return {
    level0: Number(low.toFixed(5)),
    level236: Number((low + diff * 0.236).toFixed(5)),
    level382: Number((low + diff * 0.382).toFixed(5)),
    level500: Number((low + diff * 0.5).toFixed(5)),
    level618: Number((low + diff * 0.618).toFixed(5)),
    level786: Number((low + diff * 0.786).toFixed(5)),
    level1000: Number(high.toFixed(5)),
  };
}

// ============================================
// CALCUL COMPLET DES INDICATEURS
// ============================================

export function calculateAllIndicators(candles: Candle[]): TechnicalIndicators {
  return {
    rsi: calculateRSI(candles),
    macd: calculateMACD(candles),
    bollingerBands: calculateBollingerBands(candles),
    movingAverages: calculateMovingAverages(candles),
    stochastic: calculateStochastic(candles),
    atr: calculateATR(candles),
    pivotPoints: calculatePivotPoints(candles),
    fibonacci: calculateFibonacci(candles),
  };
}

// ============================================
// UTILITAIRES
// ============================================

export function formatPrice(price: number, decimals: number = 5): string {
  return price.toFixed(decimals);
}

export function calculatePips(entry: number, exit: number): number {
  return Math.round((exit - entry) / 0.0001);
}

export function calculateLotSize(
  balance: number,
  riskPercent: number,
  stopLossPips: number,
  pipValue: number = 10
): number {
  const riskAmount = balance * (riskPercent / 100);
  const lotSize = riskAmount / (stopLossPips * pipValue);
  return Math.round(lotSize * 100) / 100;
}

export function getTimeframeLabel(tf: TimeFrame): string {
  const labels: Record<TimeFrame, string> = {
    [TimeFrame.M1]: '1 Min',
    [TimeFrame.M5]: '5 Min',
    [TimeFrame.M15]: '15 Min',
    [TimeFrame.M30]: '30 Min',
    [TimeFrame.H1]: '1 Heure',
    [TimeFrame.H4]: '4 Heures',
    [TimeFrame.D1]: '1 Jour',
    [TimeFrame.W1]: '1 Semaine',
  };
  return labels[tf];
}
