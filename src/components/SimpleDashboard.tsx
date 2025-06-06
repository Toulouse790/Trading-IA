
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, Activity, DollarSign, Target, Brain, Clock, Award, Calendar, ArrowUpRight, ArrowDownRight, Info, Bell, Settings, ChevronRight, Zap, Shield, BarChart3 } from 'lucide-react';

interface SimpleDashboardProps {
  logs: any[];
}

const SimpleDashboard = ({ logs }: SimpleDashboardProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [showNotification, setShowNotification] = useState(false);
  const [livePrice, setLivePrice] = useState(1.0856);
  const [priceChange, setPriceChange] = useState(0.0012);
  
  // Simulation de données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 0.001;
      setLivePrice(prev => +(prev + change).toFixed(4));
      setPriceChange(prev => +(prev + change).toFixed(4));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Données de performance
  const performanceData = [
    { day: 'Lun', profit: 1.2, trades: 2 },
    { day: 'Mar', profit: 2.5, trades: 3 },
    { day: 'Mer', profit: -0.8, trades: 1 },
    { day: 'Jeu', profit: 3.2, trades: 3 },
    { day: 'Ven', profit: 1.8, trades: 2 },
    { day: 'Sam', profit: 0.5, trades: 1 },
    { day: 'Dim', profit: 0, trades: 0 },
  ];

  // Données des patterns
  const patternsData = [
    { name: 'HAMMER', value: 35, profit: 2.5 },
    { name: 'ENGULFING', value: 25, profit: 1.8 },
    { name: 'DOJI', value: 20, profit: 1.2 },
    { name: 'PIN_BAR', value: 15, profit: 0.9 },
    { name: 'INSIDE_BAR', value: 5, profit: 0.5 },
  ];

  // Historique des trades
  const tradesHistory = [
    { id: 1, date: '06/06/2025 09:15', pair: 'EUR/USD', type: 'BUY', entry: 1.0845, exit: 1.0862, profit: 1.5, status: 'win' },
    { id: 2, date: '06/06/2025 11:30', pair: 'EUR/USD', type: 'SELL', entry: 1.0868, exit: 1.0855, profit: 1.1, status: 'win' },
    { id: 3, date: '05/06/2025 14:22', pair: 'EUR/USD', type: 'BUY', entry: 1.0832, exit: 1.0828, profit: -0.4, status: 'loss' },
    { id: 4, date: '05/06/2025 16:45', pair: 'EUR/USD', type: 'SELL', entry: 1.0851, exit: 1.0839, profit: 1.0, status: 'win' },
  ];

  // Graphique de prix
  const priceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    price: 1.0850 + (Math.random() - 0.5) * 0.01,
  }));

  const COLORS = ['#8989DE', '#7EBF8E', '#D2886F', '#6366F1', '#EC4899'];

  // Composant de carte statistique
  const StatCard = ({ icon: Icon, title, value, change, trend, color = 'primary' }: {
    icon: any;
    title: string;
    value: string;
    change?: number;
    trend?: 'up' | 'down';
    color?: 'primary' | 'success' | 'warning' | 'danger';
  }) => {
    const colorClasses = {
      primary: 'bg-[#8989DE]/10 text-[#8989DE]',
      success: 'bg-[#7EBF8E]/10 text-[#7EBF8E]',
      warning: 'bg-[#D2886F]/10 text-[#D2886F]',
      danger: 'bg-red-500/10 text-red-500',
    };

    return (
      <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50 hover:border-[#8989DE]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#8989DE]/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-[#E6E4DD] text-sm font-medium">{title}</p>
            </div>
            <p className="text-2xl font-bold text-[#FAFAF8]">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-[#7EBF8E]" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${trend === 'up' ? 'text-[#7EBF8E]' : 'text-red-500'}`}>
                  {change}%
                </span>
                <span className="text-xs text-[#605F5B]">vs hier</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Notification toast
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#141413] text-[#FAFAF8] p-4 lg:p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#8989DE] to-[#6366F1] rounded-xl">
                <BarChart3 className="w-8 h-8" />
              </div>
              Tableau de bord IA Trading
            </h1>
            <p className="text-[#E6E4DD] mt-2">Stratégie MWD - EUR/USD</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-lg bg-[#1F1F1E] hover:bg-[#3A3935] transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-3 rounded-lg bg-[#1F1F1E] hover:bg-[#3A3935] transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 bg-gradient-to-r from-[#8989DE] to-[#6366F1] rounded-lg font-medium">
              Mode Expert
            </div>
          </div>
        </div>
      </header>

      {/* Prix en temps réel */}
      <div className="bg-gradient-to-r from-[#1F1F1E] to-[#2A2A29] rounded-2xl p-6 mb-6 border border-[#3A3935]/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold">EUR/USD</h2>
              <span className="px-3 py-1 bg-[#7EBF8E]/20 text-[#7EBF8E] rounded-full text-sm font-medium">
                Live
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">{livePrice}</span>
              <span className={`text-lg font-medium flex items-center gap-1 ${priceChange >= 0 ? 'text-[#7EBF8E]' : 'text-red-500'}`}>
                {priceChange >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                {Math.abs(priceChange).toFixed(4)} ({((priceChange / livePrice) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-[#8989DE] text-white'
                    : 'bg-[#3A3935]/50 hover:bg-[#3A3935] text-[#E6E4DD]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          title="Win Rate"
          value="68.5%"
          change={5.2}
          trend="up"
          color="success"
        />
        <StatCard
          icon={DollarSign}
          title="Profit Hebdo"
          value="+7.8%"
          change={2.1}
          trend="up"
          color="success"
        />
        <StatCard
          icon={Target}
          title="Sharpe Ratio"
          value="1.85"
          change={0.15}
          trend="up"
          color="primary"
        />
        <StatCard
          icon={Activity}
          title="Trades/Semaine"
          value="2.8"
          change={-0.2}
          trend="down"
          color="warning"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique de prix */}
        <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#8989DE]" />
            Évolution du Prix
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8989DE" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8989DE" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3935" />
              <XAxis dataKey="time" stroke="#605F5B" />
              <YAxis stroke="#605F5B" domain={['dataMin - 0.002', 'dataMax + 0.002']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F1F1E', 
                  border: '1px solid #3A3935',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8989DE" 
                fillOpacity={1} 
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Performance par jour */}
        <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#7EBF8E]" />
            Performance Hebdomadaire
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3935" />
              <XAxis dataKey="day" stroke="#605F5B" />
              <YAxis stroke="#605F5B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F1F1E', 
                  border: '1px solid #3A3935',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="profit" 
                fill="#8989DE"
                radius={[8, 8, 0, 0]}
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit > 0 ? '#7EBF8E' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Patterns et Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Patterns */}
        <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#8989DE]" />
            Top Patterns Détectés
          </h3>
          <div className="space-y-3">
            {patternsData.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#141413] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[index] }} />
                  <span className="font-medium">{pattern.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#7EBF8E] font-medium">+{pattern.profit}%</p>
                  <p className="text-xs text-[#605F5B]">{pattern.value} trades</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes récentes */}
        <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#D2886F]" />
            Alertes Récentes
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#7EBF8E]/10 rounded-lg border border-[#7EBF8E]/20">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-[#7EBF8E]/20 rounded">
                  <Zap className="w-4 h-4 text-[#7EBF8E]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Signal BUY détecté</p>
                  <p className="text-xs text-[#605F5B] mt-1">Pattern HAMMER sur support 1.0845</p>
                </div>
                <span className="text-xs text-[#605F5B]">09:15</span>
              </div>
            </div>
            
            <div className="p-3 bg-[#D2886F]/10 rounded-lg border border-[#D2886F]/20">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-[#D2886F]/20 rounded">
                  <AlertCircle className="w-4 h-4 text-[#D2886F]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">News à venir</p>
                  <p className="text-xs text-[#605F5B] mt-1">BCE dans 30 minutes</p>
                </div>
                <span className="text-xs text-[#605F5B]">10:30</span>
              </div>
            </div>
            
            <div className="p-3 bg-[#8989DE]/10 rounded-lg border border-[#8989DE]/20">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-[#8989DE]/20 rounded">
                  <Shield className="w-4 h-4 text-[#8989DE]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">TP1 atteint</p>
                  <p className="text-xs text-[#605F5B] mt-1">+15 pips sur SELL 1.0868</p>
                </div>
                <span className="text-xs text-[#605F5B]">11:45</span>
              </div>
            </div>
          </div>
        </div>

        {/* État de l'apprentissage */}
        <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#8989DE]" />
            État de l'IA
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#E6E4DD]">Niveau actuel</span>
                <span className="text-sm font-medium text-[#8989DE]">INTERMEDIATE</span>
              </div>
              <div className="w-full bg-[#141413] rounded-full h-2">
                <div className="bg-gradient-to-r from-[#8989DE] to-[#6366F1] h-2 rounded-full" style={{ width: '68%' }} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#141413] rounded-lg p-3">
                <p className="text-xs text-[#605F5B] mb-1">Patterns maîtrisés</p>
                <p className="text-lg font-bold">5/12</p>
              </div>
              <div className="bg-[#141413] rounded-lg p-3">
                <p className="text-xs text-[#605F5B] mb-1">Précision</p>
                <p className="text-lg font-bold">68.5%</p>
              </div>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-[#8989DE]/10 to-[#6366F1]/10 rounded-lg border border-[#8989DE]/20">
              <p className="text-sm text-[#E6E4DD]">
                🎯 Prochain objectif: Atteindre 70% de win rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des trades */}
      <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#8989DE]" />
            Historique des Trades
          </h3>
          <button className="text-sm text-[#8989DE] hover:text-[#6366F1] transition-colors flex items-center gap-1">
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-[#605F5B] border-b border-[#3A3935]">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Paire</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Entrée</th>
                <th className="pb-3 font-medium">Sortie</th>
                <th className="pb-3 font-medium">Profit</th>
                <th className="pb-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {tradesHistory.map((trade) => (
                <tr key={trade.id} className="border-b border-[#3A3935]/50 hover:bg-[#141413] transition-colors">
                  <td className="py-3 text-sm">{trade.date}</td>
                  <td className="py-3 text-sm font-medium">{trade.pair}</td>
                  <td className="py-3">
                    <span className={`text-sm font-medium ${trade.type === 'BUY' ? 'text-[#7EBF8E]' : 'text-[#EF4444]'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 text-sm">{trade.entry}</td>
                  <td className="py-3 text-sm">{trade.exit}</td>
                  <td className="py-3">
                    <span className={`text-sm font-medium ${trade.profit > 0 ? 'text-[#7EBF8E]' : 'text-[#EF4444]'}`}>
                      {trade.profit > 0 ? '+' : ''}{trade.profit}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.status === 'win' 
                        ? 'bg-[#7EBF8E]/20 text-[#7EBF8E]' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {trade.status === 'win' ? 'Gagné' : 'Perdu'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 animate-slide-up">
          <div className="bg-[#1F1F1E] border border-[#8989DE]/30 rounded-lg p-4 shadow-xl shadow-[#8989DE]/10 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#8989DE]/20 rounded-lg">
                <Zap className="w-5 h-5 text-[#8989DE]" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Nouvelle opportunité détectée!</p>
                <p className="text-sm text-[#605F5B] mt-1">Pattern HAMMER sur support clé</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleDashboard;
