/**
 * Machine Learning Price Prediction Service
 * Simple ML models for price prediction using historical patterns
 */

import { Candle, TimeFrame, TrendDirection } from '../types';
import { calculateAllIndicators } from './forexService';

export interface PredictionResult {
  direction: TrendDirection;
  predictedPrice: number;
  confidence: number;
  priceChange: number;
  priceChangePercent: number;
  horizon: string; // "1h", "4h", "24h"
  features: FeatureImportance[];
  modelUsed: string;
  timestamp: Date;
}

export interface FeatureImportance {
  name: string;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
}

interface NormalizedData {
  features: number[][];
  labels: number[];
  mean: number[];
  std: number[];
}

/**
 * Extract features from candles for ML
 */
function extractFeatures(candles: Candle[]): number[][] {
  const features: number[][] = [];

  for (let i = 20; i < candles.length; i++) {
    const window = candles.slice(i - 20, i);
    const current = candles[i];

    // Price-based features
    const returns = (current.close - window[0].close) / window[0].close;
    const volatility = calculateVolatility(window);
    const momentum = (current.close - window[10].close) / window[10].close;

    // Technical indicators (simplified)
    const rsi = calculateSimpleRSI(window);
    const sma5 = window.slice(-5).reduce((sum, c) => sum + c.close, 0) / 5;
    const sma10 = window.slice(-10).reduce((sum, c) => sum + c.close, 0) / 10;
    const sma20 = window.reduce((sum, c) => sum + c.close, 0) / 20;

    // MA crossover signals
    const maCross5_10 = (sma5 - sma10) / sma10;
    const maCross10_20 = (sma10 - sma20) / sma20;

    // Price relative to MAs
    const priceToSma5 = (current.close - sma5) / sma5;
    const priceToSma20 = (current.close - sma20) / sma20;

    // Candlestick patterns (encoded)
    const bodySize = Math.abs(current.close - current.open) / current.open;
    const upperWick = (current.high - Math.max(current.open, current.close)) / current.high;
    const lowerWick = (Math.min(current.open, current.close) - current.low) / current.low;
    const isBullish = current.close > current.open ? 1 : 0;

    // Volume (if available)
    const volumeChange = window.length > 1
      ? (current.volume - window[window.length - 2].volume) / (window[window.length - 2].volume || 1)
      : 0;

    features.push([
      returns,
      volatility,
      momentum,
      rsi / 100, // Normalize to 0-1
      maCross5_10,
      maCross10_20,
      priceToSma5,
      priceToSma20,
      bodySize,
      upperWick,
      lowerWick,
      isBullish,
      volumeChange,
    ]);
  }

  return features;
}

/**
 * Calculate simple RSI
 */
function calculateSimpleRSI(candles: Candle[], period: number = 14): number {
  const changes = [];
  for (let i = 1; i < candles.length; i++) {
    changes.push(candles[i].close - candles[i - 1].close);
  }

  const gains = changes.filter(c => c > 0);
  const losses = changes.filter(c => c < 0).map(c => Math.abs(c));

  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0.001;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate volatility
 */
function calculateVolatility(candles: Candle[]): number {
  const returns: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    returns.push((candles[i].close - candles[i - 1].close) / candles[i - 1].close);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

  return Math.sqrt(variance);
}

/**
 * Normalize data for ML
 */
function normalizeData(features: number[][], labels: number[]): NormalizedData {
  const numFeatures = features[0].length;
  const mean: number[] = new Array(numFeatures).fill(0);
  const std: number[] = new Array(numFeatures).fill(0);

  // Calculate mean
  for (const row of features) {
    for (let j = 0; j < numFeatures; j++) {
      mean[j] += row[j];
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    mean[j] /= features.length;
  }

  // Calculate std
  for (const row of features) {
    for (let j = 0; j < numFeatures; j++) {
      std[j] += Math.pow(row[j] - mean[j], 2);
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    std[j] = Math.sqrt(std[j] / features.length) || 1;
  }

  // Normalize
  const normalizedFeatures = features.map(row =>
    row.map((val, j) => (val - mean[j]) / std[j])
  );

  return { features: normalizedFeatures, labels, mean, std };
}

/**
 * Simple Linear Regression model
 */
class LinearRegression {
  private weights: number[] = [];
  private bias: number = 0;

  train(X: number[][], y: number[], learningRate: number = 0.01, iterations: number = 1000): void {
    const n = X.length;
    const numFeatures = X[0].length;

    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    for (let iter = 0; iter < iterations; iter++) {
      let biasGradient = 0;
      const weightGradients = new Array(numFeatures).fill(0);

      for (let i = 0; i < n; i++) {
        const prediction = this.predict(X[i]);
        const error = prediction - y[i];

        biasGradient += error;
        for (let j = 0; j < numFeatures; j++) {
          weightGradients[j] += error * X[i][j];
        }
      }

      this.bias -= (learningRate * biasGradient) / n;
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (learningRate * weightGradients[j]) / n;
      }
    }
  }

  predict(x: number[]): number {
    let result = this.bias;
    for (let j = 0; j < x.length; j++) {
      result += this.weights[j] * x[j];
    }
    return result;
  }

  getWeights(): number[] {
    return this.weights;
  }
}

/**
 * K-Nearest Neighbors classifier
 */
class KNNClassifier {
  private X: number[][] = [];
  private y: number[] = [];
  private k: number;

  constructor(k: number = 5) {
    this.k = k;
  }

  train(X: number[][], y: number[]): void {
    this.X = X;
    this.y = y;
  }

  predict(x: number[]): number {
    const distances: { distance: number; label: number }[] = [];

    for (let i = 0; i < this.X.length; i++) {
      const distance = this.euclideanDistance(x, this.X[i]);
      distances.push({ distance, label: this.y[i] });
    }

    distances.sort((a, b) => a.distance - b.distance);
    const kNearest = distances.slice(0, this.k);

    // Vote
    const votes: Record<number, number> = {};
    for (const neighbor of kNearest) {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    }

    let maxVotes = 0;
    let prediction = 0;
    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        prediction = parseInt(label);
      }
    }

    return prediction;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }
}

/**
 * Ensemble prediction combining multiple models
 */
export function predictPrice(
  candles: Candle[],
  horizon: '1h' | '4h' | '24h' = '4h'
): PredictionResult {
  const currentPrice = candles[candles.length - 1].close;

  // Extract features
  const features = extractFeatures(candles);

  // Create labels (future returns)
  const horizonBars = horizon === '1h' ? 1 : horizon === '4h' ? 4 : 24;
  const labels: number[] = [];

  for (let i = 0; i < features.length - horizonBars; i++) {
    const futurePrice = candles[i + 20 + horizonBars]?.close || currentPrice;
    const currentP = candles[i + 20].close;
    const futureReturn = (futurePrice - currentP) / currentP;
    labels.push(futureReturn);
  }

  // Trim features to match labels
  const X = features.slice(0, labels.length);

  if (X.length < 50) {
    // Not enough data, return conservative prediction
    return {
      direction: TrendDirection.SIDEWAYS,
      predictedPrice: currentPrice,
      confidence: 30,
      priceChange: 0,
      priceChangePercent: 0,
      horizon,
      features: [],
      modelUsed: 'insufficient_data',
      timestamp: new Date(),
    };
  }

  // Normalize data
  const normalized = normalizeData(X, labels);

  // Split data
  const splitIdx = Math.floor(normalized.features.length * 0.8);
  const trainX = normalized.features.slice(0, splitIdx);
  const trainY = normalized.labels.slice(0, splitIdx);
  const testX = normalized.features.slice(splitIdx);
  const testY = normalized.labels.slice(splitIdx);

  // Train Linear Regression
  const lr = new LinearRegression();
  lr.train(trainX, trainY, 0.01, 500);

  // Train KNN for direction
  const knn = new KNNClassifier(5);
  const directionLabels = trainY.map(r => r > 0.0001 ? 1 : r < -0.0001 ? -1 : 0);
  knn.train(trainX, directionLabels);

  // Prepare current features for prediction
  const currentFeatures = features[features.length - 1];
  const normalizedCurrent = currentFeatures.map((val, j) =>
    (val - normalized.mean[j]) / normalized.std[j]
  );

  // Make predictions
  const lrPrediction = lr.predict(normalizedCurrent);
  const knnDirection = knn.predict(normalizedCurrent);

  // Combine predictions
  const predictedReturn = lrPrediction * 0.6 + (knnDirection * 0.001) * 0.4;
  const predictedPrice = currentPrice * (1 + predictedReturn);

  // Calculate confidence based on model agreement and prediction strength
  let confidence = 50;
  if (Math.sign(lrPrediction) === knnDirection) {
    confidence += 20; // Models agree
  }
  confidence += Math.min(Math.abs(predictedReturn) * 1000, 20);

  // Determine direction
  let direction: TrendDirection;
  if (predictedReturn > 0.0005) {
    direction = TrendDirection.BULLISH;
  } else if (predictedReturn < -0.0005) {
    direction = TrendDirection.BEARISH;
  } else {
    direction = TrendDirection.SIDEWAYS;
  }

  // Feature importance
  const weights = lr.getWeights();
  const featureNames = [
    'Returns', 'Volatility', 'Momentum', 'RSI',
    'MA Cross 5/10', 'MA Cross 10/20', 'Price/SMA5', 'Price/SMA20',
    'Body Size', 'Upper Wick', 'Lower Wick', 'Is Bullish', 'Volume Change'
  ];

  const featureImportance: FeatureImportance[] = featureNames.map((name, i) => ({
    name,
    value: currentFeatures[i],
    impact: weights[i] > 0.1 ? 'positive' : weights[i] < -0.1 ? 'negative' : 'neutral',
    weight: Math.abs(weights[i]),
  })).sort((a, b) => b.weight - a.weight);

  return {
    direction,
    predictedPrice,
    confidence: Math.round(Math.min(confidence, 95)),
    priceChange: predictedPrice - currentPrice,
    priceChangePercent: predictedReturn * 100,
    horizon,
    features: featureImportance.slice(0, 5),
    modelUsed: 'ensemble_lr_knn',
    timestamp: new Date(),
  };
}

/**
 * Generate multiple horizon predictions
 */
export function generatePredictions(candles: Candle[]): {
  short: PredictionResult;
  medium: PredictionResult;
  long: PredictionResult;
} {
  return {
    short: predictPrice(candles, '1h'),
    medium: predictPrice(candles, '4h'),
    long: predictPrice(candles, '24h'),
  };
}

/**
 * Get prediction summary for display
 */
export function getPredictionSummary(predictions: ReturnType<typeof generatePredictions>): string {
  const { short, medium, long } = predictions;

  let summary = '📊 Prédictions ML:\n\n';

  const format = (p: PredictionResult) => {
    const emoji = p.direction === TrendDirection.BULLISH ? '🟢' :
                  p.direction === TrendDirection.BEARISH ? '🔴' : '⚪';
    const sign = p.priceChangePercent >= 0 ? '+' : '';
    return `${emoji} ${p.horizon}: ${p.predictedPrice.toFixed(5)} (${sign}${p.priceChangePercent.toFixed(3)}%) - Confiance: ${p.confidence}%`;
  };

  summary += `Court terme:\n${format(short)}\n\n`;
  summary += `Moyen terme:\n${format(medium)}\n\n`;
  summary += `Long terme:\n${format(long)}\n\n`;

  // Overall recommendation
  const directions = [short.direction, medium.direction, long.direction];
  const bullishCount = directions.filter(d => d === TrendDirection.BULLISH).length;
  const bearishCount = directions.filter(d => d === TrendDirection.BEARISH).length;

  if (bullishCount >= 2) {
    summary += '✅ Consensus ML: HAUSSIER';
  } else if (bearishCount >= 2) {
    summary += '❌ Consensus ML: BAISSIER';
  } else {
    summary += '⚠️ Consensus ML: NEUTRE/INCERTAIN';
  }

  return summary;
}
