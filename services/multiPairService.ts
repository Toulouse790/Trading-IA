/**
 * Multi-Pair Trading Service
 * Support for multiple forex pairs: EUR/USD, GBP/USD, USD/JPY, etc.
 */

import { ForexPair, MarketData, Candle, TimeFrame, TradingSignal } from '../types';
import { calculateAllIndicators, TechnicalIndicators } from './forexService';

export interface PairConfig extends ForexPair {
  isActive: boolean;
  priority: number;
  correlatedPairs: string[];
}

export interface PairAnalysis {
  pair: string;
  marketData: MarketData;
  indicators: TechnicalIndicators;
  trend: 'bullish' | 'bearish' | 'sideways';
  strength: number;
  volatility: 'low' | 'medium' | 'high';
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
}

export interface CorrelationData {
  pair1: string;
  pair2: string;
  correlation: number; // -1 to 1
  interpretation: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
}

// Available forex pairs
export const FOREX_PAIRS: PairConfig[] = [
  {
    symbol: 'EUR/USD',
    base: 'EUR',
    quote: 'USD',
    pipValue: 0.0001,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.00012,
    isActive: true,
    priority: 1,
    correlatedPairs: ['GBP/USD', 'EUR/GBP'],
  },
  {
    symbol: 'GBP/USD',
    base: 'GBP',
    quote: 'USD',
    pipValue: 0.0001,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.00015,
    isActive: true,
    priority: 2,
    correlatedPairs: ['EUR/USD', 'EUR/GBP'],
  },
  {
    symbol: 'USD/JPY',
    base: 'USD',
    quote: 'JPY',
    pipValue: 0.01,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.012,
    isActive: true,
    priority: 3,
    correlatedPairs: ['EUR/JPY', 'GBP/JPY'],
  },
  {
    symbol: 'USD/CHF',
    base: 'USD',
    quote: 'CHF',
    pipValue: 0.0001,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.00018,
    isActive: true,
    priority: 4,
    correlatedPairs: ['EUR/CHF'],
  },
  {
    symbol: 'AUD/USD',
    base: 'AUD',
    quote: 'USD',
    pipValue: 0.0001,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.00015,
    isActive: true,
    priority: 5,
    correlatedPairs: ['NZD/USD'],
  },
  {
    symbol: 'USD/CAD',
    base: 'USD',
    quote: 'CAD',
    pipValue: 0.0001,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.00018,
    isActive: true,
    priority: 6,
    correlatedPairs: ['AUD/CAD'],
  },
  {
    symbol: 'NZD/USD',
    base: 'NZD',
    quote: 'USD',
    pipValue: 0.0001,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.00020,
    isActive: true,
    priority: 7,
    correlatedPairs: ['AUD/USD'],
  },
  {
    symbol: 'EUR/GBP',
    base: 'EUR',
    quote: 'GBP',
    pipValue: 0.0001,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.00015,
    isActive: false,
    priority: 8,
    correlatedPairs: ['EUR/USD', 'GBP/USD'],
  },
  {
    symbol: 'EUR/JPY',
    base: 'EUR',
    quote: 'JPY',
    pipValue: 0.01,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.015,
    isActive: false,
    priority: 9,
    correlatedPairs: ['USD/JPY', 'EUR/USD'],
  },
  {
    symbol: 'GBP/JPY',
    base: 'GBP',
    quote: 'JPY',
    pipValue: 0.01,
    lotSize: 100000,
    minLot: 0.01,
    maxLot: 100,
    spread: 0.020,
    isActive: false,
    priority: 10,
    correlatedPairs: ['USD/JPY', 'GBP/USD'],
  },
];

// Store for pair prices (simulated)
const pairPrices: Map<string, { price: number; lastUpdate: Date }> = new Map([
  ['EUR/USD', { price: 1.0876, lastUpdate: new Date() }],
  ['GBP/USD', { price: 1.2654, lastUpdate: new Date() }],
  ['USD/JPY', { price: 149.85, lastUpdate: new Date() }],
  ['USD/CHF', { price: 0.8892, lastUpdate: new Date() }],
  ['AUD/USD', { price: 0.6534, lastUpdate: new Date() }],
  ['USD/CAD', { price: 1.3567, lastUpdate: new Date() }],
  ['NZD/USD', { price: 0.5987, lastUpdate: new Date() }],
  ['EUR/GBP', { price: 0.8594, lastUpdate: new Date() }],
  ['EUR/JPY', { price: 162.89, lastUpdate: new Date() }],
  ['GBP/JPY', { price: 189.65, lastUpdate: new Date() }],
]);

/**
 * Get all available pairs
 */
export function getAllPairs(): PairConfig[] {
  return FOREX_PAIRS;
}

/**
 * Get active pairs
 */
export function getActivePairs(): PairConfig[] {
  return FOREX_PAIRS.filter(p => p.isActive).sort((a, b) => a.priority - b.priority);
}

/**
 * Set pair active status
 */
export function setPairActive(symbol: string, isActive: boolean): void {
  const pair = FOREX_PAIRS.find(p => p.symbol === symbol);
  if (pair) {
    pair.isActive = isActive;
  }
}

/**
 * Get market data for a specific pair
 */
export function getPairMarketData(symbol: string): MarketData {
  const pair = FOREX_PAIRS.find(p => p.symbol === symbol);
  if (!pair) {
    throw new Error(`Pair ${symbol} not found`);
  }

  const stored = pairPrices.get(symbol);
  let currentPrice = stored?.price || 1.0;

  // Simulate price movement
  const change = (Math.random() - 0.5) * 0.0002;
  currentPrice += change;
  pairPrices.set(symbol, { price: currentPrice, lastUpdate: new Date() });

  const bid = currentPrice - pair.spread / 2;
  const ask = currentPrice + pair.spread / 2;

  // Simulate 24h data
  const change24h = (Math.random() - 0.5) * 0.01 * currentPrice;
  const changePercent24h = (change24h / currentPrice) * 100;

  return {
    pair,
    currentPrice,
    bid,
    ask,
    spread: pair.spread,
    change24h,
    changePercent24h,
    high24h: currentPrice * 1.005,
    low24h: currentPrice * 0.995,
    volume24h: Math.floor(Math.random() * 1000000) + 500000,
    lastUpdate: new Date(),
  };
}

/**
 * Generate candles for a specific pair
 */
export function generatePairCandles(
  symbol: string,
  timeframe: TimeFrame,
  count: number = 100
): Candle[] {
  const stored = pairPrices.get(symbol);
  let basePrice = stored?.price || 1.0;

  const candles: Candle[] = [];
  const now = Date.now();

  // Timeframe in milliseconds
  const tfMs: Record<TimeFrame, number> = {
    [TimeFrame.M1]: 60000,
    [TimeFrame.M5]: 300000,
    [TimeFrame.M15]: 900000,
    [TimeFrame.M30]: 1800000,
    [TimeFrame.H1]: 3600000,
    [TimeFrame.H4]: 14400000,
    [TimeFrame.D1]: 86400000,
    [TimeFrame.W1]: 604800000,
  };

  const interval = tfMs[timeframe];

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * interval;
    const volatility = symbol.includes('JPY') ? 0.1 : 0.001;

    // Random walk with trend
    const trend = Math.sin(timestamp / 100000000) * volatility;
    const noise = (Math.random() - 0.5) * volatility;
    const change = trend + noise;

    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    candles.push({
      timestamp,
      date: new Date(timestamp),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000) + 1000,
    });

    basePrice = close;
  }

  return candles;
}

/**
 * Analyze all active pairs
 */
export function analyzeAllPairs(timeframe: TimeFrame = TimeFrame.H1): PairAnalysis[] {
  const activePairs = getActivePairs();
  const analyses: PairAnalysis[] = [];

  for (const pairConfig of activePairs) {
    const marketData = getPairMarketData(pairConfig.symbol);
    const candles = generatePairCandles(pairConfig.symbol, timeframe, 200);
    const indicators = calculateAllIndicators(candles);

    // Determine trend
    let trend: 'bullish' | 'bearish' | 'sideways';
    const ma = indicators.movingAverages;
    if (ma.sma20 > ma.sma50 && ma.sma50 > ma.sma200) {
      trend = 'bullish';
    } else if (ma.sma20 < ma.sma50 && ma.sma50 < ma.sma200) {
      trend = 'bearish';
    } else {
      trend = 'sideways';
    }

    // Calculate strength
    const priceVsMa20 = (marketData.currentPrice - ma.sma20) / ma.sma20;
    const strength = Math.min(Math.abs(priceVsMa20) * 1000, 100);

    // Determine signal
    let signal: 'buy' | 'sell' | 'hold';
    let confidence = 50;

    if (indicators.rsi.oversold && trend !== 'bearish') {
      signal = 'buy';
      confidence += 20;
    } else if (indicators.rsi.overbought && trend !== 'bullish') {
      signal = 'sell';
      confidence += 20;
    } else if (trend === 'bullish' && indicators.macd.histogram > 0) {
      signal = 'buy';
      confidence += 15;
    } else if (trend === 'bearish' && indicators.macd.histogram < 0) {
      signal = 'sell';
      confidence += 15;
    } else {
      signal = 'hold';
    }

    analyses.push({
      pair: pairConfig.symbol,
      marketData,
      indicators,
      trend,
      strength,
      volatility: indicators.atr.volatility,
      signal,
      confidence: Math.min(confidence, 95),
    });
  }

  // Sort by confidence
  analyses.sort((a, b) => b.confidence - a.confidence);

  return analyses;
}

/**
 * Calculate correlation between two pairs
 */
export function calculateCorrelation(
  symbol1: string,
  symbol2: string,
  timeframe: TimeFrame = TimeFrame.D1,
  period: number = 30
): CorrelationData {
  const candles1 = generatePairCandles(symbol1, timeframe, period);
  const candles2 = generatePairCandles(symbol2, timeframe, period);

  const returns1 = candles1.slice(1).map((c, i) =>
    (c.close - candles1[i].close) / candles1[i].close
  );
  const returns2 = candles2.slice(1).map((c, i) =>
    (c.close - candles2[i].close) / candles2[i].close
  );

  // Calculate Pearson correlation
  const mean1 = returns1.reduce((a, b) => a + b, 0) / returns1.length;
  const mean2 = returns2.reduce((a, b) => a + b, 0) / returns2.length;

  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;

  for (let i = 0; i < returns1.length; i++) {
    const diff1 = returns1[i] - mean1;
    const diff2 = returns2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }

  const correlation = numerator / (Math.sqrt(denom1) * Math.sqrt(denom2)) || 0;

  let interpretation: CorrelationData['interpretation'];
  if (correlation >= 0.7) {
    interpretation = 'strong_positive';
  } else if (correlation >= 0.3) {
    interpretation = 'positive';
  } else if (correlation >= -0.3) {
    interpretation = 'neutral';
  } else if (correlation >= -0.7) {
    interpretation = 'negative';
  } else {
    interpretation = 'strong_negative';
  }

  return {
    pair1: symbol1,
    pair2: symbol2,
    correlation,
    interpretation,
  };
}

/**
 * Get correlation matrix for all active pairs
 */
export function getCorrelationMatrix(): CorrelationData[] {
  const activePairs = getActivePairs();
  const correlations: CorrelationData[] = [];

  for (let i = 0; i < activePairs.length; i++) {
    for (let j = i + 1; j < activePairs.length; j++) {
      correlations.push(
        calculateCorrelation(activePairs[i].symbol, activePairs[j].symbol)
      );
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

/**
 * Find best trading opportunities across all pairs
 */
export function findBestOpportunities(
  maxResults: number = 5
): { pair: string; signal: 'buy' | 'sell'; confidence: number; reason: string }[] {
  const analyses = analyzeAllPairs();

  return analyses
    .filter(a => a.signal !== 'hold' && a.confidence >= 60)
    .slice(0, maxResults)
    .map(a => ({
      pair: a.pair,
      signal: a.signal,
      confidence: a.confidence,
      reason: `${a.trend} trend, ${a.volatility} volatility, RSI: ${a.indicators.rsi.value.toFixed(0)}`,
    }));
}

/**
 * Get pair comparison summary
 */
export function getPairComparisonSummary(): string {
  const analyses = analyzeAllPairs();
  const bullish = analyses.filter(a => a.trend === 'bullish');
  const bearish = analyses.filter(a => a.trend === 'bearish');

  let summary = `📊 Analyse Multi-Paires:\n\n`;
  summary += `🟢 Haussiers (${bullish.length}): ${bullish.map(a => a.pair).join(', ') || 'Aucun'}\n`;
  summary += `🔴 Baissiers (${bearish.length}): ${bearish.map(a => a.pair).join(', ') || 'Aucun'}\n\n`;

  const bestOpp = findBestOpportunities(3);
  if (bestOpp.length > 0) {
    summary += `⭐ Meilleures opportunités:\n`;
    bestOpp.forEach((opp, i) => {
      const emoji = opp.signal === 'buy' ? '🟢' : '🔴';
      summary += `${i + 1}. ${emoji} ${opp.pair} - ${opp.signal.toUpperCase()} (${opp.confidence}%)\n`;
    });
  }

  return summary;
}
