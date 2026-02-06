/**
 * Trading-IA - Plateforme de Trading Forex EUR/USD avec IA
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  LineChart,
  Zap,
  BarChart3,
  Wallet,
  Settings,
  Menu,
  X,
  TrendingUp,
  Bell,
  Brain,
  Bot,
  BookOpen,
  Globe,
} from 'lucide-react';
import {
  View,
  Portfolio,
  TradingSignal,
  Position,
  Trade,
  SignalType,
  OrderStatus,
  AppSettings,
  DEFAULT_APP_SETTINGS,
} from './types';
import TradingDashboard from './components/TradingDashboard';
import TradingSignals from './components/TradingSignals';
import Backtesting from './components/Backtesting';
import PortfolioComponent from './components/Portfolio';
import ForexChart from './components/ForexChart';
import SettingsComponent from './components/Settings';
import AdvancedAnalysis from './components/AdvancedAnalysis';
import TradingBotUI from './components/TradingBotUI';
import TradingJournal from './components/TradingJournal';
import MultiPairDashboard from './components/MultiPairDashboard';
import { getMarketData } from './services/forexService';

const STORAGE_KEY = 'trading_ia_settings_v1';

// Portfolio initial de démo
const INITIAL_PORTFOLIO: Portfolio = {
  balance: 10000,
  equity: 10000,
  margin: 0,
  freeMargin: 10000,
  marginLevel: 0,
  unrealizedPnl: 0,
  realizedPnl: 0,
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  winRate: 0,
  profitFactor: 0,
  maxDrawdown: 0,
  sharpeRatio: 0,
  positions: [],
  pendingOrders: [],
  tradeHistory: [],
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio>(INITIAL_PORTFOLIO);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  // Charger les paramètres
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.portfolio) {
          setPortfolio({
            ...INITIAL_PORTFOLIO,
            ...parsed.portfolio,
            positions: parsed.portfolio.positions || [],
            pendingOrders: parsed.portfolio.pendingOrders || [],
            tradeHistory: (parsed.portfolio.tradeHistory || []).map((t: any) => ({
              ...t,
              entryTime: new Date(t.entryTime),
              exitTime: new Date(t.exitTime),
            })),
          });
        }
        if (parsed.signals) {
          setSignals(parsed.signals.map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          })));
        }
        if (parsed.settings) {
          setSettings(parsed.settings);
        }
      } catch (e) {
        console.error('Erreur chargement paramètres:', e);
      }
    }
  }, []);

  // Sauvegarder
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      portfolio,
      signals,
      settings,
    }));
  }, [portfolio, signals, settings]);

  // Mise à jour des positions en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      if (portfolio.positions.length > 0) {
        const market = getMarketData();
        let totalUnrealizedPnl = 0;

        const updatedPositions = portfolio.positions.map(pos => {
          const currentPrice = market.currentPrice;
          let pnl: number;

          if (pos.type === 'long') {
            pnl = (currentPrice - pos.entryPrice) * pos.lotSize * 100000;
          } else {
            pnl = (pos.entryPrice - currentPrice) * pos.lotSize * 100000;
          }

          totalUnrealizedPnl += pnl;

          // Vérifier Stop Loss et Take Profit
          if (pos.stopLoss) {
            if ((pos.type === 'long' && currentPrice <= pos.stopLoss) ||
                (pos.type === 'short' && currentPrice >= pos.stopLoss)) {
              // Déclencher la fermeture
              setTimeout(() => closePosition(pos.id, currentPrice), 0);
            }
          }

          if (pos.takeProfit) {
            if ((pos.type === 'long' && currentPrice >= pos.takeProfit) ||
                (pos.type === 'short' && currentPrice <= pos.takeProfit)) {
              setTimeout(() => closePosition(pos.id, currentPrice), 0);
            }
          }

          return {
            ...pos,
            currentPrice,
            pnl,
            pnlPercent: (pnl / portfolio.balance) * 100,
          };
        });

        setPortfolio(prev => ({
          ...prev,
          positions: updatedPositions,
          unrealizedPnl: totalUnrealizedPnl,
          equity: prev.balance + totalUnrealizedPnl,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [portfolio.positions.length, portfolio.balance]);

  // Ajouter un signal
  const handleSignalGenerated = (signal: TradingSignal) => {
    setSignals(prev => [signal, ...prev].slice(0, 50));
  };

  // Exécuter un signal
  const handleExecuteSignal = (signal: TradingSignal) => {
    const market = getMarketData();
    const newPosition: Position = {
      id: `pos_${Date.now()}`,
      pair: signal.pair,
      type: signal.type === SignalType.BUY ? 'long' : 'short',
      entryPrice: market.currentPrice,
      currentPrice: market.currentPrice,
      quantity: 1,
      lotSize: 0.1,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit[0],
      openTime: new Date(),
      pnl: 0,
      pnlPercent: 0,
      commission: 0,
      swap: 0,
      status: OrderStatus.OPEN,
    };

    const margin = newPosition.lotSize * 100000 / 100;

    setPortfolio(prev => ({
      ...prev,
      positions: [...prev.positions, newPosition],
      margin: prev.margin + margin,
      freeMargin: prev.freeMargin - margin,
      marginLevel: prev.margin > 0 ? (prev.equity / (prev.margin + margin)) * 100 : 0,
    }));

    // Marquer le signal comme exécuté
    setSignals(prev =>
      prev.map(s => s.id === signal.id ? { ...s, status: 'executed' as const } : s)
    );
  };

  // Fermer une position
  const closePosition = (positionId: string, exitPrice?: number) => {
    const position = portfolio.positions.find(p => p.id === positionId);
    if (!position) return;

    const market = getMarketData();
    const finalExitPrice = exitPrice || market.currentPrice;

    let pnl: number;
    if (position.type === 'long') {
      pnl = (finalExitPrice - position.entryPrice) * position.lotSize * 100000;
    } else {
      pnl = (position.entryPrice - finalExitPrice) * position.lotSize * 100000;
    }

    const trade: Trade = {
      id: `trade_${Date.now()}`,
      pair: position.pair,
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: finalExitPrice,
      quantity: position.quantity,
      lotSize: position.lotSize,
      entryTime: position.openTime,
      exitTime: new Date(),
      pnl,
      pnlPercent: (pnl / portfolio.balance) * 100,
      commission: position.commission,
      swap: position.swap,
      duration: Date.now() - position.openTime.getTime(),
    };

    const margin = position.lotSize * 100000 / 100;
    const isWin = pnl > 0;

    setPortfolio(prev => {
      const newWins = isWin ? prev.winningTrades + 1 : prev.winningTrades;
      const newLosses = !isWin ? prev.losingTrades + 1 : prev.losingTrades;
      const newTotal = prev.totalTrades + 1;
      const newBalance = prev.balance + pnl;

      const allTrades = [...prev.tradeHistory, trade];
      const grossProfit = allTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
      const grossLoss = Math.abs(allTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));

      return {
        ...prev,
        positions: prev.positions.filter(p => p.id !== positionId),
        tradeHistory: [trade, ...prev.tradeHistory],
        balance: newBalance,
        equity: newBalance + prev.unrealizedPnl - pnl,
        margin: Math.max(0, prev.margin - margin),
        freeMargin: prev.freeMargin + margin + pnl,
        realizedPnl: prev.realizedPnl + pnl,
        totalTrades: newTotal,
        winningTrades: newWins,
        losingTrades: newLosses,
        winRate: (newWins / newTotal) * 100,
        profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
      };
    });
  };

  // Ouvrir une nouvelle position
  const openPosition = (
    type: 'long' | 'short',
    lotSize: number,
    stopLoss?: number,
    takeProfit?: number
  ) => {
    const market = getMarketData();
    const newPosition: Position = {
      id: `pos_${Date.now()}`,
      pair: 'EUR/USD',
      type,
      entryPrice: market.currentPrice,
      currentPrice: market.currentPrice,
      quantity: 1,
      lotSize,
      stopLoss: stopLoss || null,
      takeProfit: takeProfit || null,
      openTime: new Date(),
      pnl: 0,
      pnlPercent: 0,
      commission: 0,
      swap: 0,
      status: OrderStatus.OPEN,
    };

    const margin = lotSize * 100000 / 100;

    setPortfolio(prev => ({
      ...prev,
      positions: [...prev.positions, newPosition],
      margin: prev.margin + margin,
      freeMargin: prev.freeMargin - margin,
      marginLevel: prev.margin > 0 ? (prev.equity / (prev.margin + margin)) * 100 : 0,
    }));
  };

  // Modifier une position
  const modifyPosition = (
    positionId: string,
    stopLoss: number | null,
    takeProfit: number | null
  ) => {
    setPortfolio(prev => ({
      ...prev,
      positions: prev.positions.map(p =>
        p.id === positionId ? { ...p, stopLoss, takeProfit } : p
      ),
    }));
  };

  const NavItem = ({
    view,
    icon: Icon,
    label,
    badge,
  }: {
    view: View;
    icon: React.ComponentType<any>;
    label: string;
    badge?: number;
  }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-200 ${
        currentView === view
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="h-screen bg-black text-gray-200 flex font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-gray-800 z-40 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Trading IA
          </h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col p-4 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        mt-16 md:mt-0
      `}>
        {/* Logo Desktop */}
        <div className="hidden md:flex mb-8 px-2 items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Trading IA
            </h1>
            <p className="text-xs text-gray-500">EUR/USD Forex</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow space-y-2">
          <NavItem
            view={View.DASHBOARD}
            icon={LayoutDashboard}
            label="Dashboard"
          />
          <NavItem
            view={View.TRADING}
            icon={LineChart}
            label="Graphique"
          />
          <NavItem
            view={View.SIGNALS}
            icon={Zap}
            label="Signaux IA"
            badge={signals.filter(s => s.status === 'active').length}
          />
          <NavItem
            view={View.BACKTESTING}
            icon={BarChart3}
            label="Backtesting"
          />
          <NavItem
            view={View.PORTFOLIO}
            icon={Wallet}
            label="Portefeuille"
            badge={portfolio.positions.length}
          />

          {/* Separator */}
          <div className="my-3 border-t border-gray-800" />

          <NavItem
            view={View.ADVANCED}
            icon={Brain}
            label="Analyse Avancee"
          />
          <NavItem
            view={View.BOT}
            icon={Bot}
            label="Trading Bot"
          />
          <NavItem
            view={View.MULTI_PAIR}
            icon={Globe}
            label="Multi-Paires"
          />
          <NavItem
            view={View.JOURNAL}
            icon={BookOpen}
            label="Journal"
          />
          <NavItem
            view={View.SETTINGS}
            icon={Settings}
            label="Parametres"
          />
        </nav>

        {/* Portfolio Summary */}
        <div className="pt-4 border-t border-gray-800 mt-auto mb-20 md:mb-0">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">Balance</p>
              <span className={`text-xs px-2 py-0.5 rounded ${
                portfolio.unrealizedPnl >= 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {portfolio.unrealizedPnl >= 0 ? '+' : ''}
                {portfolio.unrealizedPnl.toFixed(2)}$
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${portfolio.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Positions</p>
                <p className="text-white font-medium">{portfolio.positions.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Win Rate</p>
                <p className="text-white font-medium">{portfolio.winRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col bg-[#050505] overflow-hidden relative pt-16 md:pt-0 h-[100dvh]">
        <div className="absolute top-0 left-0 w-full h-64 bg-emerald-900/10 blur-3xl pointer-events-none" />

        {currentView === View.DASHBOARD && (
          <TradingDashboard
            portfolio={portfolio}
            signals={signals}
            onNavigate={(view) => setCurrentView(view as View)}
          />
        )}

        {currentView === View.TRADING && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-white">Graphique EUR/USD</h1>
              <p className="text-gray-400">Analyse technique en temps réel</p>
            </div>
            <ForexChart />
          </div>
        )}

        {currentView === View.SIGNALS && (
          <TradingSignals
            signals={signals}
            onSignalGenerated={handleSignalGenerated}
            onExecuteSignal={handleExecuteSignal}
          />
        )}

        {currentView === View.BACKTESTING && (
          <Backtesting />
        )}

        {currentView === View.PORTFOLIO && (
          <PortfolioComponent
            portfolio={portfolio}
            onClosePosition={closePosition}
            onModifyPosition={modifyPosition}
            onOpenPosition={openPosition}
          />
        )}

        {currentView === View.SETTINGS && (
          <SettingsComponent />
        )}

        {currentView === View.ADVANCED && (
          <AdvancedAnalysis />
        )}

        {currentView === View.BOT && (
          <TradingBotUI onSignalGenerated={handleSignalGenerated} />
        )}

        {currentView === View.MULTI_PAIR && (
          <MultiPairDashboard />
        )}

        {currentView === View.JOURNAL && (
          <TradingJournal />
        )}
      </main>
    </div>
  );
};

export default App;
