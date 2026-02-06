/**
 * Advanced Analysis Component
 * Combines Multi-Timeframe, Pattern Recognition, and ML Prediction
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Brain,
  Target,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { TimeFrame, SignalType } from '../types';
import { generateHistoricalCandles } from '../services/forexService';
import {
  analyzeMultiTimeframe,
  MultiTimeframeResult,
  getMultiTimeframeRecommendation,
} from '../services/multiTimeframeAnalysis';
import {
  detectPatterns,
  DetectedPattern,
  getPatternSummary,
} from '../services/patternRecognition';
import {
  generatePredictions,
  PredictionResult,
  getPredictionSummary,
} from '../services/mlPrediction';

interface AdvancedAnalysisProps {
  pair?: string;
}

const AdvancedAnalysis: React.FC<AdvancedAnalysisProps> = ({ pair = 'EUR/USD' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mtfResult, setMtfResult] = useState<MultiTimeframeResult | null>(null);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [predictions, setPredictions] = useState<{
    short: PredictionResult;
    medium: PredictionResult;
    long: PredictionResult;
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    mtf: true,
    patterns: true,
    ml: true,
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      // Multi-timeframe analysis
      const mtf = analyzeMultiTimeframe(pair);
      setMtfResult(mtf);

      // Pattern recognition
      const candles = generateHistoricalCandles(TimeFrame.H1, 200);
      const detectedPatterns = detectPatterns(candles);
      setPatterns(detectedPatterns);

      // ML Predictions
      const preds = generatePredictions(candles);
      setPredictions(preds);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Analysis error:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    runAnalysis();
  }, [pair]);

  const toggleSection = (section: 'mtf' | 'patterns' | 'ml') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'bullish') return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (trend === 'bearish') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Activity className="w-5 h-5 text-gray-400" />;
  };

  const getSignalColor = (signal: SignalType) => {
    if (signal === SignalType.BUY) return 'text-emerald-400 bg-emerald-500/20';
    if (signal === SignalType.SELL) return 'text-red-400 bg-red-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-400" />
            Analyse Avancee
          </h1>
          <p className="text-gray-400 mt-1">
            Multi-Timeframe | Patterns | Machine Learning
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              MAJ: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Multi-Timeframe Analysis */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('mtf')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Multi-Timeframe (M5 + H1 + D1)</h2>
          </div>
          {expandedSections.mtf ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.mtf && mtfResult && (
          <div className="p-4 pt-0 space-y-4">
            {/* Timeframe Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'M5 (5 min)', data: mtfResult.m5 },
                { label: 'H1 (1 heure)', data: mtfResult.h1 },
                { label: 'D1 (1 jour)', data: mtfResult.d1 },
              ].map(({ label, data }) => (
                <div key={label} className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">{label}</span>
                    {getTrendIcon(data.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tendance</span>
                      <span className={`font-medium ${
                        data.trend === 'bullish' ? 'text-emerald-400' :
                        data.trend === 'bearish' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {data.trend.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Force</span>
                      <span className="text-white">{data.strength.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">RSI</span>
                      <span className={getSignalColor(data.rsiSignal) + ' px-2 py-0.5 rounded text-xs'}>
                        {data.rsiSignal.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">MACD</span>
                      <span className={getSignalColor(data.macdSignal) + ' px-2 py-0.5 rounded text-xs'}>
                        {data.macdSignal.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Result */}
            <div className={`rounded-xl p-4 border ${
              mtfResult.alignment === 'full' ? 'bg-emerald-900/20 border-emerald-500/30' :
              mtfResult.alignment === 'partial' ? 'bg-amber-900/20 border-amber-500/30' :
              'bg-red-900/20 border-red-500/30'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">Recommandation</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {getMultiTimeframeRecommendation(mtfResult)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Alignement</p>
                    <p className={`font-bold ${
                      mtfResult.alignment === 'full' ? 'text-emerald-400' :
                      mtfResult.alignment === 'partial' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {mtfResult.alignment === 'full' ? 'PARFAIT' :
                       mtfResult.alignment === 'partial' ? 'PARTIEL' : 'CONFLIT'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Confiance</p>
                    <p className="font-bold text-white">{mtfResult.confidence}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Analyse</p>
              <ul className="space-y-1">
                {mtfResult.reasoning.map((reason, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Pattern Recognition */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('patterns')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">
              Patterns Chartistes
              {patterns.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  {patterns.length}
                </span>
              )}
            </h2>
          </div>
          {expandedSections.patterns ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.patterns && (
          <div className="p-4 pt-0 space-y-4">
            {patterns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun pattern detecte actuellement</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patterns.slice(0, 6).map((pattern, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-4 border ${
                      pattern.signal === SignalType.BUY ? 'bg-emerald-900/20 border-emerald-500/30' :
                      pattern.signal === SignalType.SELL ? 'bg-red-900/20 border-red-500/30' :
                      'bg-gray-800/50 border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white">{pattern.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          pattern.signal === SignalType.BUY ? 'bg-emerald-500/20 text-emerald-400' :
                          pattern.signal === SignalType.SELL ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {pattern.signal === SignalType.BUY ? 'ACHAT' :
                           pattern.signal === SignalType.SELL ? 'VENTE' : 'NEUTRE'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{pattern.confidence}%</p>
                        <p className="text-xs text-gray-500">confiance</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{pattern.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Target: </span>
                        <span className="text-white font-mono">{pattern.targetPrice.toFixed(5)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">SL: </span>
                        <span className="text-red-400 font-mono">{pattern.stopLoss.toFixed(5)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ML Prediction */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('ml')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Predictions Machine Learning</h2>
          </div>
          {expandedSections.ml ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.ml && predictions && (
          <div className="p-4 pt-0 space-y-4">
            {/* Prediction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Court terme (1h)', data: predictions.short },
                { label: 'Moyen terme (4h)', data: predictions.medium },
                { label: 'Long terme (24h)', data: predictions.long },
              ].map(({ label, data }) => (
                <div key={label} className={`rounded-xl p-4 border ${
                  data.direction === 'bullish' ? 'bg-emerald-900/20 border-emerald-500/30' :
                  data.direction === 'bearish' ? 'bg-red-900/20 border-red-500/30' :
                  'bg-gray-800/50 border-gray-700'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">{label}</span>
                    {getTrendIcon(data.direction)}
                  </div>
                  <p className="text-2xl font-bold text-white font-mono mb-2">
                    {data.predictedPrice.toFixed(5)}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${
                      data.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {data.priceChangePercent >= 0 ? '+' : ''}{data.priceChangePercent.toFixed(3)}%
                    </span>
                    <span className="text-gray-400">
                      Confiance: {data.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Importance */}
            {predictions.medium.features.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-3">Facteurs les plus importants</p>
                <div className="space-y-2">
                  {predictions.medium.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        feature.impact === 'positive' ? 'bg-emerald-400' :
                        feature.impact === 'negative' ? 'bg-red-400' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm text-gray-300 flex-1">{feature.name}</span>
                      <span className="text-xs text-gray-500">{(feature.weight * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Model Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-2">
              <span>Modele: {predictions.medium.modelUsed}</span>
              <span>Derniere prediction: {predictions.medium.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalysis;
