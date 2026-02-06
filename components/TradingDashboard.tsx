/**
 * Dashboard Trading - Vue d'ensemble du marché et du portefeuille
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Target,
  AlertTriangle,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Newspaper,
} from 'lucide-react';
import {
  MarketData,
  Portfolio,
  TradingSignal,
  AIAnalysis,
  TrendDirection,
  SignalType,
  TimeFrame,
} from '../types';
import { getMarketData, generateHistoricalCandles, calculateAllIndicators } from '../services/forexService';
import { analyzeMarket, generateTradingSignal } from '../services/tradingAIService';
import EconomicCalendar from './EconomicCalendar';
import NewsPanel from './NewsPanel';

interface TradingDashboardProps {
  portfolio: Portfolio;
  signals: TradingSignal[];
  onNavigate: (view: string) => void;
}

const TradingDashboard: React.FC<TradingDashboardProps> = ({
  portfolio,
  signals,
  onNavigate,
}) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateMarketData = () => {
      const data = getMarketData();
      setMarketData(data);
      setLastUpdate(new Date());
    };

    updateMarketData();
    const interval = setInterval(updateMarketData, 2000);
    return () => clearInterval(interval);
  }, []);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const candles = generateHistoricalCandles(TimeFrame.H1, 300);
      const indicators = calculateAllIndicators(candles);
      const market = getMarketData();
      const analysis = await analyzeMarket(candles, indicators, market, TimeFrame.H1);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Erreur analyse:', error);
    }
    setIsAnalyzing(false);
  };

  const activeSignals = signals.filter(s => s.status === 'active');
  const recentSignals = signals.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Trading Dashboard
          </h1>
          <p className="text-gray-400 mt-1">EUR/USD - Forex Trading avec IA</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Dernière MAJ: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {isAnalyzing ? 'Analyse...' : 'Analyse IA'}
          </button>
        </div>
      </div>

      {/* Prix EUR/USD */}
      {marketData && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl font-bold text-white font-mono">
                  {marketData.currentPrice.toFixed(5)}
                </span>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  marketData.changePercent24h >= 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {marketData.changePercent24h >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {marketData.changePercent24h >= 0 ? '+' : ''}
                    {marketData.changePercent24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              <p className="text-gray-400 mt-2">EUR/USD</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Bid</p>
                <p className="text-lg font-mono text-white">{marketData.bid.toFixed(5)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Ask</p>
                <p className="text-lg font-mono text-white">{marketData.ask.toFixed(5)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500">24h High</p>
                <p className="text-lg font-mono text-emerald-400">{marketData.high24h.toFixed(5)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500">24h Low</p>
                <p className="text-lg font-mono text-red-400">{marketData.low24h.toFixed(5)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats du Portefeuille */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Balance"
          value={`$${portfolio.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`}
          color="emerald"
        />
        <StatCard
          icon={Activity}
          label="Equity"
          value={`$${portfolio.equity.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`}
          change={portfolio.unrealizedPnl}
          color="blue"
        />
        <StatCard
          icon={Target}
          label="Win Rate"
          value={`${portfolio.winRate.toFixed(1)}%`}
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          label="Profit Factor"
          value={portfolio.profitFactor.toFixed(2)}
          color="amber"
        />
      </div>

      {/* Analyse IA */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-indigo-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Analyse IA</h3>
              <p className="text-xs text-gray-400">
                {aiAnalysis.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              aiAnalysis.recommendation === SignalType.BUY
                ? 'bg-emerald-500/20 text-emerald-400'
                : aiAnalysis.recommendation === SignalType.SELL
                ? 'bg-red-500/20 text-red-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {aiAnalysis.recommendation === SignalType.BUY ? '🟢 ACHAT' :
               aiAnalysis.recommendation === SignalType.SELL ? '🔴 VENTE' : '⚪ NEUTRE'}
            </div>
          </div>

          <p className="text-gray-300 mb-4">{aiAnalysis.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Tendance</p>
              <div className="flex items-center gap-2">
                {aiAnalysis.trend === TrendDirection.BULLISH ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : aiAnalysis.trend === TrendDirection.BEARISH ? (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                ) : (
                  <Activity className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-white font-medium capitalize">{aiAnalysis.trend}</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Confiance</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${aiAnalysis.confidence}%` }}
                  />
                </div>
                <span className="text-white font-medium">{aiAnalysis.confidence}%</span>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Sentiment</p>
              <span className={`font-medium capitalize ${
                aiAnalysis.sentiment === 'bullish' ? 'text-emerald-400' :
                aiAnalysis.sentiment === 'bearish' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {aiAnalysis.sentiment}
              </span>
            </div>
          </div>

          {aiAnalysis.reasoning.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Raisons</p>
              <ul className="space-y-1">
                {aiAnalysis.reasoning.map((reason, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-indigo-400">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Signaux Actifs et Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signaux Actifs */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Signaux Actifs
            </h3>
            <button
              onClick={() => onNavigate('signals')}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Voir tout →
            </button>
          </div>

          {activeSignals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun signal actif</p>
              <p className="text-sm">Lancez une analyse IA pour générer des signaux</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSignals.slice(0, 3).map(signal => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}
        </div>

        {/* Positions Ouvertes */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Positions Ouvertes
            </h3>
            <button
              onClick={() => onNavigate('portfolio')}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Voir tout →
            </button>
          </div>

          {portfolio.positions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune position ouverte</p>
              <p className="text-sm">Exécutez un signal pour ouvrir une position</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.positions.slice(0, 3).map(position => (
                <div
                  key={position.id}
                  className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        position.type === 'long'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {position.type === 'long' ? 'LONG' : 'SHORT'}
                      </span>
                      <span className="text-white font-medium">{position.pair}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Entrée: {position.entryPrice.toFixed(5)} | Lot: {position.lotSize}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)} $
                    </p>
                    <p className="text-xs text-gray-500">
                      {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistiques de Performance */}
      <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Performance
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Trades</p>
            <p className="text-2xl font-bold text-white">{portfolio.totalTrades}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Gagnants</p>
            <p className="text-2xl font-bold text-emerald-400">{portfolio.winningTrades}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Perdants</p>
            <p className="text-2xl font-bold text-red-400">{portfolio.losingTrades}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500">P&L Réalisé</p>
            <p className={`text-2xl font-bold ${
              portfolio.realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {portfolio.realizedPnl >= 0 ? '+' : ''}{portfolio.realizedPnl.toFixed(0)}$
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Max Drawdown</p>
            <p className="text-2xl font-bold text-amber-400">
              {portfolio.maxDrawdown.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500">Sharpe Ratio</p>
            <p className="text-2xl font-bold text-purple-400">
              {portfolio.sharpeRatio.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Calendrier Économique et News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EconomicCalendar compact={true} />
        <NewsPanel compact={true} />
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
  value: string;
  change?: number;
  color: string;
}> = ({ icon: Icon, label, value, change, color }) => {
  const colors: Record<string, string> = {
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 border`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-xl md:text-2xl font-bold text-white">{value}</p>
      {change !== undefined && (
        <p className={`text-sm mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)} $
        </p>
      )}
    </div>
  );
};

const SignalCard: React.FC<{ signal: TradingSignal }> = ({ signal }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            signal.type === SignalType.BUY
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {signal.type === SignalType.BUY ? 'ACHAT' : 'VENTE'}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            signal.strength === 'very_strong' ? 'bg-purple-500/20 text-purple-400' :
            signal.strength === 'strong' ? 'bg-blue-500/20 text-blue-400' :
            signal.strength === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {signal.strength}
          </span>
        </div>
        <span className="text-xs text-gray-500">{signal.timeframe}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Entrée</p>
          <p className="text-white font-mono">{signal.entryPrice.toFixed(5)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">SL</p>
          <p className="text-red-400 font-mono">{signal.stopLoss.toFixed(5)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">TP1</p>
          <p className="text-emerald-400 font-mono">{signal.takeProfit[0]?.toFixed(5)}</p>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-400">R:R {signal.riskRewardRatio}</span>
        <span className="text-xs text-indigo-400">{signal.confidence}% confiance</span>
      </div>
    </div>
  );
};

export default TradingDashboard;
