/**
 * Multi-Pair Dashboard Component
 * View and compare multiple forex pairs
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react';
import { TimeFrame } from '../types';
import {
  FOREX_PAIRS,
  PairConfig,
  PairAnalysis,
  CorrelationData,
  getActivePairs,
  setPairActive,
  analyzeAllPairs,
  getCorrelationMatrix,
  findBestOpportunities,
  getPairMarketData,
} from '../services/multiPairService';

const MultiPairDashboard: React.FC = () => {
  const [pairs, setPairs] = useState<PairConfig[]>(FOREX_PAIRS);
  const [analyses, setAnalyses] = useState<PairAnalysis[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [opportunities, setOpportunities] = useState<ReturnType<typeof findBestOpportunities>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const analysisResults = analyzeAllPairs();
      setAnalyses(analysisResults);

      const correlationResults = getCorrelationMatrix();
      setCorrelations(correlationResults);

      const opportunityResults = findBestOpportunities(5);
      setOpportunities(opportunityResults);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading pair data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const togglePair = (symbol: string) => {
    setPairActive(symbol, !pairs.find(p => p.symbol === symbol)?.isActive);
    setPairs([...FOREX_PAIRS]);
    loadData();
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'bullish') return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (trend === 'bearish') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Activity className="w-5 h-5 text-gray-400" />;
  };

  const getCorrelationColor = (correlation: number) => {
    if (correlation >= 0.7) return 'text-emerald-400 bg-emerald-500/20';
    if (correlation >= 0.3) return 'text-blue-400 bg-blue-500/20';
    if (correlation >= -0.3) return 'text-gray-400 bg-gray-500/20';
    if (correlation >= -0.7) return 'text-amber-400 bg-amber-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Multi-Paires</h1>
            <p className="text-gray-400">
              {getActivePairs().length} paires actives sur {FOREX_PAIRS.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              MAJ: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
          >
            <Settings className="w-4 h-4" />
            Paires
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Pair Settings */}
      {showSettings && (
        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
          <h3 className="font-semibold text-white mb-4">Selectionner les paires</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pairs.map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => togglePair(pair.symbol)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  pair.isActive
                    ? 'bg-blue-900/30 border-blue-500/50 text-white'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                }`}
              >
                <span>{pair.symbol}</span>
                {pair.isActive ? (
                  <Eye className="w-4 h-4 text-blue-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Best Opportunities */}
      {opportunities.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl p-4 border border-amber-500/30">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Meilleures Opportunites
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {opportunities.map((opp, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 ${
                  opp.signal === 'buy' ? 'bg-emerald-900/30' : 'bg-red-900/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{opp.pair}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    opp.signal === 'buy'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {opp.signal === 'buy' ? 'ACHAT' : 'VENTE'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{opp.reason}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Confiance</span>
                  <span className="text-white font-medium">{opp.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pair Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.map((analysis) => (
          <PairCard key={analysis.pair} analysis={analysis} />
        ))}
      </div>

      {/* Correlation Matrix */}
      {correlations.length > 0 && (
        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Correlations entre Paires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {correlations.slice(0, 9).map((corr, i) => (
              <div
                key={i}
                className="bg-gray-800/50 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{corr.pair1}</span>
                  <span className="text-gray-600">↔</span>
                  <span className="text-white font-medium">{corr.pair2}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-sm font-mono ${getCorrelationColor(corr.correlation)}`}>
                  {corr.correlation >= 0 ? '+' : ''}{(corr.correlation * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Les correlations positives indiquent des mouvements dans la meme direction. Les correlations negatives indiquent des mouvements opposes.
          </p>
        </div>
      )}
    </div>
  );
};

const PairCard: React.FC<{ analysis: PairAnalysis }> = ({ analysis }) => {
  const { pair, marketData, indicators, trend, strength, volatility, signal, confidence } = analysis;

  return (
    <div className={`bg-gray-900/50 rounded-2xl p-4 border transition-all hover:border-gray-600 ${
      trend === 'bullish' ? 'border-emerald-500/20' :
      trend === 'bearish' ? 'border-red-500/20' :
      'border-gray-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            trend === 'bullish' ? 'bg-emerald-500/20' :
            trend === 'bearish' ? 'bg-red-500/20' :
            'bg-gray-800'
          }`}>
            {trend === 'bullish' ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : trend === 'bearish' ? (
              <TrendingDown className="w-5 h-5 text-red-400" />
            ) : (
              <Activity className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-white">{pair}</h3>
            <span className={`text-xs px-2 py-0.5 rounded ${
              trend === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' :
              trend === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {trend.toUpperCase()}
            </span>
          </div>
        </div>
        {signal !== 'hold' && (
          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
            signal === 'buy'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {signal === 'buy' ? 'ACHAT' : 'VENTE'} {confidence}%
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono">
            {marketData.currentPrice.toFixed(pair.includes('JPY') ? 3 : 5)}
          </span>
          <span className={`flex items-center gap-1 text-sm ${
            marketData.changePercent24h >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {marketData.changePercent24h >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {marketData.changePercent24h >= 0 ? '+' : ''}
            {marketData.changePercent24h.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>Spread: {(marketData.spread * (pair.includes('JPY') ? 100 : 10000)).toFixed(1)} pips</span>
          <span className={`px-2 py-0.5 rounded ${
            volatility === 'high' ? 'bg-red-500/20 text-red-400' :
            volatility === 'medium' ? 'bg-amber-500/20 text-amber-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            Vol: {volatility}
          </span>
        </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-500">RSI</p>
          <p className={`font-medium ${
            indicators.rsi.value < 30 ? 'text-emerald-400' :
            indicators.rsi.value > 70 ? 'text-red-400' :
            'text-white'
          }`}>
            {indicators.rsi.value.toFixed(0)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-500">MACD</p>
          <p className={`font-medium ${
            indicators.macd.histogram > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {indicators.macd.histogram > 0 ? '↑' : '↓'}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Force</p>
          <p className="font-medium text-white">{strength.toFixed(0)}%</p>
        </div>
      </div>

      {/* 24h Range */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>24h Range</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400 font-mono">
            {marketData.low24h.toFixed(pair.includes('JPY') ? 3 : 5)}
          </span>
          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"
              style={{
                width: `${((marketData.currentPrice - marketData.low24h) / (marketData.high24h - marketData.low24h)) * 100}%`
              }}
            />
          </div>
          <span className="text-xs text-emerald-400 font-mono">
            {marketData.high24h.toFixed(pair.includes('JPY') ? 3 : 5)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MultiPairDashboard;
