/**
 * Composant Graphique Forex avec Candlesticks et Indicateurs
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Settings,
  Maximize2,
} from 'lucide-react';
import {
  Candle,
  TimeFrame,
  TechnicalIndicators,
  TradingSignal,
  SignalType,
} from '../types';
import {
  generateHistoricalCandles,
  calculateAllIndicators,
  getTimeframeLabel,
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
} from '../services/forexService';

interface ForexChartProps {
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  signals?: TradingSignal[];
  onIndicatorsCalculated?: (indicators: TechnicalIndicators) => void;
}

const ForexChart: React.FC<ForexChartProps> = ({
  timeframe,
  onTimeframeChange,
  signals = [],
  onIndicatorsCalculated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [visibleCandles, setVisibleCandles] = useState(100);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    sma50: true,
    bollinger: true,
    volume: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  // Charger les données
  useEffect(() => {
    setIsLoading(true);
    const data = generateHistoricalCandles(timeframe, 500);
    setCandles(data);

    const ind = calculateAllIndicators(data);
    setIndicators(ind);
    onIndicatorsCalculated?.(ind);

    setScrollOffset(0);
    setIsLoading(false);
  }, [timeframe]);

  // Rafraîchir les données
  useEffect(() => {
    const interval = setInterval(() => {
      const data = generateHistoricalCandles(timeframe, 500);
      setCandles(data);
      const ind = calculateAllIndicators(data);
      setIndicators(ind);
      onIndicatorsCalculated?.(ind);
    }, 5000);

    return () => clearInterval(interval);
  }, [timeframe]);

  // Calculs pour le rendu
  const displayCandles = useMemo(() => {
    const start = Math.max(0, candles.length - visibleCandles - scrollOffset);
    const end = candles.length - scrollOffset;
    return candles.slice(start, end);
  }, [candles, visibleCandles, scrollOffset]);

  const priceRange = useMemo(() => {
    if (displayCandles.length === 0) return { min: 0, max: 0 };
    const highs = displayCandles.map(c => c.high);
    const lows = displayCandles.map(c => c.low);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const padding = (max - min) * 0.1;
    return { min: min - padding, max: max + padding };
  }, [displayCandles]);

  // Dessiner le graphique
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || displayCandles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajuster la taille du canvas
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const chartHeight = height * 0.75;
    const volumeHeight = height * 0.15;
    const indicatorHeight = height * 0.1;

    // Effacer
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Grille
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 1;

    // Lignes horizontales
    for (let i = 0; i <= 5; i++) {
      const y = (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Prix sur l'axe Y
      const price = priceRange.max - ((priceRange.max - priceRange.min) / 5) * i;
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(5), 55, y + 4);
    }

    // Calculer les positions
    const candleWidth = (width - 70) / displayCandles.length;
    const candleGap = candleWidth * 0.2;
    const actualCandleWidth = candleWidth - candleGap;

    // SMA / Bollinger
    const closes = displayCandles.map(c => c.close);

    if (showIndicators.bollinger && displayCandles.length >= 20) {
      const bb = calculateBollingerBandsForChart(displayCandles);
      if (bb) {
        // Bande supérieure
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        bb.upper.forEach((val, i) => {
          if (isNaN(val)) return;
          const x = 65 + i * candleWidth + actualCandleWidth / 2;
          const y = ((priceRange.max - val) / (priceRange.max - priceRange.min)) * chartHeight;
          if (i === 0 || isNaN(bb.upper[i - 1])) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Bande inférieure
        ctx.beginPath();
        bb.lower.forEach((val, i) => {
          if (isNaN(val)) return;
          const x = 65 + i * candleWidth + actualCandleWidth / 2;
          const y = ((priceRange.max - val) / (priceRange.max - priceRange.min)) * chartHeight;
          if (i === 0 || isNaN(bb.lower[i - 1])) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Zone entre les bandes
        ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
        ctx.beginPath();
        let started = false;
        bb.upper.forEach((val, i) => {
          if (isNaN(val) || isNaN(bb.lower[i])) return;
          const x = 65 + i * candleWidth + actualCandleWidth / 2;
          const y = ((priceRange.max - val) / (priceRange.max - priceRange.min)) * chartHeight;
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        });
        for (let i = bb.lower.length - 1; i >= 0; i--) {
          if (isNaN(bb.lower[i])) continue;
          const x = 65 + i * candleWidth + actualCandleWidth / 2;
          const y = ((priceRange.max - bb.lower[i]) / (priceRange.max - priceRange.min)) * chartHeight;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    if (showIndicators.sma20) {
      drawMA(ctx, closes, 20, '#10b981', candleWidth, actualCandleWidth, priceRange, chartHeight);
    }
    if (showIndicators.sma50) {
      drawMA(ctx, closes, 50, '#f59e0b', candleWidth, actualCandleWidth, priceRange, chartHeight);
    }

    // Dessiner les bougies
    displayCandles.forEach((candle, i) => {
      const x = 65 + i * candleWidth;
      const isGreen = candle.close >= candle.open;

      // Corps de la bougie
      const bodyTop = Math.min(candle.open, candle.close);
      const bodyBottom = Math.max(candle.open, candle.close);

      const yHigh = ((priceRange.max - candle.high) / (priceRange.max - priceRange.min)) * chartHeight;
      const yLow = ((priceRange.max - candle.low) / (priceRange.max - priceRange.min)) * chartHeight;
      const yOpen = ((priceRange.max - candle.open) / (priceRange.max - priceRange.min)) * chartHeight;
      const yClose = ((priceRange.max - candle.close) / (priceRange.max - priceRange.min)) * chartHeight;

      // Mèche
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + actualCandleWidth / 2, yHigh);
      ctx.lineTo(x + actualCandleWidth / 2, yLow);
      ctx.stroke();

      // Corps
      const bodyHeight = Math.max(1, Math.abs(yOpen - yClose));
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.fillRect(x, Math.min(yOpen, yClose), actualCandleWidth, bodyHeight);
    });

    // Volume
    if (showIndicators.volume) {
      const maxVolume = Math.max(...displayCandles.map(c => c.volume));
      const volumeY = chartHeight + 10;

      displayCandles.forEach((candle, i) => {
        const x = 65 + i * candleWidth;
        const isGreen = candle.close >= candle.open;
        const volHeight = (candle.volume / maxVolume) * volumeHeight;

        ctx.fillStyle = isGreen ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(x, volumeY + volumeHeight - volHeight, actualCandleWidth, volHeight);
      });
    }

    // Signaux sur le graphique
    signals.forEach(signal => {
      const signalTime = signal.timestamp.getTime();
      const candleIndex = displayCandles.findIndex(c =>
        Math.abs(c.timestamp - signalTime) < 3600000
      );

      if (candleIndex >= 0) {
        const x = 65 + candleIndex * candleWidth + actualCandleWidth / 2;
        const y = ((priceRange.max - signal.entryPrice) / (priceRange.max - priceRange.min)) * chartHeight;

        // Triangle
        ctx.fillStyle = signal.type === SignalType.BUY ? '#10b981' : '#ef4444';
        ctx.beginPath();
        if (signal.type === SignalType.BUY) {
          ctx.moveTo(x, y + 15);
          ctx.lineTo(x - 8, y + 25);
          ctx.lineTo(x + 8, y + 25);
        } else {
          ctx.moveTo(x, y - 15);
          ctx.lineTo(x - 8, y - 25);
          ctx.lineTo(x + 8, y - 25);
        }
        ctx.closePath();
        ctx.fill();
      }
    });

    // Prix actuel
    if (displayCandles.length > 0) {
      const lastCandle = displayCandles[displayCandles.length - 1];
      const y = ((priceRange.max - lastCandle.close) / (priceRange.max - priceRange.min)) * chartHeight;
      const isGreen = lastCandle.close >= lastCandle.open;

      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label prix
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.fillRect(width - 70, y - 10, 70, 20);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lastCandle.close.toFixed(5), width - 35, y + 4);
    }

  }, [displayCandles, priceRange, showIndicators, signals]);

  const drawMA = (
    ctx: CanvasRenderingContext2D,
    closes: number[],
    period: number,
    color: string,
    candleWidth: number,
    actualCandleWidth: number,
    range: { min: number; max: number },
    chartHeight: number
  ) => {
    const ma = calculateSMA(closes, period);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    let started = false;
    ma.forEach((val, i) => {
      if (isNaN(val)) return;
      const x = 65 + i * candleWidth + actualCandleWidth / 2;
      const y = ((range.max - val) / (range.max - range.min)) * chartHeight;
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const calculateBollingerBandsForChart = (candles: Candle[]) => {
    const closes = candles.map(c => c.close);
    const period = 20;
    const stdDev = 2;

    const sma = calculateSMA(closes, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1 || isNaN(sma[i])) {
        upper.push(NaN);
        lower.push(NaN);
        continue;
      }

      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const sd = Math.sqrt(variance);

      upper.push(mean + stdDev * sd);
      lower.push(mean - stdDev * sd);
    }

    return { upper, lower };
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setVisibleCandles(prev => {
      if (direction === 'in') return Math.max(30, prev - 20);
      return Math.min(300, prev + 20);
    });
  };

  const handleScroll = (direction: 'left' | 'right') => {
    setScrollOffset(prev => {
      if (direction === 'left') return Math.min(candles.length - visibleCandles, prev + 20);
      return Math.max(0, prev - 20);
    });
  };

  const timeframes = [
    TimeFrame.M1, TimeFrame.M5, TimeFrame.M15, TimeFrame.M30,
    TimeFrame.H1, TimeFrame.H4, TimeFrame.D1, TimeFrame.W1
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">EUR/USD</h2>

          {/* Timeframe selector */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  timeframe === tf
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom('in')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScrollOffset(0)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Indicateurs toggle */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-b border-gray-800 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showIndicators.sma20}
            onChange={e => setShowIndicators(s => ({ ...s, sma20: e.target.checked }))}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-emerald-400">SMA 20</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showIndicators.sma50}
            onChange={e => setShowIndicators(s => ({ ...s, sma50: e.target.checked }))}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-amber-400">SMA 50</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showIndicators.bollinger}
            onChange={e => setShowIndicators(s => ({ ...s, bollinger: e.target.checked }))}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-purple-400">Bollinger</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showIndicators.volume}
            onChange={e => setShowIndicators(s => ({ ...s, volume: e.target.checked }))}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-gray-400">Volume</span>
        </label>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        )}
      </div>

      {/* Indicateurs numériques */}
      {indicators && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4 border-t border-gray-800 bg-gray-900/30">
          <IndicatorBadge
            label="RSI"
            value={indicators.rsi.value.toFixed(1)}
            color={indicators.rsi.overbought ? 'red' : indicators.rsi.oversold ? 'green' : 'gray'}
          />
          <IndicatorBadge
            label="MACD"
            value={indicators.macd.macd.toFixed(2)}
            subValue={indicators.macd.crossover !== 'none' ? indicators.macd.crossover : undefined}
            color={indicators.macd.histogram > 0 ? 'green' : 'red'}
          />
          <IndicatorBadge
            label="Stoch"
            value={`${indicators.stochastic.k.toFixed(0)}/${indicators.stochastic.d.toFixed(0)}`}
            color={indicators.stochastic.overbought ? 'red' : indicators.stochastic.oversold ? 'green' : 'gray'}
          />
          <IndicatorBadge
            label="ATR"
            value={`${indicators.atr.value.toFixed(1)} pips`}
            subValue={indicators.atr.volatility}
            color="purple"
          />
          <IndicatorBadge
            label="Trend"
            value={indicators.movingAverages.trend}
            color={indicators.movingAverages.trend === 'bullish' ? 'green' :
                   indicators.movingAverages.trend === 'bearish' ? 'red' : 'gray'}
          />
          <IndicatorBadge
            label="BB %B"
            value={indicators.bollingerBands.percentB.toFixed(2)}
            color={indicators.bollingerBands.percentB > 0.8 ? 'red' :
                   indicators.bollingerBands.percentB < 0.2 ? 'green' : 'gray'}
          />
        </div>
      )}
    </div>
  );
};

const IndicatorBadge: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  color: 'green' | 'red' | 'gray' | 'purple';
}> = ({ label, value, subValue, color }) => {
  const colors = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    gray: 'text-gray-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="bg-gray-800/50 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-medium ${colors[color]}`}>{value}</p>
      {subValue && <p className="text-xs text-gray-500 capitalize">{subValue}</p>}
    </div>
  );
};

export default ForexChart;
