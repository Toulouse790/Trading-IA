
import React from "react";
import AIAgentPanel from "@/components/AIAgentPanel";
import MetricsOverview from "@/components/MetricsOverview";
import EquityChart from "@/components/EquityChart";
import AlertsPanel from "@/components/AlertsPanel";
import TradingStatus from "@/components/TradingStatus";
import TrainingHistory from "@/components/TrainingHistory";
import BestRuns from "@/components/BestRuns";
import { useTrainingLogs } from "@/hooks/useTrainingLogs";

export default function DashboardIA() {
  const { data: trainingLogs = [] } = useTrainingLogs();

  // Simulé : données de logs IA (à remplacer par un fetch réel depuis Supabase)
  const trainingLogsSimulated = [
    { date: "2025-06-18", winRate: 66.7, sharpe: 1.12, pattern: "Breakout H1" },
    { date: "2025-06-19", winRate: 72.4, sharpe: 1.31, pattern: "Double Bottom" },
    { date: "2025-06-20", winRate: 74.8, sharpe: 1.44, pattern: "EMA Rebound" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec meilleur contraste */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard IA Trading
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Surveillance en temps réel des performances de l'agent IA
          </p>
        </div>

        <MetricsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIAgentPanel
              name="Expert EUR/USD – MWD Strategy"
              objective="+6 % hebdo"
              status="LEARNING"
              winRate={74.8}
              sharpeRatio={1.44}
            />
          </div>
          
          <TradingStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsPanel />
          <BestRuns trainings={trainingLogs} />
        </div>

        <EquityChart />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            📈 Historique des entraînements
          </h3>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Win Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Sharpe</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Pattern dominant</th>
                </tr>
              </thead>
              <tbody>
                {trainingLogsSimulated.map((log, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{log.date}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {log.winRate.toFixed(1)} %
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">
                      {log.sharpe.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{log.pattern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TrainingHistory />
      </div>
    </div>
  );
}
