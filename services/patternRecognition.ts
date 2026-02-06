/**
 * Chart Pattern Recognition Service
 * Detects common chart patterns: Head & Shoulders, Double Top/Bottom, Triangles, etc.
 */

import { Candle, SignalType, TrendDirection } from '../types';

export enum PatternType {
  // Reversal patterns
  HEAD_AND_SHOULDERS = 'head_and_shoulders',
  INVERSE_HEAD_AND_SHOULDERS = 'inverse_head_and_shoulders',
  DOUBLE_TOP = 'double_top',
  DOUBLE_BOTTOM = 'double_bottom',
  TRIPLE_TOP = 'triple_top',
  TRIPLE_BOTTOM = 'triple_bottom',

  // Continuation patterns
  ASCENDING_TRIANGLE = 'ascending_triangle',
  DESCENDING_TRIANGLE = 'descending_triangle',
  SYMMETRICAL_TRIANGLE = 'symmetrical_triangle',
  BULL_FLAG = 'bull_flag',
  BEAR_FLAG = 'bear_flag',
  WEDGE_UP = 'wedge_up',
  WEDGE_DOWN = 'wedge_down',

  // Candlestick patterns
  DOJI = 'doji',
  HAMMER = 'hammer',
  SHOOTING_STAR = 'shooting_star',
  ENGULFING_BULLISH = 'engulfing_bullish',
  ENGULFING_BEARISH = 'engulfing_bearish',
  MORNING_STAR = 'morning_star',
  EVENING_STAR = 'evening_star',
  THREE_WHITE_SOLDIERS = 'three_white_soldiers',
  THREE_BLACK_CROWS = 'three_black_crows',
}

export interface DetectedPattern {
  type: PatternType;
  name: string;
  description: string;
  startIndex: number;
  endIndex: number;
  confidence: number; // 0-100
  signal: SignalType;
  targetPrice: number;
  stopLoss: number;
  reliability: 'high' | 'medium' | 'low';
  points: { index: number; price: number; label: string }[];
}

/**
 * Find local peaks (highs)
 */
function findPeaks(candles: Candle[], windowSize: number = 5): number[] {
  const peaks: number[] = [];
  for (let i = windowSize; i < candles.length - windowSize; i++) {
    const current = candles[i].high;
    let isPeak = true;
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && candles[j].high >= current) {
        isPeak = false;
        break;
      }
    }
    if (isPeak) peaks.push(i);
  }
  return peaks;
}

/**
 * Find local troughs (lows)
 */
function findTroughs(candles: Candle[], windowSize: number = 5): number[] {
  const troughs: number[] = [];
  for (let i = windowSize; i < candles.length - windowSize; i++) {
    const current = candles[i].low;
    let isTrough = true;
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      if (j !== i && candles[j].low <= current) {
        isTrough = false;
        break;
      }
    }
    if (isTrough) troughs.push(i);
  }
  return troughs;
}

/**
 * Detect Head and Shoulders pattern
 */
function detectHeadAndShoulders(candles: Candle[], peaks: number[]): DetectedPattern | null {
  if (peaks.length < 3) return null;

  // Look for pattern in recent peaks
  for (let i = peaks.length - 1; i >= 2; i--) {
    const rightShoulder = peaks[i];
    const head = peaks[i - 1];
    const leftShoulder = peaks[i - 2];

    const leftPrice = candles[leftShoulder].high;
    const headPrice = candles[head].high;
    const rightPrice = candles[rightShoulder].high;

    // Head should be higher than both shoulders
    if (headPrice > leftPrice && headPrice > rightPrice) {
      // Shoulders should be roughly equal (within 2%)
      const shoulderDiff = Math.abs(leftPrice - rightPrice) / leftPrice;
      if (shoulderDiff < 0.02) {
        // Calculate neckline
        const necklinePrice = Math.min(
          candles.slice(leftShoulder, head).reduce((min, c) => Math.min(min, c.low), Infinity),
          candles.slice(head, rightShoulder).reduce((min, c) => Math.min(min, c.low), Infinity)
        );

        // Calculate target (height of pattern)
        const patternHeight = headPrice - necklinePrice;
        const targetPrice = necklinePrice - patternHeight;

        return {
          type: PatternType.HEAD_AND_SHOULDERS,
          name: 'Head and Shoulders',
          description: 'Pattern de retournement baissier. Trois sommets avec le sommet central plus haut.',
          startIndex: leftShoulder,
          endIndex: rightShoulder,
          confidence: 75 + Math.round((1 - shoulderDiff) * 25),
          signal: SignalType.SELL,
          targetPrice,
          stopLoss: headPrice + patternHeight * 0.1,
          reliability: 'high',
          points: [
            { index: leftShoulder, price: leftPrice, label: 'Épaule Gauche' },
            { index: head, price: headPrice, label: 'Tête' },
            { index: rightShoulder, price: rightPrice, label: 'Épaule Droite' },
          ],
        };
      }
    }
  }
  return null;
}

/**
 * Detect Inverse Head and Shoulders pattern
 */
function detectInverseHeadAndShoulders(candles: Candle[], troughs: number[]): DetectedPattern | null {
  if (troughs.length < 3) return null;

  for (let i = troughs.length - 1; i >= 2; i--) {
    const rightShoulder = troughs[i];
    const head = troughs[i - 1];
    const leftShoulder = troughs[i - 2];

    const leftPrice = candles[leftShoulder].low;
    const headPrice = candles[head].low;
    const rightPrice = candles[rightShoulder].low;

    if (headPrice < leftPrice && headPrice < rightPrice) {
      const shoulderDiff = Math.abs(leftPrice - rightPrice) / leftPrice;
      if (shoulderDiff < 0.02) {
        const necklinePrice = Math.max(
          candles.slice(leftShoulder, head).reduce((max, c) => Math.max(max, c.high), 0),
          candles.slice(head, rightShoulder).reduce((max, c) => Math.max(max, c.high), 0)
        );

        const patternHeight = necklinePrice - headPrice;
        const targetPrice = necklinePrice + patternHeight;

        return {
          type: PatternType.INVERSE_HEAD_AND_SHOULDERS,
          name: 'Inverse Head and Shoulders',
          description: 'Pattern de retournement haussier. Trois creux avec le creux central plus bas.',
          startIndex: leftShoulder,
          endIndex: rightShoulder,
          confidence: 75 + Math.round((1 - shoulderDiff) * 25),
          signal: SignalType.BUY,
          targetPrice,
          stopLoss: headPrice - patternHeight * 0.1,
          reliability: 'high',
          points: [
            { index: leftShoulder, price: leftPrice, label: 'Épaule Gauche' },
            { index: head, price: headPrice, label: 'Tête' },
            { index: rightShoulder, price: rightPrice, label: 'Épaule Droite' },
          ],
        };
      }
    }
  }
  return null;
}

/**
 * Detect Double Top pattern
 */
function detectDoubleTop(candles: Candle[], peaks: number[]): DetectedPattern | null {
  if (peaks.length < 2) return null;

  for (let i = peaks.length - 1; i >= 1; i--) {
    const peak2 = peaks[i];
    const peak1 = peaks[i - 1];

    const price1 = candles[peak1].high;
    const price2 = candles[peak2].high;

    // Peaks should be roughly equal (within 1.5%)
    const priceDiff = Math.abs(price1 - price2) / price1;
    if (priceDiff < 0.015) {
      // Find the trough between peaks
      const troughPrice = candles.slice(peak1, peak2).reduce((min, c) => Math.min(min, c.low), Infinity);
      const patternHeight = Math.max(price1, price2) - troughPrice;
      const targetPrice = troughPrice - patternHeight;

      return {
        type: PatternType.DOUBLE_TOP,
        name: 'Double Top',
        description: 'Pattern de retournement baissier. Deux sommets au même niveau.',
        startIndex: peak1,
        endIndex: peak2,
        confidence: 70 + Math.round((1 - priceDiff) * 30),
        signal: SignalType.SELL,
        targetPrice,
        stopLoss: Math.max(price1, price2) + patternHeight * 0.1,
        reliability: 'high',
        points: [
          { index: peak1, price: price1, label: 'Top 1' },
          { index: peak2, price: price2, label: 'Top 2' },
        ],
      };
    }
  }
  return null;
}

/**
 * Detect Double Bottom pattern
 */
function detectDoubleBottom(candles: Candle[], troughs: number[]): DetectedPattern | null {
  if (troughs.length < 2) return null;

  for (let i = troughs.length - 1; i >= 1; i--) {
    const trough2 = troughs[i];
    const trough1 = troughs[i - 1];

    const price1 = candles[trough1].low;
    const price2 = candles[trough2].low;

    const priceDiff = Math.abs(price1 - price2) / price1;
    if (priceDiff < 0.015) {
      const peakPrice = candles.slice(trough1, trough2).reduce((max, c) => Math.max(max, c.high), 0);
      const patternHeight = peakPrice - Math.min(price1, price2);
      const targetPrice = peakPrice + patternHeight;

      return {
        type: PatternType.DOUBLE_BOTTOM,
        name: 'Double Bottom',
        description: 'Pattern de retournement haussier. Deux creux au même niveau.',
        startIndex: trough1,
        endIndex: trough2,
        confidence: 70 + Math.round((1 - priceDiff) * 30),
        signal: SignalType.BUY,
        targetPrice,
        stopLoss: Math.min(price1, price2) - patternHeight * 0.1,
        reliability: 'high',
        points: [
          { index: trough1, price: price1, label: 'Bottom 1' },
          { index: trough2, price: price2, label: 'Bottom 2' },
        ],
      };
    }
  }
  return null;
}

/**
 * Detect candlestick patterns
 */
function detectCandlestickPatterns(candles: Candle[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const len = candles.length;

  if (len < 3) return patterns;

  const current = candles[len - 1];
  const prev = candles[len - 2];
  const prev2 = candles[len - 3];

  const bodySize = Math.abs(current.close - current.open);
  const totalRange = current.high - current.low;
  const upperWick = current.high - Math.max(current.open, current.close);
  const lowerWick = Math.min(current.open, current.close) - current.low;

  // Doji
  if (bodySize < totalRange * 0.1 && totalRange > 0) {
    patterns.push({
      type: PatternType.DOJI,
      name: 'Doji',
      description: 'Indécision du marché. Ouverture et clôture presque identiques.',
      startIndex: len - 1,
      endIndex: len - 1,
      confidence: 60,
      signal: SignalType.HOLD,
      targetPrice: current.close,
      stopLoss: current.low,
      reliability: 'medium',
      points: [{ index: len - 1, price: current.close, label: 'Doji' }],
    });
  }

  // Hammer (bullish)
  if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5 && current.close > current.open) {
    patterns.push({
      type: PatternType.HAMMER,
      name: 'Hammer',
      description: 'Pattern de retournement haussier. Longue mèche basse.',
      startIndex: len - 1,
      endIndex: len - 1,
      confidence: 65,
      signal: SignalType.BUY,
      targetPrice: current.high + (current.high - current.low),
      stopLoss: current.low,
      reliability: 'medium',
      points: [{ index: len - 1, price: current.close, label: 'Hammer' }],
    });
  }

  // Shooting Star (bearish)
  if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5 && current.close < current.open) {
    patterns.push({
      type: PatternType.SHOOTING_STAR,
      name: 'Shooting Star',
      description: 'Pattern de retournement baissier. Longue mèche haute.',
      startIndex: len - 1,
      endIndex: len - 1,
      confidence: 65,
      signal: SignalType.SELL,
      targetPrice: current.low - (current.high - current.low),
      stopLoss: current.high,
      reliability: 'medium',
      points: [{ index: len - 1, price: current.close, label: 'Shooting Star' }],
    });
  }

  // Bullish Engulfing
  const prevBody = Math.abs(prev.close - prev.open);
  if (prev.close < prev.open && // Previous bearish
      current.close > current.open && // Current bullish
      current.open < prev.close && // Opens below previous close
      current.close > prev.open) { // Closes above previous open
    patterns.push({
      type: PatternType.ENGULFING_BULLISH,
      name: 'Bullish Engulfing',
      description: 'Pattern de retournement haussier fort. La bougie englobe la précédente.',
      startIndex: len - 2,
      endIndex: len - 1,
      confidence: 75,
      signal: SignalType.BUY,
      targetPrice: current.high + prevBody,
      stopLoss: Math.min(prev.low, current.low),
      reliability: 'high',
      points: [
        { index: len - 2, price: prev.close, label: 'Engulfed' },
        { index: len - 1, price: current.close, label: 'Engulfing' },
      ],
    });
  }

  // Bearish Engulfing
  if (prev.close > prev.open && // Previous bullish
      current.close < current.open && // Current bearish
      current.open > prev.close && // Opens above previous close
      current.close < prev.open) { // Closes below previous open
    patterns.push({
      type: PatternType.ENGULFING_BEARISH,
      name: 'Bearish Engulfing',
      description: 'Pattern de retournement baissier fort. La bougie englobe la précédente.',
      startIndex: len - 2,
      endIndex: len - 1,
      confidence: 75,
      signal: SignalType.SELL,
      targetPrice: current.low - prevBody,
      stopLoss: Math.max(prev.high, current.high),
      reliability: 'high',
      points: [
        { index: len - 2, price: prev.close, label: 'Engulfed' },
        { index: len - 1, price: current.close, label: 'Engulfing' },
      ],
    });
  }

  // Three White Soldiers
  if (len >= 3) {
    const c1 = candles[len - 3];
    const c2 = candles[len - 2];
    const c3 = candles[len - 1];

    if (c1.close > c1.open && c2.close > c2.open && c3.close > c3.open && // All bullish
        c2.open > c1.open && c2.close > c1.close && // Rising pattern
        c3.open > c2.open && c3.close > c2.close) {
      patterns.push({
        type: PatternType.THREE_WHITE_SOLDIERS,
        name: 'Three White Soldiers',
        description: 'Pattern de continuation haussier très fort. Trois bougies haussières consécutives.',
        startIndex: len - 3,
        endIndex: len - 1,
        confidence: 85,
        signal: SignalType.BUY,
        targetPrice: c3.close + (c3.close - c1.open),
        stopLoss: c1.low,
        reliability: 'high',
        points: [
          { index: len - 3, price: c1.close, label: 'Soldier 1' },
          { index: len - 2, price: c2.close, label: 'Soldier 2' },
          { index: len - 1, price: c3.close, label: 'Soldier 3' },
        ],
      });
    }
  }

  // Three Black Crows
  if (len >= 3) {
    const c1 = candles[len - 3];
    const c2 = candles[len - 2];
    const c3 = candles[len - 1];

    if (c1.close < c1.open && c2.close < c2.open && c3.close < c3.open && // All bearish
        c2.open < c1.open && c2.close < c1.close && // Falling pattern
        c3.open < c2.open && c3.close < c2.close) {
      patterns.push({
        type: PatternType.THREE_BLACK_CROWS,
        name: 'Three Black Crows',
        description: 'Pattern de continuation baissier très fort. Trois bougies baissières consécutives.',
        startIndex: len - 3,
        endIndex: len - 1,
        confidence: 85,
        signal: SignalType.SELL,
        targetPrice: c3.close - (c1.open - c3.close),
        stopLoss: c1.high,
        reliability: 'high',
        points: [
          { index: len - 3, price: c1.close, label: 'Crow 1' },
          { index: len - 2, price: c2.close, label: 'Crow 2' },
          { index: len - 1, price: c3.close, label: 'Crow 3' },
        ],
      });
    }
  }

  return patterns;
}

/**
 * Detect triangle patterns
 */
function detectTriangles(candles: Candle[], peaks: number[], troughs: number[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (peaks.length < 2 || troughs.length < 2) return patterns;

  // Get recent peaks and troughs
  const recentPeaks = peaks.slice(-3);
  const recentTroughs = troughs.slice(-3);

  if (recentPeaks.length >= 2 && recentTroughs.length >= 2) {
    const peak1Price = candles[recentPeaks[0]].high;
    const peak2Price = candles[recentPeaks[recentPeaks.length - 1]].high;
    const trough1Price = candles[recentTroughs[0]].low;
    const trough2Price = candles[recentTroughs[recentTroughs.length - 1]].low;

    const peakSlope = (peak2Price - peak1Price) / (recentPeaks[recentPeaks.length - 1] - recentPeaks[0]);
    const troughSlope = (trough2Price - trough1Price) / (recentTroughs[recentTroughs.length - 1] - recentTroughs[0]);

    const currentPrice = candles[candles.length - 1].close;

    // Ascending Triangle: flat top, rising bottom
    if (Math.abs(peakSlope) < 0.0001 && troughSlope > 0.0001) {
      patterns.push({
        type: PatternType.ASCENDING_TRIANGLE,
        name: 'Ascending Triangle',
        description: 'Triangle ascendant - Pattern de continuation haussier.',
        startIndex: Math.min(recentPeaks[0], recentTroughs[0]),
        endIndex: candles.length - 1,
        confidence: 70,
        signal: SignalType.BUY,
        targetPrice: peak1Price + (peak1Price - trough1Price),
        stopLoss: trough2Price,
        reliability: 'medium',
        points: [
          { index: recentPeaks[0], price: peak1Price, label: 'Resistance' },
          { index: recentTroughs[0], price: trough1Price, label: 'Support 1' },
          { index: recentTroughs[recentTroughs.length - 1], price: trough2Price, label: 'Support 2' },
        ],
      });
    }

    // Descending Triangle: falling top, flat bottom
    if (peakSlope < -0.0001 && Math.abs(troughSlope) < 0.0001) {
      patterns.push({
        type: PatternType.DESCENDING_TRIANGLE,
        name: 'Descending Triangle',
        description: 'Triangle descendant - Pattern de continuation baissier.',
        startIndex: Math.min(recentPeaks[0], recentTroughs[0]),
        endIndex: candles.length - 1,
        confidence: 70,
        signal: SignalType.SELL,
        targetPrice: trough1Price - (peak1Price - trough1Price),
        stopLoss: peak2Price,
        reliability: 'medium',
        points: [
          { index: recentPeaks[0], price: peak1Price, label: 'Resistance 1' },
          { index: recentPeaks[recentPeaks.length - 1], price: peak2Price, label: 'Resistance 2' },
          { index: recentTroughs[0], price: trough1Price, label: 'Support' },
        ],
      });
    }

    // Symmetrical Triangle: converging
    if (peakSlope < -0.0001 && troughSlope > 0.0001) {
      patterns.push({
        type: PatternType.SYMMETRICAL_TRIANGLE,
        name: 'Symmetrical Triangle',
        description: 'Triangle symétrique - Attendre la cassure pour confirmer la direction.',
        startIndex: Math.min(recentPeaks[0], recentTroughs[0]),
        endIndex: candles.length - 1,
        confidence: 60,
        signal: SignalType.HOLD,
        targetPrice: currentPrice,
        stopLoss: trough2Price,
        reliability: 'medium',
        points: [
          { index: recentPeaks[0], price: peak1Price, label: 'High 1' },
          { index: recentPeaks[recentPeaks.length - 1], price: peak2Price, label: 'High 2' },
          { index: recentTroughs[0], price: trough1Price, label: 'Low 1' },
          { index: recentTroughs[recentTroughs.length - 1], price: trough2Price, label: 'Low 2' },
        ],
      });
    }
  }

  return patterns;
}

/**
 * Main function to detect all patterns
 */
export function detectPatterns(candles: Candle[]): DetectedPattern[] {
  if (candles.length < 20) return [];

  const patterns: DetectedPattern[] = [];

  // Find peaks and troughs
  const peaks = findPeaks(candles);
  const troughs = findTroughs(candles);

  // Detect chart patterns
  const headAndShoulders = detectHeadAndShoulders(candles, peaks);
  if (headAndShoulders) patterns.push(headAndShoulders);

  const inverseHeadAndShoulders = detectInverseHeadAndShoulders(candles, troughs);
  if (inverseHeadAndShoulders) patterns.push(inverseHeadAndShoulders);

  const doubleTop = detectDoubleTop(candles, peaks);
  if (doubleTop) patterns.push(doubleTop);

  const doubleBottom = detectDoubleBottom(candles, troughs);
  if (doubleBottom) patterns.push(doubleBottom);

  // Detect triangle patterns
  const triangles = detectTriangles(candles, peaks, troughs);
  patterns.push(...triangles);

  // Detect candlestick patterns
  const candlestickPatterns = detectCandlestickPatterns(candles);
  patterns.push(...candlestickPatterns);

  // Sort by confidence
  patterns.sort((a, b) => b.confidence - a.confidence);

  return patterns;
}

/**
 * Get pattern summary for display
 */
export function getPatternSummary(patterns: DetectedPattern[]): string {
  if (patterns.length === 0) {
    return "Aucun pattern détecté sur la période analysée.";
  }

  const bullishPatterns = patterns.filter(p => p.signal === SignalType.BUY);
  const bearishPatterns = patterns.filter(p => p.signal === SignalType.SELL);

  let summary = `${patterns.length} pattern(s) détecté(s):\n`;

  if (bullishPatterns.length > 0) {
    summary += `\n🟢 Haussiers (${bullishPatterns.length}): ${bullishPatterns.map(p => p.name).join(', ')}`;
  }

  if (bearishPatterns.length > 0) {
    summary += `\n🔴 Baissiers (${bearishPatterns.length}): ${bearishPatterns.map(p => p.name).join(', ')}`;
  }

  const highConfidence = patterns.filter(p => p.confidence >= 70);
  if (highConfidence.length > 0) {
    summary += `\n\n⭐ Pattern le plus fiable: ${highConfidence[0].name} (${highConfidence[0].confidence}% confiance)`;
  }

  return summary;
}
