import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Activity, BarChart3 } from 'lucide-react';
import { useTrainingLogs, useLatestTrainingLog } from '@/hooks/useTrainingLogs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatCard } from '@/components/dashboard/StatCard';
import { LivePriceSection } from '@/components/dashboard/LivePriceSection';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { PatternsAndAlerts } from '@/components/dashboard/PatternsAndAlerts';
import { TrainingHistory } from '@/components/dashboard/TrainingHistory';
import { NotificationToast } from '@/components/dashboard/NotificationToast';
import { HeaderActions } from '@/components/dashboard/HeaderActions';

interface SimpleDashboardProps {
  logs: any[];
}

const SimpleDashboard = ({ logs }: SimpleDashboardProps) => {
  const { data: allTrainingLogs, isLoading: isLoadingLogs } = useTrainingLogs();
  const { data: latestLog, isLoading: isLoadingLatest } = useLatestTrainingLog();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [showNotification, setShowNotification] = useState(false);
  const [livePrice, setLivePrice] = useState(1.0856);
  const [priceChange, setPriceChange] = useState(0.0012);
  
  const trainingData = allTrainingLogs || logs || [];
  const currentLog = latestLog || trainingData[0];
  
  // Simulation de données en temps réel pour le prix
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.001;
      setLivePrice(prev => +(prev + change).toFixed(4));
      setPriceChange(prev => +(prev + change).toFixed(4));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Données de performance basées sur les vrais logs d'entraînement
  const performanceData = trainingData.slice(0, 7).map((log, index) => ({
    day: format(new Date(log.training_date || new Date()), "EEE", { locale: fr }),
    profit: log.best_pattern_profit || 0,
    trades: log.total_trades_analyzed || 0,
    winRate: log.win_rate || 0
  })).reverse();

  // Top patterns basés sur les vraies données
  const patternsMap = new Map();
  trainingData.forEach(log => {
    if (log.best_pattern_name && log.best_pattern_profit) {
      const existing = patternsMap.get(log.best_pattern_name) || { profit: 0, count: 0, totalProfit: 0 };
      existing.totalProfit += log.best_pattern_profit;
      existing.count += 1;
      existing.profit = existing.totalProfit / existing.count;
      patternsMap.set(log.best_pattern_name, existing);
    }
  });

  const patternsData = Array.from(patternsMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.count,
      profit: data.profit
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Graphique de prix (simulation)
  const priceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    price: 1.0850 + (Math.random() - 0.5) * 0.01,
  }));

  // Calcul des statistiques réelles
  const avgWinRate = trainingData.length > 0 
    ? trainingData.reduce((sum, log) => sum + (log.win_rate || 0), 0) / trainingData.length 
    : 68.5;

  const totalProfit = trainingData.reduce((sum, log) => sum + (log.best_pattern_profit || 0), 0);
  
  const avgSharpe = trainingData.length > 0 
    ? trainingData.reduce((sum, log) => sum + (log.sharpe_ratio || 0), 0) / trainingData.length 
    : 1.85;

  const avgTrades = trainingData.length > 0 
    ? trainingData.reduce((sum, log) => sum + (log.total_trades_analyzed || 0), 0) / trainingData.length / 7
    : 2.8;

  // Notification toast
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoadingLogs || isLoadingLatest) {
    return (
      <div className="min-h-screen bg-[#141413] text-[#FAFAF8] p-2 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-[#8989DE] mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141413] text-[#FAFAF8] p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <header className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#8989DE] to-[#6366F1] rounded-lg sm:rounded-xl">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>
              <span className="leading-tight">Tableau de bord IA Trading</span>
            </h1>
            <p className="text-[#E6E4DD] mt-1 sm:mt-2 text-sm sm:text-base">Stratégie {currentLog?.strategy_version || 'MWD'} - EUR/USD</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderActions currentLog={currentLog} />
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#8989DE] to-[#6366F1] rounded-lg font-medium text-sm sm:text-base">
              {currentLog?.training_level || 'LEARNING'}
            </div>
          </div>
        </div>
      </header>

      {/* Prix en temps réel */}
      <LivePriceSection 
        livePrice={livePrice}
        priceChange={priceChange}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
      />

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <StatCard
          icon={TrendingUp}
          title="Win Rate"
          value={`${avgWinRate.toFixed(1)}%`}
          change={5.2}
          trend="up"
          color="success"
        />
        <StatCard
          icon={DollarSign}
          title="Profit Total"
          value={`+${totalProfit.toFixed(1)}%`}
          change={2.1}
          trend="up"
          color="success"
        />
        <StatCard
          icon={Target}
          title="Sharpe Ratio"
          value={avgSharpe.toFixed(2)}
          change={0.15}
          trend="up"
          color="primary"
        />
        <StatCard
          icon={Activity}
          title="Trades/Semaine"
          value={avgTrades.toFixed(1)}
          change={-0.2}
          trend="down"
          color="warning"
        />
      </div>

      {/* Graphiques principaux */}
      <PerformanceCharts 
        priceData={priceData}
        performanceData={performanceData}
      />

      {/* Patterns et Alertes */}
      <PatternsAndAlerts 
        patternsData={patternsData}
        currentLog={currentLog}
      />

      {/* Historique des trades */}
      <TrainingHistory trainingData={trainingData} />

      {/* Notification Toast */}
      <NotificationToast 
        show={showNotification}
        currentLog={currentLog}
      />
    </div>
  );
};

export default SimpleDashboard;
