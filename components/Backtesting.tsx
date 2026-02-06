/**
 * Composant Backtesting - Test de stratégies sur données historiques
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Activity,
  Award,
  Calendar,
} from 'lucide-react';
import {
  BacktestResult,
  BacktestConfig,
  BacktestStrategy,
  BacktestTrade,
  TimeFrame,
} from '../types';
import { generateHistoricalCandles } from '../services/forexService';
import { runBacktest, PREDEFINED_STRATEGIES } from '../services/backtestingEngine';

interface BacktestingProps {
  onBacktestComplete?: (result: BacktestResult) => void;
}

const Backtesting: React.FC<BacktestingProps> = ({ onBacktestComplete }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<BacktestStrategy>(PREDEFINED_STRATEGIES[0]);
  const [initialBalance, setInitialBalance] = useState(10000);
  const [timeframe, setTimeframe] = useState<TimeFrame>(TimeFrame.H1);
  const [candleCount, setCandleCount] = useState(1000);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const candles = generateHistoricalCandles(timeframe, candleCount);

      const config: BacktestConfig = {
        strategy: selectedStrategy,
        startDate: candles[0].date,
        endDate: candles[candles.length - 1].date,
        initialBalance,
        leverage: 100,
        commission: 0,
        spread: 0.00015,
        slippage: 0,
      };

      const backtestResult = await runBacktest(candles, config, (p) => {
        setProgress(p);
      });

      setResult(backtestResult);
      onBacktestComplete?.(backtestResult);
    } catch (err) {
      setError('Erreur lors du backtesting');
      console.error(err);
    }

    setIsRunning(false);
    setProgress(100);
  };

  // Dessiner la courbe d'equity
  useEffect(() => {
    if (!result || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 200 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = 200;

    // Fond
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    const { equityCurve } = result;
    if (equityCurve.length < 2) return;

    const equities = equityCurve.map(e => e.equity);
    const maxEquity = Math.max(...equities);
    const minEquity = Math.min(...equities);
    const range = maxEquity - minEquity || 1;

    // Grille
    ctx.strokeStyle = '#1f1f1f';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Ligne de base (capital initial)
    const baseY = height - ((initialBalance - minEquity) / range) * height;
    ctx.strokeStyle = '#4b5563';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(width, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Courbe d'equity
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    ctx.beginPath();
    ctx.moveTo(0, height);

    equityCurve.forEach((point, i) => {
      const x = (i / (equityCurve.length - 1)) * width;
      const y = height - ((point.equity - minEquity) / range) * height;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Ligne de la courbe
    ctx.beginPath();
    equityCurve.forEach((point, i) => {
      const x = (i / (equityCurve.length - 1)) * width;
      const y = height - ((point.equity - minEquity) / range) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = result.totalReturn >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [result, initialBalance]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Backtesting
          </h1>
          <p className="text-gray-400 mt-1">
            Testez vos stratégies sur les données historiques EUR/USD
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stratégie */}
        <div className="lg:col-span-2 bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Stratégie</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {PREDEFINED_STRATEGIES.map(strategy => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedStrategy.id === strategy.id
                    ? 'bg-indigo-500/20 border-indigo-500/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <h4 className="font-medium text-white">{strategy.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{strategy.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {strategy.indicators.map((ind, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Détails de la stratégie */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3">Paramètres de la stratégie</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Stop Loss</p>
                <p className="text-white">{selectedStrategy.stopLossType} ({selectedStrategy.stopLossValue})</p>
              </div>
              <div>
                <p className="text-gray-500">Take Profit</p>
                <p className="text-white">{selectedStrategy.takeProfitType} ({selectedStrategy.takeProfitValue})</p>
              </div>
              <div>
                <p className="text-gray-500">Risque/Trade</p>
                <p className="text-white">{selectedStrategy.riskPerTrade}%</p>
              </div>
              <div>
                <p className="text-gray-500">Positions Max</p>
                <p className="text-white">{selectedStrategy.maxOpenPositions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Paramètres</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Capital Initial ($)</label>
              <input
                type="number"
                value={initialBalance}
                onChange={e => setInitialBalance(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Timeframe</label>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value as TimeFrame)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              >
                {Object.values(TimeFrame).map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Nombre de bougies</label>
              <input
                type="number"
                value={candleCount}
                onChange={e => setCandleCount(Number(e.target.value))}
                min={100}
                max={5000}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={runTest}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Test en cours... {progress.toFixed(0)}%
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Lancer le Backtest
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progression */}
      {isRunning && (
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Progression</span>
            <span className="text-white font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Résultats */}
      {result && (
        <>
          {/* Métriques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={DollarSign}
              label="Profit Net"
              value={`${result.totalReturn >= 0 ? '+' : ''}$${result.totalReturn.toFixed(2)}`}
              color={result.totalReturn >= 0 ? 'emerald' : 'red'}
            />
            <MetricCard
              icon={Percent}
              label="Rendement"
              value={`${result.totalReturnPercent >= 0 ? '+' : ''}${result.totalReturnPercent.toFixed(2)}%`}
              color={result.totalReturnPercent >= 0 ? 'emerald' : 'red'}
            />
            <MetricCard
              icon={Target}
              label="Win Rate"
              value={`${result.metrics.winRate.toFixed(1)}%`}
              color={result.metrics.winRate >= 50 ? 'emerald' : 'amber'}
            />
            <MetricCard
              icon={Activity}
              label="Profit Factor"
              value={result.metrics.profitFactor.toFixed(2)}
              color={result.metrics.profitFactor >= 1.5 ? 'emerald' : 'amber'}
            />
          </div>

          {/* Courbe d'equity */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Courbe d'Equity</h3>
            <div className="relative h-[200px]">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <div className="flex justify-between mt-4 text-sm text-gray-400">
              <span>Capital Initial: ${initialBalance.toLocaleString()}</span>
              <span>Capital Final: ${result.finalBalance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Métriques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Performance
              </h3>
              <div className="space-y-3">
                <MetricRow label="Total Trades" value={result.metrics.totalTrades} />
                <MetricRow label="Trades Gagnants" value={result.metrics.winningTrades} color="emerald" />
                <MetricRow label="Trades Perdants" value={result.metrics.losingTrades} color="red" />
                <MetricRow label="Profit Brut" value={`$${result.metrics.grossProfit.toFixed(2)}`} color="emerald" />
                <MetricRow label="Perte Brute" value={`$${result.metrics.grossLoss.toFixed(2)}`} color="red" />
                <MetricRow label="Plus Gros Gain" value={`$${result.metrics.largestWin.toFixed(2)}`} color="emerald" />
                <MetricRow label="Plus Grosse Perte" value={`$${result.metrics.largestLoss.toFixed(2)}`} color="red" />
              </div>
            </div>

            {/* Risque */}
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Risque
              </h3>
              <div className="space-y-3">
                <MetricRow label="Max Drawdown" value={`${result.metrics.maxDrawdownPercent.toFixed(2)}%`} color="red" />
                <MetricRow label="Sharpe Ratio" value={result.metrics.sharpeRatio.toFixed(2)} />
                <MetricRow label="Sortino Ratio" value={result.metrics.sortinoRatio.toFixed(2)} />
                <MetricRow label="Calmar Ratio" value={result.metrics.calmarRatio.toFixed(2)} />
                <MetricRow label="Recovery Factor" value={result.metrics.recoveryFactor.toFixed(2)} />
                <MetricRow label="Expectancy" value={`$${result.metrics.expectancy.toFixed(2)}`} />
                <MetricRow label="Temps Moyen/Trade" value={`${result.metrics.averageHoldingTime.toFixed(1)}h`} />
              </div>
            </div>
          </div>

          {/* Historique des trades */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Historique des Trades ({result.trades.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Entrée</th>
                    <th className="pb-3 font-medium">Sortie</th>
                    <th className="pb-3 font-medium">Lot</th>
                    <th className="pb-3 font-medium">P&L</th>
                    <th className="pb-3 font-medium">Raison</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {result.trades.slice(0, 20).map((trade, i) => (
                    <tr key={i} className="hover:bg-gray-800/50">
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          trade.type === 'long'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type === 'long' ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-gray-300">{trade.entryPrice.toFixed(5)}</td>
                      <td className="py-3 font-mono text-gray-300">{trade.exitPrice.toFixed(5)}</td>
                      <td className="py-3 text-gray-300">{trade.lotSize.toFixed(2)}</td>
                      <td className={`py-3 font-medium ${
                        trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}$
                      </td>
                      <td className="py-3 text-gray-400">{trade.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.trades.length > 20 && (
                <p className="text-center text-gray-500 mt-4">
                  ... et {result.trades.length - 20} trades de plus
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// COMPOSANTS AUXILIAIRES
// ============================================

const MetricCard: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  color: string;
}> = ({ icon: Icon, label, value, color }) => {
  const colors: Record<string, string> = {
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/30 text-red-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/30 text-amber-400',
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

const MetricRow: React.FC<{
  label: string;
  value: string | number;
  color?: 'emerald' | 'red';
}> = ({ label, value, color }) => {
  const textColor = color === 'emerald' ? 'text-emerald-400' :
                    color === 'red' ? 'text-red-400' : 'text-white';

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className={`font-medium ${textColor}`}>{value}</span>
    </div>
  );
};

export default Backtesting;
