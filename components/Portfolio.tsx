/**
 * Composant Portfolio - Gestion des positions et historique des trades
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  Clock,
  XCircle,
  Edit3,
  AlertTriangle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
} from 'lucide-react';
import {
  Portfolio,
  Position,
  Trade,
  Order,
  OrderType,
  OrderStatus,
  TradingSignal,
  SignalType,
} from '../types';
import { getMarketData, formatPrice, calculatePips } from '../services/forexService';

interface PortfolioProps {
  portfolio: Portfolio;
  onClosePosition: (positionId: string) => void;
  onModifyPosition: (positionId: string, stopLoss: number | null, takeProfit: number | null) => void;
  onOpenPosition: (type: 'long' | 'short', lotSize: number, stopLoss?: number, takeProfit?: number) => void;
}

const PortfolioComponent: React.FC<PortfolioProps> = ({
  portfolio,
  onClosePosition,
  onModifyPosition,
  onOpenPosition,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'orders'>('positions');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    type: 'long' as 'long' | 'short',
    lotSize: 0.1,
    stopLoss: '',
    takeProfit: '',
  });

  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    const updatePrice = () => {
      const market = getMarketData();
      setCurrentPrice(market.currentPrice);
    };
    updatePrice();
    const interval = setInterval(updatePrice, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitOrder = () => {
    onOpenPosition(
      orderForm.type,
      orderForm.lotSize,
      orderForm.stopLoss ? parseFloat(orderForm.stopLoss) : undefined,
      orderForm.takeProfit ? parseFloat(orderForm.takeProfit) : undefined
    );
    setShowNewOrder(false);
    setOrderForm({ type: 'long', lotSize: 0.1, stopLoss: '', takeProfit: '' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Portefeuille
          </h1>
          <p className="text-gray-400 mt-1">
            Gérez vos positions et suivez vos performances
          </p>
        </div>

        <button
          onClick={() => setShowNewOrder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Position
        </button>
      </div>

      {/* Stats principales */}
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
          subValue={`${portfolio.unrealizedPnl >= 0 ? '+' : ''}$${portfolio.unrealizedPnl.toFixed(2)}`}
          subColor={portfolio.unrealizedPnl >= 0 ? 'emerald' : 'red'}
          color="blue"
        />
        <StatCard
          icon={BarChart3}
          label="Marge Utilisée"
          value={`$${portfolio.margin.toFixed(2)}`}
          subValue={`Libre: $${portfolio.freeMargin.toFixed(2)}`}
          color="purple"
        />
        <StatCard
          icon={Target}
          label="Niveau Marge"
          value={`${portfolio.marginLevel.toFixed(0)}%`}
          color={portfolio.marginLevel > 200 ? 'emerald' : portfolio.marginLevel > 100 ? 'amber' : 'red'}
        />
      </div>

      {/* Performance */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <MiniStat label="Total Trades" value={portfolio.totalTrades} />
        <MiniStat label="Gagnants" value={portfolio.winningTrades} color="emerald" />
        <MiniStat label="Perdants" value={portfolio.losingTrades} color="red" />
        <MiniStat label="Win Rate" value={`${portfolio.winRate.toFixed(1)}%`} />
        <MiniStat label="Profit Factor" value={portfolio.profitFactor.toFixed(2)} />
        <MiniStat label="Max Drawdown" value={`${portfolio.maxDrawdown.toFixed(1)}%`} color="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {[
          { key: 'positions', label: 'Positions', count: portfolio.positions.length },
          { key: 'history', label: 'Historique', count: portfolio.tradeHistory.length },
          { key: 'orders', label: 'Ordres', count: portfolio.pendingOrders.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {portfolio.positions.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Aucune position ouverte"
              description="Ouvrez une nouvelle position pour commencer à trader"
            />
          ) : (
            portfolio.positions.map(position => (
              <PositionCard
                key={position.id}
                position={position}
                currentPrice={currentPrice}
                onClose={() => onClosePosition(position.id)}
                onModify={(sl, tp) => onModifyPosition(position.id, sl, tp)}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
          {portfolio.tradeHistory.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucun historique"
              description="Vos trades clôturés apparaîtront ici"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800 bg-gray-800/50">
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Paire</th>
                    <th className="p-4 font-medium">Entrée</th>
                    <th className="p-4 font-medium">Sortie</th>
                    <th className="p-4 font-medium">Lot</th>
                    <th className="p-4 font-medium">Pips</th>
                    <th className="p-4 font-medium">P&L</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {portfolio.tradeHistory.map(trade => (
                    <tr key={trade.id} className="hover:bg-gray-800/50">
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          trade.type === 'long'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type === 'long' ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td className="p-4 text-white">{trade.pair}</td>
                      <td className="p-4 font-mono text-gray-300">{trade.entryPrice.toFixed(5)}</td>
                      <td className="p-4 font-mono text-gray-300">{trade.exitPrice.toFixed(5)}</td>
                      <td className="p-4 text-gray-300">{trade.lotSize.toFixed(2)}</td>
                      <td className={`p-4 ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.type === 'long'
                          ? calculatePips(trade.entryPrice, trade.exitPrice)
                          : calculatePips(trade.exitPrice, trade.entryPrice)}
                      </td>
                      <td className={`p-4 font-medium ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}$
                      </td>
                      <td className="p-4 text-gray-400">
                        {trade.exitTime.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {portfolio.pendingOrders.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucun ordre en attente"
              description="Vos ordres limites et stop apparaîtront ici"
            />
          ) : (
            portfolio.pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}

      {/* Modal Nouvelle Position */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Nouvelle Position</h3>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderForm(f => ({ ...f, type: 'long' }))}
                    className={`p-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                      orderForm.type === 'long'
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-gray-800 border border-gray-700 text-gray-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Achat (Long)
                  </button>
                  <button
                    onClick={() => setOrderForm(f => ({ ...f, type: 'short' }))}
                    className={`p-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                      orderForm.type === 'short'
                        ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                        : 'bg-gray-800 border border-gray-700 text-gray-400'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Vente (Short)
                  </button>
                </div>
              </div>

              {/* Prix actuel */}
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-400">Prix actuel EUR/USD</p>
                <p className="text-2xl font-mono font-bold text-white">{currentPrice.toFixed(5)}</p>
              </div>

              {/* Lot Size */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">Taille du Lot</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOrderForm(f => ({ ...f, lotSize: Math.max(0.01, f.lotSize - 0.01) }))}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={orderForm.lotSize}
                    onChange={e => setOrderForm(f => ({ ...f, lotSize: parseFloat(e.target.value) || 0.01 }))}
                    step="0.01"
                    min="0.01"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-center font-mono"
                  />
                  <button
                    onClick={() => setOrderForm(f => ({ ...f, lotSize: Math.min(10, f.lotSize + 0.01) }))}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stop Loss */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">Stop Loss (optionnel)</label>
                <input
                  type="number"
                  value={orderForm.stopLoss}
                  onChange={e => setOrderForm(f => ({ ...f, stopLoss: e.target.value }))}
                  placeholder={orderForm.type === 'long' ? (currentPrice - 0.0030).toFixed(5) : (currentPrice + 0.0030).toFixed(5)}
                  step="0.00001"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono"
                />
              </div>

              {/* Take Profit */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">Take Profit (optionnel)</label>
                <input
                  type="number"
                  value={orderForm.takeProfit}
                  onChange={e => setOrderForm(f => ({ ...f, takeProfit: e.target.value }))}
                  placeholder={orderForm.type === 'long' ? (currentPrice + 0.0050).toFixed(5) : (currentPrice - 0.0050).toFixed(5)}
                  step="0.00001"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono"
                />
              </div>

              {/* Estimation */}
              <div className="bg-gray-800/50 rounded-xl p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Marge requise</span>
                  <span className="text-white">${(orderForm.lotSize * 100000 / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-400">Valeur du pip</span>
                  <span className="text-white">${(orderForm.lotSize * 10).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewOrder(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitOrder}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    orderForm.type === 'long'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {orderForm.type === 'long' ? 'Acheter' : 'Vendre'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  subValue?: string;
  subColor?: 'emerald' | 'red';
  color: string;
}> = ({ icon: Icon, label, value, subValue, subColor, color }) => {
  const colors: Record<string, string> = {
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    red: 'from-red-600/20 to-red-600/5 border-red-500/30 text-red-400',
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
      <p className="text-xl font-bold text-white">{value}</p>
      {subValue && (
        <p className={`text-sm mt-1 ${
          subColor === 'emerald' ? 'text-emerald-400' :
          subColor === 'red' ? 'text-red-400' : 'text-gray-400'
        }`}>
          {subValue}
        </p>
      )}
    </div>
  );
};

const MiniStat: React.FC<{
  label: string;
  value: string | number;
  color?: 'emerald' | 'red';
}> = ({ label, value, color }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${
        color === 'emerald' ? 'text-emerald-400' :
        color === 'red' ? 'text-red-400' : 'text-white'
      }`}>
        {value}
      </p>
    </div>
  );
};

const PositionCard: React.FC<{
  position: Position;
  currentPrice: number;
  onClose: () => void;
  onModify: (sl: number | null, tp: number | null) => void;
}> = ({ position, currentPrice, onClose, onModify }) => {
  const isLong = position.type === 'long';
  const pnl = isLong
    ? (currentPrice - position.entryPrice) * position.lotSize * 100000
    : (position.entryPrice - currentPrice) * position.lotSize * 100000;
  const pips = isLong
    ? calculatePips(position.entryPrice, currentPrice)
    : calculatePips(currentPrice, position.entryPrice);

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
      <div className={`px-6 py-4 flex items-center justify-between ${
        isLong ? 'bg-emerald-500/10' : 'bg-red-500/10'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isLong ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {isLong ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isLong ? 'text-emerald-400' : 'text-red-400'}`}>
                {isLong ? 'LONG' : 'SHORT'}
              </span>
              <span className="text-white font-medium">{position.pair}</span>
            </div>
            <p className="text-sm text-gray-400">
              {position.openTime.toLocaleString()} • Lot: {position.lotSize}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xl font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} $
          </p>
          <p className={`text-sm ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{pips} pips
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Entrée</p>
            <p className="font-mono text-white">{position.entryPrice.toFixed(5)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prix actuel</p>
            <p className="font-mono text-white">{currentPrice.toFixed(5)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Stop Loss</p>
            <p className="font-mono text-red-400">
              {position.stopLoss?.toFixed(5) || '---'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Take Profit</p>
            <p className="font-mono text-emerald-400">
              {position.takeProfit?.toFixed(5) || '---'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-medium transition-all"
          >
            <XCircle className="w-4 h-4" />
            Fermer
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            order.side === 'buy'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {order.type.toUpperCase()}
          </span>
          <span className="text-white">{order.pair}</span>
        </div>
        <div className="text-right">
          <p className="font-mono text-white">{order.price.toFixed(5)}</p>
          <p className="text-xs text-gray-400">Lot: {order.lotSize}</p>
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-gray-900/50 rounded-2xl p-12 border border-gray-800 text-center">
      <Icon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default PortfolioComponent;
