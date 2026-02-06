/**
 * Trading-IA - Types pour la plateforme de trading Forex EUR/USD
 */

// ============================================
// ENUMS
// ============================================

export enum AppState {
  IDLE = 'idle',
  LOADING = 'loading',
  ANALYZING = 'analyzing',
  BACKTESTING = 'backtesting',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum View {
  DASHBOARD = 'dashboard',
  TRADING = 'trading',
  SIGNALS = 'signals',
  BACKTESTING = 'backtesting',
  PORTFOLIO = 'portfolio',
  SETTINGS = 'settings',
  ADVANCED = 'advanced',
  BOT = 'bot',
  JOURNAL = 'journal',
  MULTI_PAIR = 'multi_pair',
}

export enum TimeFrame {
  M1 = '1m',
  M5 = '5m',
  M15 = '15m',
  M30 = '30m',
  H1 = '1h',
  H4 = '4h',
  D1 = '1d',
  W1 = '1w',
}

export enum SignalType {
  BUY = 'buy',
  SELL = 'sell',
  HOLD = 'hold',
}

export enum SignalStrength {
  WEAK = 'weak',
  MODERATE = 'moderate',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
}

export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum TrendDirection {
  BULLISH = 'bullish',
  BEARISH = 'bearish',
  SIDEWAYS = 'sideways',
}

// ============================================
// FOREX DATA TYPES
// ============================================

export interface Candle {
  timestamp: number;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Tick {
  timestamp: number;
  bid: number;
  ask: number;
  spread: number;
}

export interface ForexPair {
  symbol: string;
  base: string;
  quote: string;
  pipValue: number;
  lotSize: number;
  minLot: number;
  maxLot: number;
  spread: number;
}

export interface MarketData {
  pair: ForexPair;
  currentPrice: number;
  bid: number;
  ask: number;
  spread: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: Date;
}

// ============================================
// TECHNICAL INDICATORS
// ============================================

export interface RSIData {
  value: number;
  overbought: boolean;
  oversold: boolean;
  signal: SignalType;
}

export interface MACDData {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'bullish' | 'bearish' | 'none';
}

export interface BollingerBandsData {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number;
}

export interface MovingAverageData {
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  trend: TrendDirection;
}

export interface StochasticData {
  k: number;
  d: number;
  overbought: boolean;
  oversold: boolean;
}

export interface ATRData {
  value: number;
  volatility: 'low' | 'medium' | 'high';
}

export interface PivotPoints {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

export interface FibonacciLevels {
  level0: number;
  level236: number;
  level382: number;
  level500: number;
  level618: number;
  level786: number;
  level1000: number;
}

export interface TechnicalIndicators {
  rsi: RSIData;
  macd: MACDData;
  bollingerBands: BollingerBandsData;
  movingAverages: MovingAverageData;
  stochastic: StochasticData;
  atr: ATRData;
  pivotPoints: PivotPoints;
  fibonacci: FibonacciLevels;
}

// ============================================
// TRADING SIGNALS
// ============================================

export interface TradingSignal {
  id: string;
  timestamp: Date;
  pair: string;
  type: SignalType;
  strength: SignalStrength;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number[];
  riskRewardRatio: number;
  confidence: number;
  timeframe: TimeFrame;
  reasoning: string;
  indicators: string[];
  aiAnalysis?: string;
  expiresAt?: Date;
  status: 'active' | 'executed' | 'expired' | 'cancelled';
}

export interface AIAnalysis {
  summary: string;
  trend: TrendDirection;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  recommendation: SignalType;
  confidence: number;
  reasoning: string[];
  risks: string[];
  opportunities: string[];
  shortTermOutlook: string;
  longTermOutlook: string;
  timestamp: Date;
}

// ============================================
// PORTFOLIO & POSITIONS
// ============================================

export interface Position {
  id: string;
  pair: string;
  type: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  openTime: Date;
  pnl: number;
  pnlPercent: number;
  commission: number;
  swap: number;
  status: OrderStatus;
}

export interface Order {
  id: string;
  pair: string;
  type: OrderType;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  lotSize: number;
  stopLoss: number | null;
  takeProfit: number | null;
  status: OrderStatus;
  createdAt: Date;
  executedAt: Date | null;
  filledPrice: number | null;
}

export interface Trade {
  id: string;
  pair: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  lotSize: number;
  entryTime: Date;
  exitTime: Date;
  pnl: number;
  pnlPercent: number;
  commission: number;
  swap: number;
  duration: number;
  signalId?: string;
}

export interface Portfolio {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  positions: Position[];
  pendingOrders: Order[];
  tradeHistory: Trade[];
}

// ============================================
// BACKTESTING
// ============================================

export interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  indicators: string[];
  entryConditions: string[];
  exitConditions: string[];
  stopLossType: 'fixed' | 'atr' | 'percentage';
  stopLossValue: number;
  takeProfitType: 'fixed' | 'atr' | 'percentage' | 'risk_reward';
  takeProfitValue: number;
  riskPerTrade: number;
  maxOpenPositions: number;
  timeframes: TimeFrame[];
}

export interface BacktestConfig {
  strategy: BacktestStrategy;
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  leverage: number;
  commission: number;
  spread: number;
  slippage: number;
}

export interface BacktestTrade {
  entryTime: Date;
  exitTime: Date;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  pnl: number;
  pnlPercent: number;
  drawdown: number;
  reason: string;
}

export interface BacktestMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  recoveryFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  averageHoldingTime: number;
  expectancy: number;
}

export interface BacktestResult {
  id: string;
  config: BacktestConfig;
  metrics: BacktestMetrics;
  trades: BacktestTrade[];
  equityCurve: { date: Date; equity: number }[];
  drawdownCurve: { date: Date; drawdown: number }[];
  monthlyReturns: { month: string; return: number }[];
  startDate: Date;
  endDate: Date;
  duration: number;
  finalBalance: number;
  totalReturn: number;
  totalReturnPercent: number;
  createdAt: Date;
}

// ============================================
// ALERTS & NOTIFICATIONS
// ============================================

export interface Alert {
  id: string;
  type: 'price' | 'signal' | 'indicator' | 'news';
  pair: string;
  condition: string;
  value: number;
  triggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  message: string;
}

// ============================================
// SETTINGS
// ============================================

export interface RiskSettings {
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  maxOpenPositions: number;
  defaultLotSize: number;
  defaultStopLoss: number;
  defaultTakeProfit: number;
  trailingStopEnabled: boolean;
  trailingStopDistance: number;
}

export interface DisplaySettings {
  theme: 'dark' | 'light';
  chartType: 'candlestick' | 'line' | 'bar';
  defaultTimeframe: TimeFrame;
  showIndicators: boolean;
  indicatorConfig: {
    rsi: { period: number; overbought: number; oversold: number };
    macd: { fast: number; slow: number; signal: number };
    bollingerBands: { period: number; stdDev: number };
    sma: number[];
    ema: number[];
  };
}

export interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  soundAlerts: boolean;
  signalNotifications: boolean;
  priceAlerts: boolean;
}

export interface AppSettings {
  apiKey: string | null;
  riskSettings: RiskSettings;
  displaySettings: DisplaySettings;
  notificationSettings: NotificationSettings;
}

// ============================================
// API RESPONSES
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// ============================================
// CHART DATA
// ============================================

export interface ChartData {
  candles: Candle[];
  indicators: {
    rsi?: number[];
    macd?: { macd: number; signal: number; histogram: number }[];
    bollingerBands?: { upper: number; middle: number; lower: number }[];
    sma?: { [period: number]: number[] };
    ema?: { [period: number]: number[] };
  };
  signals: TradingSignal[];
  drawings: ChartDrawing[];
}

export interface ChartDrawing {
  id: string;
  type: 'line' | 'horizontal' | 'fibonacci' | 'rectangle' | 'text';
  points: { x: number; y: number }[];
  color: string;
  label?: string;
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_FOREX_PAIR: ForexPair = {
  symbol: 'EUR/USD',
  base: 'EUR',
  quote: 'USD',
  pipValue: 0.0001,
  lotSize: 100000,
  minLot: 0.01,
  maxLot: 100,
  spread: 0.00015,
};

export const DEFAULT_RISK_SETTINGS: RiskSettings = {
  maxRiskPerTrade: 2,
  maxDailyLoss: 5,
  maxOpenPositions: 3,
  defaultLotSize: 0.1,
  defaultStopLoss: 50,
  defaultTakeProfit: 100,
  trailingStopEnabled: false,
  trailingStopDistance: 20,
};

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  theme: 'dark',
  chartType: 'candlestick',
  defaultTimeframe: TimeFrame.H1,
  showIndicators: true,
  indicatorConfig: {
    rsi: { period: 14, overbought: 70, oversold: 30 },
    macd: { fast: 12, slow: 26, signal: 9 },
    bollingerBands: { period: 20, stdDev: 2 },
    sma: [20, 50, 200],
    ema: [12, 26],
  },
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailAlerts: false,
  pushNotifications: true,
  soundAlerts: true,
  signalNotifications: true,
  priceAlerts: true,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  apiKey: null,
  riskSettings: DEFAULT_RISK_SETTINGS,
  displaySettings: DEFAULT_DISPLAY_SETTINGS,
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
};
