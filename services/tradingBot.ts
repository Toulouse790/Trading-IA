/**
 * Trading Bot Service
 * Automated trading execution based on signals and strategies
 */

import {
  TradingSignal,
  SignalType,
  SignalStrength,
  TimeFrame,
  Position,
  OrderStatus,
} from '../types';
import { getMarketData, generateHistoricalCandles, calculateAllIndicators } from './forexService';
import { analyzeMultiTimeframe, MultiTimeframeResult } from './multiTimeframeAnalysis';
import { detectPatterns, DetectedPattern } from './patternRecognition';
import { predictPrice, PredictionResult } from './mlPrediction';

export interface BotConfig {
  enabled: boolean;
  name: string;
  strategy: BotStrategy;
  pair: string;
  timeframe: TimeFrame;
  maxPositions: number;
  lotSize: number;
  maxDailyLoss: number; // in percentage
  maxDailyTrades: number;
  riskPerTrade: number; // in percentage
  useMultiTimeframe: boolean;
  usePatternRecognition: boolean;
  useMLPrediction: boolean;
  minConfidence: number;
  tradingHours: { start: number; end: number }; // 0-23
  notifications: boolean;
}

export type BotStrategy =
  | 'conservative'
  | 'moderate'
  | 'aggressive'
  | 'scalping'
  | 'swing';

export interface BotState {
  isRunning: boolean;
  lastCheck: Date | null;
  todayTrades: number;
  todayPnl: number;
  openPositions: number;
  signals: TradingSignal[];
  logs: BotLog[];
  performance: BotPerformance;
}

export interface BotLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'trade';
  message: string;
  data?: any;
}

export interface BotPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  startDate: Date;
}

export interface BotDecision {
  action: 'buy' | 'sell' | 'hold' | 'close';
  reason: string;
  confidence: number;
  signal?: TradingSignal;
  analysis: {
    multiTimeframe?: MultiTimeframeResult;
    patterns?: DetectedPattern[];
    prediction?: PredictionResult;
    indicators?: any;
  };
}

// Default bot configurations for different strategies
export const BOT_PRESETS: Record<BotStrategy, Partial<BotConfig>> = {
  conservative: {
    strategy: 'conservative',
    maxPositions: 1,
    lotSize: 0.01,
    maxDailyLoss: 2,
    maxDailyTrades: 3,
    riskPerTrade: 1,
    minConfidence: 80,
    useMultiTimeframe: true,
    usePatternRecognition: true,
    useMLPrediction: false,
  },
  moderate: {
    strategy: 'moderate',
    maxPositions: 2,
    lotSize: 0.05,
    maxDailyLoss: 3,
    maxDailyTrades: 5,
    riskPerTrade: 2,
    minConfidence: 70,
    useMultiTimeframe: true,
    usePatternRecognition: true,
    useMLPrediction: true,
  },
  aggressive: {
    strategy: 'aggressive',
    maxPositions: 3,
    lotSize: 0.1,
    maxDailyLoss: 5,
    maxDailyTrades: 10,
    riskPerTrade: 3,
    minConfidence: 60,
    useMultiTimeframe: true,
    usePatternRecognition: true,
    useMLPrediction: true,
  },
  scalping: {
    strategy: 'scalping',
    maxPositions: 2,
    lotSize: 0.1,
    maxDailyLoss: 3,
    maxDailyTrades: 20,
    riskPerTrade: 1,
    minConfidence: 65,
    useMultiTimeframe: false,
    usePatternRecognition: false,
    useMLPrediction: false,
  },
  swing: {
    strategy: 'swing',
    maxPositions: 3,
    lotSize: 0.05,
    maxDailyLoss: 4,
    maxDailyTrades: 2,
    riskPerTrade: 2,
    minConfidence: 75,
    useMultiTimeframe: true,
    usePatternRecognition: true,
    useMLPrediction: true,
  },
};

/**
 * Trading Bot class
 */
export class TradingBot {
  private config: BotConfig;
  private state: BotState;
  private interval: NodeJS.Timeout | null = null;
  private onSignal?: (signal: TradingSignal) => void;
  private onLog?: (log: BotLog) => void;

  constructor(config: Partial<BotConfig>) {
    this.config = {
      enabled: false,
      name: 'Trading Bot',
      strategy: 'moderate',
      pair: 'EUR/USD',
      timeframe: TimeFrame.H1,
      maxPositions: 2,
      lotSize: 0.1,
      maxDailyLoss: 3,
      maxDailyTrades: 5,
      riskPerTrade: 2,
      useMultiTimeframe: true,
      usePatternRecognition: true,
      useMLPrediction: true,
      minConfidence: 70,
      tradingHours: { start: 8, end: 20 },
      notifications: true,
      ...BOT_PRESETS[config.strategy || 'moderate'],
      ...config,
    };

    this.state = {
      isRunning: false,
      lastCheck: null,
      todayTrades: 0,
      todayPnl: 0,
      openPositions: 0,
      signals: [],
      logs: [],
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnl: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        startDate: new Date(),
      },
    };
  }

  /**
   * Start the bot
   */
  start(): void {
    if (this.state.isRunning) {
      this.log('warning', 'Bot déjà en cours d\'exécution');
      return;
    }

    this.state.isRunning = true;
    this.log('info', `🤖 Bot "${this.config.name}" démarré - Stratégie: ${this.config.strategy}`);

    // Run analysis every minute
    this.interval = setInterval(() => this.analyze(), 60000);

    // Run initial analysis
    this.analyze();
  }

  /**
   * Stop the bot
   */
  stop(): void {
    if (!this.state.isRunning) {
      return;
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.state.isRunning = false;
    this.log('info', `🛑 Bot "${this.config.name}" arrêté`);
  }

  /**
   * Set callback for new signals
   */
  onNewSignal(callback: (signal: TradingSignal) => void): void {
    this.onSignal = callback;
  }

  /**
   * Set callback for logs
   */
  onNewLog(callback: (log: BotLog) => void): void {
    this.onLog = callback;
  }

  /**
   * Main analysis loop
   */
  private async analyze(): Promise<void> {
    try {
      // Check trading hours
      const currentHour = new Date().getHours();
      if (currentHour < this.config.tradingHours.start ||
          currentHour >= this.config.tradingHours.end) {
        this.log('info', 'Hors des heures de trading');
        return;
      }

      // Check daily limits
      if (this.state.todayTrades >= this.config.maxDailyTrades) {
        this.log('warning', 'Limite de trades journaliers atteinte');
        return;
      }

      if (this.state.todayPnl <= -this.config.maxDailyLoss) {
        this.log('warning', 'Perte journalière maximum atteinte');
        return;
      }

      // Check open positions
      if (this.state.openPositions >= this.config.maxPositions) {
        this.log('info', 'Nombre maximum de positions ouvertes');
        return;
      }

      // Make trading decision
      const decision = await this.makeDecision();
      this.state.lastCheck = new Date();

      if (decision.action === 'hold') {
        return;
      }

      if (decision.confidence < this.config.minConfidence) {
        this.log('info', `Signal ignoré - Confiance ${decision.confidence}% < ${this.config.minConfidence}%`);
        return;
      }

      if (decision.signal && (decision.action === 'buy' || decision.action === 'sell')) {
        this.log('trade', `📊 Signal ${decision.action.toUpperCase()}: ${decision.reason}`, decision);
        this.state.signals.push(decision.signal);
        this.state.todayTrades++;

        if (this.onSignal) {
          this.onSignal(decision.signal);
        }
      }
    } catch (error) {
      this.log('error', `Erreur d'analyse: ${error}`);
    }
  }

  /**
   * Make trading decision based on all available analysis
   */
  private async makeDecision(): Promise<BotDecision> {
    const candles = generateHistoricalCandles(this.config.timeframe, 300);
    const indicators = calculateAllIndicators(candles);
    const market = getMarketData();

    let confidence = 50;
    let signal: SignalType = SignalType.HOLD;
    const reasons: string[] = [];
    const analysis: BotDecision['analysis'] = { indicators };

    // Multi-timeframe analysis
    if (this.config.useMultiTimeframe) {
      const mtf = analyzeMultiTimeframe(this.config.pair);
      analysis.multiTimeframe = mtf;

      if (mtf.alignment === 'full') {
        confidence += 20;
        signal = mtf.overallSignal;
        reasons.push(`MTF: ${mtf.alignment} alignment - ${mtf.overallSignal}`);
      } else if (mtf.alignment === 'partial') {
        confidence += 10;
        reasons.push('MTF: Alignement partiel');
      } else {
        confidence -= 15;
        reasons.push('MTF: Conflits entre timeframes');
      }
    }

    // Pattern recognition
    if (this.config.usePatternRecognition) {
      const patterns = detectPatterns(candles);
      analysis.patterns = patterns;

      const highConfPatterns = patterns.filter(p => p.confidence >= 70);
      if (highConfPatterns.length > 0) {
        const topPattern = highConfPatterns[0];
        confidence += 15;
        if (topPattern.signal !== SignalType.HOLD) {
          if (signal === SignalType.HOLD) {
            signal = topPattern.signal;
          } else if (signal === topPattern.signal) {
            confidence += 10; // Confirmation
          } else {
            confidence -= 10; // Conflict
          }
        }
        reasons.push(`Pattern: ${topPattern.name} (${topPattern.confidence}%)`);
      }
    }

    // ML Prediction
    if (this.config.useMLPrediction) {
      const prediction = predictPrice(candles, '4h');
      analysis.prediction = prediction;

      if (prediction.confidence > 60) {
        confidence += 10;
        const predSignal = prediction.direction === 'bullish' ? SignalType.BUY :
                          prediction.direction === 'bearish' ? SignalType.SELL :
                          SignalType.HOLD;

        if (signal === SignalType.HOLD) {
          signal = predSignal;
        } else if (signal === predSignal) {
          confidence += 10; // Confirmation
        } else {
          confidence -= 10; // Conflict
        }
        reasons.push(`ML: ${prediction.direction} (${prediction.confidence}%)`);
      }
    }

    // RSI check
    if (indicators.rsi.oversold && signal !== SignalType.SELL) {
      confidence += 5;
      reasons.push('RSI: Survente');
    } else if (indicators.rsi.overbought && signal !== SignalType.BUY) {
      confidence += 5;
      reasons.push('RSI: Surachat');
    }

    // MACD check
    if (indicators.macd.crossover === 'bullish' && signal === SignalType.BUY) {
      confidence += 5;
      reasons.push('MACD: Croisement haussier');
    } else if (indicators.macd.crossover === 'bearish' && signal === SignalType.SELL) {
      confidence += 5;
      reasons.push('MACD: Croisement baissier');
    }

    // Clamp confidence
    confidence = Math.max(0, Math.min(100, confidence));

    // Create signal if action is needed
    let tradingSignal: TradingSignal | undefined;
    if (signal !== SignalType.HOLD && confidence >= this.config.minConfidence) {
      const atr = indicators.atr.value;
      const currentPrice = market.currentPrice;

      tradingSignal = {
        id: `bot_${Date.now()}`,
        timestamp: new Date(),
        pair: this.config.pair,
        type: signal,
        strength: confidence >= 80 ? SignalStrength.VERY_STRONG :
                  confidence >= 70 ? SignalStrength.STRONG :
                  confidence >= 60 ? SignalStrength.MODERATE :
                  SignalStrength.WEAK,
        entryPrice: currentPrice,
        stopLoss: signal === SignalType.BUY
          ? currentPrice - atr * 2
          : currentPrice + atr * 2,
        takeProfit: signal === SignalType.BUY
          ? [currentPrice + atr * 3, currentPrice + atr * 5]
          : [currentPrice - atr * 3, currentPrice - atr * 5],
        riskRewardRatio: 1.5,
        confidence,
        timeframe: this.config.timeframe,
        reasoning: reasons.join(' | '),
        indicators: Object.keys(indicators),
        aiAnalysis: `Bot ${this.config.strategy}: ${reasons.join(', ')}`,
        status: 'active',
      };
    }

    return {
      action: signal === SignalType.BUY ? 'buy' :
              signal === SignalType.SELL ? 'sell' : 'hold',
      reason: reasons.join(' | ') || 'Pas de signal clair',
      confidence,
      signal: tradingSignal,
      analysis,
    };
  }

  /**
   * Log a message
   */
  private log(level: BotLog['level'], message: string, data?: any): void {
    const log: BotLog = {
      timestamp: new Date(),
      level,
      message,
      data,
    };

    this.state.logs.unshift(log);
    this.state.logs = this.state.logs.slice(0, 100); // Keep last 100 logs

    if (this.onLog) {
      this.onLog(log);
    }

    console.log(`[Bot ${level.toUpperCase()}] ${message}`);
  }

  /**
   * Get current config
   */
  getConfig(): BotConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<BotConfig>): void {
    this.config = { ...this.config, ...config };
    this.log('info', 'Configuration mise à jour');
  }

  /**
   * Get current state
   */
  getState(): BotState {
    return { ...this.state };
  }

  /**
   * Reset daily counters (call at midnight)
   */
  resetDailyCounters(): void {
    this.state.todayTrades = 0;
    this.state.todayPnl = 0;
    this.log('info', 'Compteurs journaliers réinitialisés');
  }

  /**
   * Update performance after a trade closes
   */
  updatePerformance(pnl: number, isWin: boolean): void {
    const perf = this.state.performance;
    perf.totalTrades++;
    perf.totalPnl += pnl;
    this.state.todayPnl += pnl;

    if (isWin) {
      perf.winningTrades++;
      perf.averageWin = (perf.averageWin * (perf.winningTrades - 1) + pnl) / perf.winningTrades;
    } else {
      perf.losingTrades++;
      perf.averageLoss = (perf.averageLoss * (perf.losingTrades - 1) + Math.abs(pnl)) / perf.losingTrades;
    }

    perf.winRate = (perf.winningTrades / perf.totalTrades) * 100;

    if (perf.averageLoss > 0) {
      perf.profitFactor = (perf.winningTrades * perf.averageWin) /
                          (perf.losingTrades * perf.averageLoss);
    }
  }
}

// Singleton instance
let botInstance: TradingBot | null = null;

export function getTradingBot(config?: Partial<BotConfig>): TradingBot {
  if (!botInstance) {
    botInstance = new TradingBot(config || {});
  }
  return botInstance;
}

export function resetTradingBot(): void {
  if (botInstance) {
    botInstance.stop();
    botInstance = null;
  }
}
