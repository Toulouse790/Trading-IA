/**
 * Multi-Timeframe Analysis Service
 * Combines M5, H1, D1 timeframes for more accurate trading signals
 */

import { Candle, TimeFrame, TrendDirection, SignalType, SignalStrength } from '../types';
import { generateHistoricalCandles, calculateAllIndicators } from './forexService';

export interface TimeframeAnalysis {
  timeframe: TimeFrame;
  trend: TrendDirection;
  strength: number; // 0-100
  rsiSignal: SignalType;
  macdSignal: SignalType;
  maSignal: SignalType;
  support: number;
  resistance: number;
  volatility: 'low' | 'medium' | 'high';
}

export interface MultiTimeframeResult {
  m5: TimeframeAnalysis;
  h1: TimeframeAnalysis;
  d1: TimeframeAnalysis;
  overallTrend: TrendDirection;
  overallSignal: SignalType;
  overallStrength: SignalStrength;
  confidence: number;
  alignment: 'full' | 'partial' | 'conflicting';
  reasoning: string[];
  entryZone: { min: number; max: number };
  stopLoss: number;
  takeProfit: number[];
}

/**
 * Analyze a single timeframe
 */
function analyzeTimeframe(candles: Candle[], timeframe: TimeFrame): TimeframeAnalysis {
  const indicators = calculateAllIndicators(candles);
  const recentCandles = candles.slice(-20);

  // Determine trend from moving averages
  let trend: TrendDirection;
  const ma = indicators.movingAverages;
  if (ma.sma20 > ma.sma50 && ma.sma50 > ma.sma200) {
    trend = TrendDirection.BULLISH;
  } else if (ma.sma20 < ma.sma50 && ma.sma50 < ma.sma200) {
    trend = TrendDirection.BEARISH;
  } else {
    trend = TrendDirection.SIDEWAYS;
  }

  // Calculate trend strength
  const priceAboveSma20 = candles[candles.length - 1].close > ma.sma20;
  const priceAboveSma50 = candles[candles.length - 1].close > ma.sma50;
  const priceAboveSma200 = candles[candles.length - 1].close > ma.sma200;
  const maAlignment = [priceAboveSma20, priceAboveSma50, priceAboveSma200].filter(Boolean).length;
  const strength = (maAlignment / 3) * 100;

  // RSI signal
  let rsiSignal: SignalType;
  if (indicators.rsi.value < 30) {
    rsiSignal = SignalType.BUY;
  } else if (indicators.rsi.value > 70) {
    rsiSignal = SignalType.SELL;
  } else {
    rsiSignal = SignalType.HOLD;
  }

  // MACD signal
  let macdSignal: SignalType;
  if (indicators.macd.crossover === 'bullish' || indicators.macd.histogram > 0) {
    macdSignal = SignalType.BUY;
  } else if (indicators.macd.crossover === 'bearish' || indicators.macd.histogram < 0) {
    macdSignal = SignalType.SELL;
  } else {
    macdSignal = SignalType.HOLD;
  }

  // MA signal
  let maSignal: SignalType;
  if (trend === TrendDirection.BULLISH) {
    maSignal = SignalType.BUY;
  } else if (trend === TrendDirection.BEARISH) {
    maSignal = SignalType.SELL;
  } else {
    maSignal = SignalType.HOLD;
  }

  // Calculate support/resistance from recent highs/lows
  const highs = recentCandles.map(c => c.high);
  const lows = recentCandles.map(c => c.low);
  const resistance = Math.max(...highs);
  const support = Math.min(...lows);

  // Volatility from ATR
  const volatility = indicators.atr.volatility;

  return {
    timeframe,
    trend,
    strength,
    rsiSignal,
    macdSignal,
    maSignal,
    support,
    resistance,
    volatility,
  };
}

/**
 * Combine multiple timeframe analyses
 */
export function analyzeMultiTimeframe(pair: string = 'EUR/USD'): MultiTimeframeResult {
  // Generate candles for each timeframe
  const m5Candles = generateHistoricalCandles(TimeFrame.M5, 200);
  const h1Candles = generateHistoricalCandles(TimeFrame.H1, 200);
  const d1Candles = generateHistoricalCandles(TimeFrame.D1, 200);

  // Analyze each timeframe
  const m5 = analyzeTimeframe(m5Candles, TimeFrame.M5);
  const h1 = analyzeTimeframe(h1Candles, TimeFrame.H1);
  const d1 = analyzeTimeframe(d1Candles, TimeFrame.D1);

  // Calculate overall trend (weighted: D1 > H1 > M5)
  const trendScores = {
    [TrendDirection.BULLISH]: 0,
    [TrendDirection.BEARISH]: 0,
    [TrendDirection.SIDEWAYS]: 0,
  };

  // D1 weight: 50%, H1 weight: 30%, M5 weight: 20%
  trendScores[d1.trend] += 50;
  trendScores[h1.trend] += 30;
  trendScores[m5.trend] += 20;

  const overallTrend = Object.entries(trendScores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0] as TrendDirection;

  // Check alignment
  const trends = [m5.trend, h1.trend, d1.trend];
  const allSame = trends.every(t => t === trends[0]);
  const allDifferent = new Set(trends).size === 3;
  const alignment: 'full' | 'partial' | 'conflicting' = allSame ? 'full' : allDifferent ? 'conflicting' : 'partial';

  // Calculate overall signal
  const signalScores = {
    [SignalType.BUY]: 0,
    [SignalType.SELL]: 0,
    [SignalType.HOLD]: 0,
  };

  // Count signals from all timeframes
  [m5, h1, d1].forEach((tf, idx) => {
    const weight = idx === 2 ? 3 : idx === 1 ? 2 : 1; // D1 > H1 > M5
    signalScores[tf.rsiSignal] += weight;
    signalScores[tf.macdSignal] += weight;
    signalScores[tf.maSignal] += weight;
  });

  const overallSignal = Object.entries(signalScores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0] as SignalType;

  // Calculate confidence
  const maxScore = Math.max(...Object.values(signalScores));
  const totalScore = Object.values(signalScores).reduce((a, b) => a + b, 0);
  const confidence = Math.round((maxScore / totalScore) * 100);

  // Determine strength
  let overallStrength: SignalStrength;
  if (alignment === 'full' && confidence > 70) {
    overallStrength = SignalStrength.VERY_STRONG;
  } else if (alignment === 'full' || confidence > 60) {
    overallStrength = SignalStrength.STRONG;
  } else if (alignment === 'partial' || confidence > 50) {
    overallStrength = SignalStrength.MODERATE;
  } else {
    overallStrength = SignalStrength.WEAK;
  }

  // Generate reasoning
  const reasoning: string[] = [];

  reasoning.push(`D1 (Daily): ${d1.trend.toUpperCase()} - Force ${d1.strength.toFixed(0)}%`);
  reasoning.push(`H1 (Horaire): ${h1.trend.toUpperCase()} - Force ${h1.strength.toFixed(0)}%`);
  reasoning.push(`M5 (5 min): ${m5.trend.toUpperCase()} - Force ${m5.strength.toFixed(0)}%`);

  if (alignment === 'full') {
    reasoning.push(`✅ Alignement parfait: tous les timeframes confirment ${overallTrend}`);
  } else if (alignment === 'partial') {
    reasoning.push(`⚠️ Alignement partiel: certains timeframes divergent`);
  } else {
    reasoning.push(`❌ Conflit: les timeframes montrent des tendances opposées`);
  }

  // Calculate entry zone, SL, TP
  const currentPrice = m5Candles[m5Candles.length - 1].close;
  const atr = Math.abs(h1Candles[h1Candles.length - 1].high - h1Candles[h1Candles.length - 1].low);

  let entryZone: { min: number; max: number };
  let stopLoss: number;
  let takeProfit: number[];

  if (overallSignal === SignalType.BUY) {
    entryZone = { min: currentPrice - atr * 0.3, max: currentPrice + atr * 0.2 };
    stopLoss = Math.min(m5.support, h1.support) - atr * 0.5;
    takeProfit = [
      currentPrice + atr * 1.5,
      currentPrice + atr * 2.5,
      currentPrice + atr * 4,
    ];
  } else if (overallSignal === SignalType.SELL) {
    entryZone = { min: currentPrice - atr * 0.2, max: currentPrice + atr * 0.3 };
    stopLoss = Math.max(m5.resistance, h1.resistance) + atr * 0.5;
    takeProfit = [
      currentPrice - atr * 1.5,
      currentPrice - atr * 2.5,
      currentPrice - atr * 4,
    ];
  } else {
    entryZone = { min: currentPrice - atr * 0.1, max: currentPrice + atr * 0.1 };
    stopLoss = currentPrice - atr * 2;
    takeProfit = [currentPrice + atr * 2];
  }

  return {
    m5,
    h1,
    d1,
    overallTrend,
    overallSignal,
    overallStrength,
    confidence,
    alignment,
    reasoning,
    entryZone,
    stopLoss,
    takeProfit,
  };
}

/**
 * Get trading recommendation based on multi-timeframe analysis
 */
export function getMultiTimeframeRecommendation(analysis: MultiTimeframeResult): string {
  if (analysis.alignment === 'conflicting') {
    return "⚠️ ATTENDRE - Les timeframes sont en conflit. Pas de signal clair.";
  }

  if (analysis.overallSignal === SignalType.HOLD) {
    return "⏸️ NEUTRE - Pas de direction claire. Rester en dehors du marché.";
  }

  const action = analysis.overallSignal === SignalType.BUY ? 'ACHAT' : 'VENTE';
  const emoji = analysis.overallSignal === SignalType.BUY ? '🟢' : '🔴';

  if (analysis.overallStrength === SignalStrength.VERY_STRONG) {
    return `${emoji} ${action} FORT - Signal très fiable. Alignement parfait des timeframes.`;
  } else if (analysis.overallStrength === SignalStrength.STRONG) {
    return `${emoji} ${action} - Bon signal avec confirmation multi-timeframe.`;
  } else if (analysis.overallStrength === SignalStrength.MODERATE) {
    return `${emoji} ${action} MODÉRÉ - Signal acceptable mais surveiller les timeframes divergents.`;
  } else {
    return `${emoji} ${action} FAIBLE - Signal faible. Attendre une meilleure configuration.`;
  }
}
