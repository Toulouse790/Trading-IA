/**
 * Service Twelve Data - Données historiques Forex réelles
 * Documentation: https://twelvedata.com/docs
 */

import { Candle, TimeFrame } from '../../types';
import { getAPIConfig } from '../../config/apiConfig';
import { generateHistoricalCandles } from '../forexService';

interface TwelveDataOHLC {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

interface TwelveDataResponse {
  meta?: {
    symbol: string;
    interval: string;
    currency_base: string;
    currency_quote: string;
  };
  values?: TwelveDataOHLC[];
  status?: string;
  message?: string;
}

interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  previous_close: string;
  change: string;
  percent_change: string;
}

// Mapping des timeframes vers le format Twelve Data
const TIMEFRAME_MAP: Record<TimeFrame, string> = {
  [TimeFrame.M1]: '1min',
  [TimeFrame.M5]: '5min',
  [TimeFrame.M15]: '15min',
  [TimeFrame.M30]: '30min',
  [TimeFrame.H1]: '1h',
  [TimeFrame.H4]: '4h',
  [TimeFrame.D1]: '1day',
  [TimeFrame.W1]: '1week',
};

// Cache pour éviter les appels répétés
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

function getCacheKey(endpoint: string, params: Record<string, string>): string {
  return `${endpoint}_${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Vérifie si l'API Twelve Data est disponible
 */
export function isTwelveDataAvailable(): boolean {
  const config = getAPIConfig();
  return config.twelveData.apiKey !== null;
}

/**
 * Récupère les données historiques OHLCV réelles
 */
export async function fetchHistoricalData(
  symbol: string = 'EUR/USD',
  timeframe: TimeFrame = TimeFrame.H1,
  outputSize: number = 500
): Promise<Candle[]> {
  const config = getAPIConfig();

  // Fallback sur données simulées si pas de clé API
  if (!config.twelveData.apiKey) {
    console.log('[TwelveData] Pas de clé API, utilisation des données simulées');
    return generateHistoricalCandles(timeframe, outputSize);
  }

  const cacheKey = getCacheKey('time_series', { symbol, timeframe, outputSize: String(outputSize) });
  const cached = getFromCache<Candle[]>(cacheKey);
  if (cached) {
    console.log('[TwelveData] Données depuis le cache');
    return cached;
  }

  try {
    const params = new URLSearchParams({
      symbol: symbol.replace('/', ''),
      interval: TIMEFRAME_MAP[timeframe],
      outputsize: String(Math.min(outputSize, 5000)),
      apikey: config.twelveData.apiKey,
    });

    const response = await fetch(`${config.twelveData.baseUrl}/time_series?${params}`);
    const data: TwelveDataResponse = await response.json();

    if (data.status === 'error' || !data.values) {
      console.warn('[TwelveData] Erreur API:', data.message);
      return generateHistoricalCandles(timeframe, outputSize);
    }

    const candles: Candle[] = data.values.map((item) => ({
      timestamp: new Date(item.datetime).getTime(),
      date: new Date(item.datetime),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: item.volume ? parseInt(item.volume) : 0,
    })).reverse(); // Twelve Data retourne du plus récent au plus ancien

    setCache(cacheKey, candles);
    console.log(`[TwelveData] ${candles.length} bougies récupérées pour ${symbol} ${timeframe}`);

    return candles;
  } catch (error) {
    console.error('[TwelveData] Erreur:', error);
    return generateHistoricalCandles(timeframe, outputSize);
  }
}

/**
 * Récupère le prix actuel en temps réel
 */
export async function fetchCurrentPrice(symbol: string = 'EUR/USD'): Promise<{
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  previousClose: number;
  timestamp: Date;
} | null> {
  const config = getAPIConfig();

  if (!config.twelveData.apiKey) {
    return null;
  }

  const cacheKey = getCacheKey('quote', { symbol });
  const cached = getFromCache<any>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      symbol: symbol.replace('/', ''),
      apikey: config.twelveData.apiKey,
    });

    const response = await fetch(`${config.twelveData.baseUrl}/quote?${params}`);
    const data: TwelveDataQuote = await response.json();

    if (!data.close) {
      return null;
    }

    const result = {
      price: parseFloat(data.close),
      change: parseFloat(data.change),
      changePercent: parseFloat(data.percent_change),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      previousClose: parseFloat(data.previous_close),
      timestamp: new Date(data.datetime),
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('[TwelveData] Erreur quote:', error);
    return null;
  }
}

/**
 * Récupère les indicateurs techniques pré-calculés
 */
export async function fetchTechnicalIndicator(
  symbol: string = 'EUR/USD',
  indicator: 'rsi' | 'macd' | 'bbands' | 'sma' | 'ema' | 'stoch' | 'atr',
  timeframe: TimeFrame = TimeFrame.H1,
  params: Record<string, number> = {}
): Promise<any[] | null> {
  const config = getAPIConfig();

  if (!config.twelveData.apiKey) {
    return null;
  }

  const defaultParams: Record<string, Record<string, number>> = {
    rsi: { time_period: 14 },
    macd: { fast_period: 12, slow_period: 26, signal_period: 9 },
    bbands: { time_period: 20, sd: 2 },
    sma: { time_period: 20 },
    ema: { time_period: 20 },
    stoch: { fast_k_period: 14, slow_k_period: 3, slow_d_period: 3 },
    atr: { time_period: 14 },
  };

  const indicatorParams = { ...defaultParams[indicator], ...params };
  const cacheKey = getCacheKey(indicator, { symbol, timeframe, ...indicatorParams });
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const urlParams = new URLSearchParams({
      symbol: symbol.replace('/', ''),
      interval: TIMEFRAME_MAP[timeframe],
      apikey: config.twelveData.apiKey,
      outputsize: '100',
      ...Object.fromEntries(
        Object.entries(indicatorParams).map(([k, v]) => [k, String(v)])
      ),
    });

    const response = await fetch(`${config.twelveData.baseUrl}/${indicator}?${urlParams}`);
    const data = await response.json();

    if (data.status === 'error' || !data.values) {
      console.warn(`[TwelveData] Erreur ${indicator}:`, data.message);
      return null;
    }

    setCache(cacheKey, data.values);
    return data.values;
  } catch (error) {
    console.error(`[TwelveData] Erreur ${indicator}:`, error);
    return null;
  }
}

/**
 * Récupère les paires Forex disponibles
 */
export async function fetchForexPairs(): Promise<string[]> {
  const config = getAPIConfig();

  if (!config.twelveData.apiKey) {
    return ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'];
  }

  try {
    const params = new URLSearchParams({
      apikey: config.twelveData.apiKey,
    });

    const response = await fetch(`${config.twelveData.baseUrl}/forex_pairs?${params}`);
    const data = await response.json();

    if (data.data) {
      return data.data.slice(0, 50).map((pair: any) => pair.symbol);
    }
    return ['EUR/USD'];
  } catch (error) {
    console.error('[TwelveData] Erreur forex_pairs:', error);
    return ['EUR/USD'];
  }
}

/**
 * Récupère les données pour plusieurs timeframes (Multi-timeframe analysis)
 */
export async function fetchMultiTimeframeData(
  symbol: string = 'EUR/USD',
  timeframes: TimeFrame[] = [TimeFrame.M15, TimeFrame.H1, TimeFrame.H4, TimeFrame.D1]
): Promise<Record<TimeFrame, Candle[]>> {
  const result: Record<TimeFrame, Candle[]> = {} as Record<TimeFrame, Candle[]>;

  await Promise.all(
    timeframes.map(async (tf) => {
      result[tf] = await fetchHistoricalData(symbol, tf, 200);
    })
  );

  return result;
}
