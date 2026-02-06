/**
 * Trading Bot UI Component
 * Interface for configuring and monitoring the trading bot
 */

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Play,
  Square,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Target,
  Shield,
  Zap,
  RefreshCw,
  Info,
} from 'lucide-react';
import { TimeFrame, TradingSignal } from '../types';
import {
  TradingBot,
  BotConfig,
  BotState,
  BotStrategy,
  BOT_PRESETS,
  getTradingBot,
  BotLog,
} from '../services/tradingBot';

interface TradingBotUIProps {
  onSignalGenerated?: (signal: TradingSignal) => void;
}

const TradingBotUI: React.FC<TradingBotUIProps> = ({ onSignalGenerated }) => {
  const [bot] = useState(() => getTradingBot());
  const [config, setConfig] = useState<BotConfig>(bot.getConfig());
  const [state, setState] = useState<BotState>(bot.getState());
  const [showSettings, setShowSettings] = useState(false);
  const [logs, setLogs] = useState<BotLog[]>([]);

  useEffect(() => {
    // Set up callbacks
    bot.onNewSignal((signal) => {
      if (onSignalGenerated) {
        onSignalGenerated(signal);
      }
      setState(bot.getState());
    });

    bot.onNewLog((log) => {
      setLogs(prev => [log, ...prev].slice(0, 50));
    });

    // Update state periodically
    const interval = setInterval(() => {
      setState(bot.getState());
    }, 5000);

    return () => clearInterval(interval);
  }, [bot, onSignalGenerated]);

  const handleStart = () => {
    bot.start();
    setState(bot.getState());
  };

  const handleStop = () => {
    bot.stop();
    setState(bot.getState());
  };

  const handleStrategyChange = (strategy: BotStrategy) => {
    const preset = BOT_PRESETS[strategy];
    const newConfig = { ...config, ...preset, strategy };
    setConfig(newConfig);
    bot.updateConfig(newConfig);
  };

  const handleConfigChange = (key: keyof BotConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    bot.updateConfig(newConfig);
  };

  const getLogIcon = (level: BotLog['level']) => {
    switch (level) {
      case 'trade': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            state.isRunning ? 'bg-emerald-500/20' : 'bg-gray-800'
          }`}>
            <Bot className={`w-7 h-7 ${state.isRunning ? 'text-emerald-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Trading Bot</h1>
            <p className="text-gray-400">
              {state.isRunning ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  En cours d'execution
                </span>
              ) : (
                'Arrete'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
          >
            <Settings className="w-4 h-4" />
            Configuration
          </button>
          {state.isRunning ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all"
            >
              <Square className="w-4 h-4" />
              Arreter
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
            >
              <Play className="w-4 h-4" />
              Demarrer
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Configuration du Bot
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Strategy Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Strategie</label>
              <select
                value={config.strategy}
                onChange={(e) => handleStrategyChange(e.target.value as BotStrategy)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="conservative">Conservateur</option>
                <option value="moderate">Modere</option>
                <option value="aggressive">Agressif</option>
                <option value="scalping">Scalping</option>
                <option value="swing">Swing Trading</option>
              </select>
            </div>

            {/* Lot Size */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Taille de lot</label>
              <input
                type="number"
                value={config.lotSize}
                onChange={(e) => handleConfigChange('lotSize', parseFloat(e.target.value))}
                step="0.01"
                min="0.01"
                max="10"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Max Positions */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Positions max</label>
              <input
                type="number"
                value={config.maxPositions}
                onChange={(e) => handleConfigChange('maxPositions', parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Max Daily Loss */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Perte max journaliere (%)</label>
              <input
                type="number"
                value={config.maxDailyLoss}
                onChange={(e) => handleConfigChange('maxDailyLoss', parseFloat(e.target.value))}
                min="1"
                max="20"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Max Daily Trades */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Trades max par jour</label>
              <input
                type="number"
                value={config.maxDailyTrades}
                onChange={(e) => handleConfigChange('maxDailyTrades', parseInt(e.target.value))}
                min="1"
                max="50"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Min Confidence */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Confiance minimale (%)</label>
              <input
                type="number"
                value={config.minConfidence}
                onChange={(e) => handleConfigChange('minConfidence', parseInt(e.target.value))}
                min="50"
                max="95"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            {/* Analysis Options */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm text-gray-400 mb-2">Options d'analyse</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useMultiTimeframe}
                    onChange={(e) => handleConfigChange('useMultiTimeframe', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-white">Multi-Timeframe</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.usePatternRecognition}
                    onChange={(e) => handleConfigChange('usePatternRecognition', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-white">Patterns</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useMLPrediction}
                    onChange={(e) => handleConfigChange('useMLPrediction', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-white">Machine Learning</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Trades aujourd'hui"
          value={`${state.todayTrades} / ${config.maxDailyTrades}`}
          color="blue"
        />
        <StatCard
          icon={state.todayPnl >= 0 ? TrendingUp : TrendingDown}
          label="P&L du jour"
          value={`${state.todayPnl >= 0 ? '+' : ''}${state.todayPnl.toFixed(2)}$`}
          color={state.todayPnl >= 0 ? 'emerald' : 'red'}
        />
        <StatCard
          icon={Target}
          label="Positions ouvertes"
          value={`${state.openPositions} / ${config.maxPositions}`}
          color="purple"
        />
        <StatCard
          icon={Shield}
          label="Win Rate"
          value={`${state.performance.winRate.toFixed(1)}%`}
          color="amber"
        />
      </div>

      {/* Performance & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Performance
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Total Trades</p>
              <p className="text-xl font-bold text-white">{state.performance.totalTrades}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-500">P&L Total</p>
              <p className={`text-xl font-bold ${
                state.performance.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {state.performance.totalPnl >= 0 ? '+' : ''}{state.performance.totalPnl.toFixed(2)}$
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Gagnants</p>
              <p className="text-xl font-bold text-emerald-400">{state.performance.winningTrades}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Perdants</p>
              <p className="text-xl font-bold text-red-400">{state.performance.losingTrades}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Gain moyen</p>
              <p className="text-xl font-bold text-emerald-400">
                +{state.performance.averageWin.toFixed(2)}$
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Perte moyenne</p>
              <p className="text-xl font-bold text-red-400">
                -{state.performance.averageLoss.toFixed(2)}$
              </p>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Activite Recente
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Aucune activite</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-2 rounded-lg ${
                    log.level === 'trade' ? 'bg-amber-900/20' :
                    log.level === 'error' ? 'bg-red-900/20' :
                    log.level === 'warning' ? 'bg-amber-900/10' :
                    'bg-gray-800/30'
                  }`}
                >
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{log.message}</p>
                    <p className="text-xs text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      {state.signals.length > 0 && (
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Signaux Generes par le Bot
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.signals.slice(0, 6).map((signal) => (
              <div
                key={signal.id}
                className={`rounded-xl p-4 border ${
                  signal.type === 'buy'
                    ? 'bg-emerald-900/20 border-emerald-500/30'
                    : 'bg-red-900/20 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    signal.type === 'buy'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {signal.type === 'buy' ? 'ACHAT' : 'VENTE'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {signal.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-lg font-mono text-white mb-1">
                  {signal.entryPrice.toFixed(5)}
                </p>
                <p className="text-xs text-gray-400 truncate">{signal.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  color: string;
}> = ({ icon: Icon, label, value, color }) => {
  const colors: Record<string, string> = {
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/30 text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 border`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
};

export default TradingBotUI;
