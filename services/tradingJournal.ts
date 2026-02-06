/**
 * Trading Journal Service
 * Track trades with notes, emotions, screenshots, and analytics
 */

import { Trade, Position, TradingSignal, TimeFrame } from '../types';

export interface JournalEntry {
  id: string;
  tradeId?: string;
  signalId?: string;
  date: Date;
  pair: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  pnl?: number;
  pnlPercent?: number;
  status: 'open' | 'closed' | 'cancelled';

  // Analysis
  timeframe: TimeFrame;
  strategy: string;
  setup: string;
  indicators: string[];
  patterns: string[];
  confluences: string[];

  // Notes
  preTradeAnalysis: string;
  entryReason: string;
  exitReason?: string;
  lessonsLearned?: string;
  notes: string;

  // Psychology
  emotionEntry: EmotionLevel;
  emotionDuring?: EmotionLevel;
  emotionExit?: EmotionLevel;
  followedPlan: boolean;
  mistakesMade: string[];

  // Ratings
  setupQuality: number; // 1-5
  executionQuality: number; // 1-5
  overallRating: number; // 1-5

  // Media
  screenshots: string[];
  tags: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type EmotionLevel = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

export interface JournalStats {
  totalEntries: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  averageSetupQuality: number;
  averageExecutionQuality: number;
  bestDay: { date: string; pnl: number };
  worstDay: { date: string; pnl: number };
  mostProfitablePair: string;
  mostProfitableStrategy: string;
  commonMistakes: { mistake: string; count: number }[];
  emotionAnalysis: {
    bestEmotionForProfit: EmotionLevel;
    worstEmotionForProfit: EmotionLevel;
  };
}

export interface JournalFilter {
  startDate?: Date;
  endDate?: Date;
  pair?: string;
  status?: 'open' | 'closed' | 'cancelled';
  strategy?: string;
  tags?: string[];
  minPnl?: number;
  maxPnl?: number;
  minRating?: number;
}

// Storage key
const JOURNAL_STORAGE_KEY = 'trading_journal_entries';

/**
 * Load entries from storage
 */
function loadEntries(): JournalEntry[] {
  try {
    const stored = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (stored) {
      const entries = JSON.parse(stored);
      return entries.map((e: any) => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      }));
    }
  } catch (error) {
    console.error('Error loading journal entries:', error);
  }
  return [];
}

/**
 * Save entries to storage
 */
function saveEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving journal entries:', error);
  }
}

// In-memory cache
let entriesCache: JournalEntry[] = loadEntries();

/**
 * Create a new journal entry
 */
export function createJournalEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): JournalEntry {
  const newEntry: JournalEntry = {
    ...entry,
    id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  entriesCache.unshift(newEntry);
  saveEntries(entriesCache);

  return newEntry;
}

/**
 * Create entry from a trade
 */
export function createEntryFromTrade(
  trade: Trade,
  notes: Partial<Pick<JournalEntry, 'preTradeAnalysis' | 'entryReason' | 'exitReason' | 'lessonsLearned' | 'notes' | 'emotionEntry' | 'emotionExit' | 'setup' | 'strategy' | 'tags'>>
): JournalEntry {
  return createJournalEntry({
    tradeId: trade.id,
    date: trade.entryTime,
    pair: trade.pair,
    type: trade.type,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    stopLoss: trade.entryPrice - (trade.type === 'long' ? 0.005 : -0.005),
    takeProfit: trade.exitPrice,
    lotSize: trade.lotSize,
    pnl: trade.pnl,
    pnlPercent: trade.pnlPercent,
    status: 'closed',
    timeframe: TimeFrame.H1,
    strategy: notes.strategy || 'Non spécifiée',
    setup: notes.setup || 'Non spécifié',
    indicators: [],
    patterns: [],
    confluences: [],
    preTradeAnalysis: notes.preTradeAnalysis || '',
    entryReason: notes.entryReason || 'Signal IA',
    exitReason: notes.exitReason || (trade.pnl >= 0 ? 'Take Profit' : 'Stop Loss'),
    lessonsLearned: notes.lessonsLearned || '',
    notes: notes.notes || '',
    emotionEntry: notes.emotionEntry || 'neutral',
    emotionDuring: 'neutral',
    emotionExit: notes.emotionExit || (trade.pnl >= 0 ? 'positive' : 'negative'),
    followedPlan: true,
    mistakesMade: [],
    setupQuality: 3,
    executionQuality: 3,
    overallRating: trade.pnl >= 0 ? 4 : 2,
    screenshots: [],
    tags: notes.tags || [],
  });
}

/**
 * Create entry from a signal
 */
export function createEntryFromSignal(
  signal: TradingSignal,
  notes: Partial<JournalEntry>
): JournalEntry {
  return createJournalEntry({
    signalId: signal.id,
    date: signal.timestamp,
    pair: signal.pair,
    type: signal.type === 'buy' ? 'long' : 'short',
    entryPrice: signal.entryPrice,
    stopLoss: signal.stopLoss,
    takeProfit: signal.takeProfit[0],
    lotSize: 0.1,
    status: 'open',
    timeframe: signal.timeframe,
    strategy: 'Signal IA',
    setup: signal.reasoning,
    indicators: signal.indicators,
    patterns: [],
    confluences: [],
    preTradeAnalysis: signal.aiAnalysis || '',
    entryReason: signal.reasoning,
    notes: notes.notes || '',
    emotionEntry: notes.emotionEntry || 'neutral',
    followedPlan: true,
    mistakesMade: [],
    setupQuality: Math.ceil(signal.confidence / 20),
    executionQuality: 3,
    overallRating: 3,
    screenshots: [],
    tags: notes.tags || ['signal-ia'],
    ...notes,
  });
}

/**
 * Update a journal entry
 */
export function updateJournalEntry(id: string, updates: Partial<JournalEntry>): JournalEntry | null {
  const index = entriesCache.findIndex(e => e.id === id);
  if (index === -1) return null;

  entriesCache[index] = {
    ...entriesCache[index],
    ...updates,
    updatedAt: new Date(),
  };

  saveEntries(entriesCache);
  return entriesCache[index];
}

/**
 * Delete a journal entry
 */
export function deleteJournalEntry(id: string): boolean {
  const index = entriesCache.findIndex(e => e.id === id);
  if (index === -1) return false;

  entriesCache.splice(index, 1);
  saveEntries(entriesCache);
  return true;
}

/**
 * Get all journal entries
 */
export function getAllJournalEntries(): JournalEntry[] {
  return [...entriesCache];
}

/**
 * Get entries with filter
 */
export function getFilteredEntries(filter: JournalFilter): JournalEntry[] {
  return entriesCache.filter(entry => {
    if (filter.startDate && entry.date < filter.startDate) return false;
    if (filter.endDate && entry.date > filter.endDate) return false;
    if (filter.pair && entry.pair !== filter.pair) return false;
    if (filter.status && entry.status !== filter.status) return false;
    if (filter.strategy && entry.strategy !== filter.strategy) return false;
    if (filter.minPnl !== undefined && (entry.pnl || 0) < filter.minPnl) return false;
    if (filter.maxPnl !== undefined && (entry.pnl || 0) > filter.maxPnl) return false;
    if (filter.minRating !== undefined && entry.overallRating < filter.minRating) return false;
    if (filter.tags && filter.tags.length > 0) {
      if (!filter.tags.some(tag => entry.tags.includes(tag))) return false;
    }
    return true;
  });
}

/**
 * Get entry by ID
 */
export function getJournalEntry(id: string): JournalEntry | null {
  return entriesCache.find(e => e.id === id) || null;
}

/**
 * Calculate journal statistics
 */
export function getJournalStats(filter?: JournalFilter): JournalStats {
  const entries = filter ? getFilteredEntries(filter) : entriesCache;
  const closedEntries = entries.filter(e => e.status === 'closed' && e.pnl !== undefined);

  if (closedEntries.length === 0) {
    return {
      totalEntries: entries.length,
      openTrades: entries.filter(e => e.status === 'open').length,
      closedTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnl: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      averageSetupQuality: 0,
      averageExecutionQuality: 0,
      bestDay: { date: '-', pnl: 0 },
      worstDay: { date: '-', pnl: 0 },
      mostProfitablePair: '-',
      mostProfitableStrategy: '-',
      commonMistakes: [],
      emotionAnalysis: {
        bestEmotionForProfit: 'neutral',
        worstEmotionForProfit: 'neutral',
      },
    };
  }

  const winningEntries = closedEntries.filter(e => (e.pnl || 0) > 0);
  const losingEntries = closedEntries.filter(e => (e.pnl || 0) < 0);

  const totalPnl = closedEntries.reduce((sum, e) => sum + (e.pnl || 0), 0);
  const avgWin = winningEntries.length > 0
    ? winningEntries.reduce((sum, e) => sum + (e.pnl || 0), 0) / winningEntries.length
    : 0;
  const avgLoss = losingEntries.length > 0
    ? Math.abs(losingEntries.reduce((sum, e) => sum + (e.pnl || 0), 0) / losingEntries.length)
    : 0;

  // Daily PnL
  const dailyPnl: Record<string, number> = {};
  closedEntries.forEach(e => {
    const dateStr = e.date.toISOString().split('T')[0];
    dailyPnl[dateStr] = (dailyPnl[dateStr] || 0) + (e.pnl || 0);
  });

  const dailyEntries = Object.entries(dailyPnl);
  const bestDay = dailyEntries.reduce((best, [date, pnl]) =>
    pnl > best.pnl ? { date, pnl } : best, { date: '-', pnl: -Infinity });
  const worstDay = dailyEntries.reduce((worst, [date, pnl]) =>
    pnl < worst.pnl ? { date, pnl } : worst, { date: '-', pnl: Infinity });

  // Pair performance
  const pairPnl: Record<string, number> = {};
  closedEntries.forEach(e => {
    pairPnl[e.pair] = (pairPnl[e.pair] || 0) + (e.pnl || 0);
  });
  const mostProfitablePair = Object.entries(pairPnl)
    .reduce((best, [pair, pnl]) => pnl > best[1] ? [pair, pnl] : best, ['-', -Infinity])[0];

  // Strategy performance
  const strategyPnl: Record<string, number> = {};
  closedEntries.forEach(e => {
    strategyPnl[e.strategy] = (strategyPnl[e.strategy] || 0) + (e.pnl || 0);
  });
  const mostProfitableStrategy = Object.entries(strategyPnl)
    .reduce((best, [strat, pnl]) => pnl > best[1] ? [strat, pnl] : best, ['-', -Infinity])[0];

  // Common mistakes
  const mistakeCount: Record<string, number> = {};
  entries.forEach(e => {
    e.mistakesMade.forEach(m => {
      mistakeCount[m] = (mistakeCount[m] || 0) + 1;
    });
  });
  const commonMistakes = Object.entries(mistakeCount)
    .map(([mistake, count]) => ({ mistake, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Emotion analysis
  const emotionPnl: Record<EmotionLevel, number[]> = {
    very_negative: [],
    negative: [],
    neutral: [],
    positive: [],
    very_positive: [],
  };
  closedEntries.forEach(e => {
    if (e.emotionEntry && e.pnl !== undefined) {
      emotionPnl[e.emotionEntry].push(e.pnl);
    }
  });
  const emotionAvgPnl = Object.entries(emotionPnl).map(([emotion, pnls]) => ({
    emotion: emotion as EmotionLevel,
    avgPnl: pnls.length > 0 ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0,
  })).sort((a, b) => b.avgPnl - a.avgPnl);

  return {
    totalEntries: entries.length,
    openTrades: entries.filter(e => e.status === 'open').length,
    closedTrades: closedEntries.length,
    winningTrades: winningEntries.length,
    losingTrades: losingEntries.length,
    winRate: (winningEntries.length / closedEntries.length) * 100,
    totalPnl,
    averageWin: avgWin,
    averageLoss: avgLoss,
    profitFactor: avgLoss > 0 ? (winningEntries.length * avgWin) / (losingEntries.length * avgLoss) : 0,
    averageSetupQuality: entries.reduce((sum, e) => sum + e.setupQuality, 0) / entries.length,
    averageExecutionQuality: entries.reduce((sum, e) => sum + e.executionQuality, 0) / entries.length,
    bestDay: bestDay.pnl === -Infinity ? { date: '-', pnl: 0 } : bestDay,
    worstDay: worstDay.pnl === Infinity ? { date: '-', pnl: 0 } : worstDay,
    mostProfitablePair,
    mostProfitableStrategy,
    commonMistakes,
    emotionAnalysis: {
      bestEmotionForProfit: emotionAvgPnl[0]?.emotion || 'neutral',
      worstEmotionForProfit: emotionAvgPnl[emotionAvgPnl.length - 1]?.emotion || 'neutral',
    },
  };
}

/**
 * Get unique strategies from journal
 */
export function getStrategies(): string[] {
  const strategies = new Set<string>();
  entriesCache.forEach(e => strategies.add(e.strategy));
  return Array.from(strategies);
}

/**
 * Get unique tags from journal
 */
export function getTags(): string[] {
  const tags = new Set<string>();
  entriesCache.forEach(e => e.tags.forEach(t => tags.add(t)));
  return Array.from(tags);
}

/**
 * Export journal to JSON
 */
export function exportJournal(): string {
  return JSON.stringify(entriesCache, null, 2);
}

/**
 * Import journal from JSON
 */
export function importJournal(json: string): number {
  try {
    const entries = JSON.parse(json) as JournalEntry[];
    const validEntries = entries.map(e => ({
      ...e,
      date: new Date(e.date),
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
    }));
    entriesCache = [...validEntries, ...entriesCache];
    saveEntries(entriesCache);
    return validEntries.length;
  } catch (error) {
    console.error('Error importing journal:', error);
    return 0;
  }
}

/**
 * Get calendar data for visualization
 */
export function getCalendarData(year: number, month: number): { date: string; pnl: number; count: number }[] {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const filteredEntries = entriesCache.filter(e =>
    e.date >= startDate && e.date <= endDate && e.status === 'closed'
  );

  const dailyData: Record<string, { pnl: number; count: number }> = {};

  filteredEntries.forEach(e => {
    const dateStr = e.date.toISOString().split('T')[0];
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = { pnl: 0, count: 0 };
    }
    dailyData[dateStr].pnl += e.pnl || 0;
    dailyData[dateStr].count++;
  });

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    ...data,
  }));
}
