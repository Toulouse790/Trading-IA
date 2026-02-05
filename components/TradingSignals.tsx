/**
 * Composant Signaux de Trading avec génération IA
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Bell,
} from 'lucide-react';
import {
  TradingSignal,
  SignalType,
  SignalStrength,
  TimeFrame,
  TechnicalIndicators,
  MarketData,
} from '../types';
import {
  generateHistoricalCandles,
  calculateAllIndicators,
  getMarketData,
  getTimeframeLabel,
} from '../services/forexService';
import { generateTradingSignal } from '../services/tradingAIService';
import ForexChart from './ForexChart';

interface TradingSignalsProps {
  signals: TradingSignal[];
  onSignalGenerated: (signal: TradingSignal) => void;
  onExecuteSignal: (signal: TradingSignal) => void;
}

const TradingSignals: React.FC<TradingSignalsProps> = ({
  signals,
  onSignalGenerated,
  onExecuteSignal,
}) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>(TimeFrame.H1);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'active'>('all');
  const [error, setError] = useState<string | null>(null);

  // Génération automatique
  useEffect(() => {
    if (!autoGenerate) return;

    const interval = setInterval(() => {
      generateSignal();
    }, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, [autoGenerate, timeframe]);

  const generateSignal = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const candles = generateHistoricalCandles(timeframe, 300);
      const ind = calculateAllIndicators(candles);
      const market = getMarketData();

      setIndicators(ind);

      const signal = await generateTradingSignal(candles, ind, market, timeframe);

      if (signal) {
        onSignalGenerated(signal);
      } else {
        setError('Pas de signal clair détecté. Marché neutre.');
      }
    } catch (err) {
      setError('Erreur lors de la génération du signal');
      console.error(err);
    }

    setIsGenerating(false);
  };

  const filteredSignals = signals.filter(signal => {
    if (filter === 'all') return true;
    if (filter === 'buy') return signal.type === SignalType.BUY;
    if (filter === 'sell') return signal.type === SignalType.SELL;
    if (filter === 'active') return signal.status === 'active';
    return true;
  });

  const activeSignals = signals.filter(s => s.status === 'active');
  const buySignals = signals.filter(s => s.type === SignalType.BUY);
  const sellSignals = signals.filter(s => s.type === SignalType.SELL);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Signaux de Trading IA
          </h1>
          <p className="text-gray-400 mt-1">
            Signaux générés par intelligence artificielle pour EUR/USD
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoGenerate(!autoGenerate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              autoGenerate
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {autoGenerate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {autoGenerate ? 'Auto ON' : 'Auto OFF'}
          </button>

          <button
            onClick={generateSignal}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Générer Signal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Signaux Actifs"
          value={activeSignals.length}
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Signaux Achat"
          value={buySignals.length}
          color="emerald"
        />
        <StatCard
          icon={TrendingDown}
          label="Signaux Vente"
          value={sellSignals.length}
          color="red"
        />
        <StatCard
          icon={Target}
          label="Total"
          value={signals.length}
          color="blue"
        />
      </div>

      {/* Graphique */}
      <ForexChart
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        signals={activeSignals}
        onIndicatorsCalculated={setIndicators}
      />

      {/* Erreur */}
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-200">{error}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtrer:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'buy', 'sell'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-lg transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : f === 'buy' ? 'Achat' : 'Vente'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des signaux */}
      <div className="space-y-4">
        {filteredSignals.length === 0 ? (
          <div className="bg-gray-900/50 rounded-2xl p-12 border border-gray-800 text-center">
            <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucun signal</h3>
            <p className="text-gray-400 mb-4">
              Générez votre premier signal IA en cliquant sur le bouton ci-dessus
            </p>
            <button
              onClick={generateSignal}
              disabled={isGenerating}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              Générer un signal
            </button>
          </div>
        ) : (
          filteredSignals.map(signal => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onExecute={() => onExecuteSignal(signal)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPOSANTS AUXILIAIRES
// ============================================

const StatCard: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => {
  const colors: Record<string, string> = {
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/30 text-red-400',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 border`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

const SignalCard: React.FC<{
  signal: TradingSignal;
  onExecute: () => void;
}> = ({ signal, onExecute }) => {
  const isBuy = signal.type === SignalType.BUY;
  const isActive = signal.status === 'active';

  const strengthColors: Record<SignalStrength, string> = {
    [SignalStrength.WEAK]: 'bg-gray-500/20 text-gray-400',
    [SignalStrength.MODERATE]: 'bg-amber-500/20 text-amber-400',
    [SignalStrength.STRONG]: 'bg-blue-500/20 text-blue-400',
    [SignalStrength.VERY_STRONG]: 'bg-purple-500/20 text-purple-400',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    active: <Clock className="w-4 h-4 text-amber-400" />,
    executed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    expired: <XCircle className="w-4 h-4 text-gray-400" />,
    cancelled: <XCircle className="w-4 h-4 text-red-400" />,
  };

  return (
    <div className={`bg-gray-900/50 rounded-2xl border ${
      isActive ? 'border-indigo-500/30' : 'border-gray-800'
    } overflow-hidden`}>
      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${
        isBuy ? 'bg-emerald-500/10' : 'bg-red-500/10'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isBuy ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {isBuy ? (
              <ArrowUpRight className="w-6 h-6 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${
                isBuy ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isBuy ? 'ACHAT' : 'VENTE'} EUR/USD
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                strengthColors[signal.strength]
              }`}>
                {signal.strength.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              {statusIcons[signal.status]}
              {signal.timestamp.toLocaleString()} • {signal.timeframe}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-gray-500">Confiance</span>
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  signal.confidence >= 70 ? 'bg-emerald-500' :
                  signal.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${signal.confidence}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white">{signal.confidence}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">R:R {signal.riskRewardRatio}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <PriceBox label="Entrée" value={signal.entryPrice} />
          <PriceBox label="Stop Loss" value={signal.stopLoss} color="red" />
          <PriceBox label="TP1" value={signal.takeProfit[0]} color="emerald" />
          {signal.takeProfit[1] && (
            <PriceBox label="TP2" value={signal.takeProfit[1]} color="emerald" />
          )}
        </div>

        {/* Reasoning */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300">{signal.reasoning}</p>
          {signal.indicators.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {signal.indicators.map((ind, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-400"
                >
                  {ind}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {isActive && (
          <div className="flex items-center gap-3">
            <button
              onClick={onExecute}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                isBuy
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              Exécuter le signal
            </button>
            <button className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PriceBox: React.FC<{
  label: string;
  value: number;
  color?: 'red' | 'emerald';
}> = ({ label, value, color }) => {
  const textColor = color === 'red' ? 'text-red-400' :
                    color === 'emerald' ? 'text-emerald-400' : 'text-white';

  return (
    <div className="bg-gray-800/50 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-mono font-medium ${textColor}`}>
        {value.toFixed(5)}
      </p>
    </div>
  );
};

export default TradingSignals;
