import React from "react";
import MetricsOverview from "@/components/MetricsOverview";
import EquityChart from "@/components/EquityChart";
import AlertsPanel from "@/components/AlertsPanel";
import TradingStatus from "@/components/TradingStatus";
import BestRuns from "@/components/BestRuns";
import ErrorBoundary from "@/components/ErrorBoundary";
import AgentPerformanceDashboard from "@/components/AgentPerformanceDashboard"; // Nouveau composant pour plusieurs agents
import { useTrainingLogs } from "@/hooks/useTrainingLogs"; // Conserver pour BestRuns si besoin
import { useSafeData } from "@/hooks/useSafeData"; // Conserver pour BestRuns si besoin

export default function DashboardIA() {
  const { data: trainingLogs, isLoading, error } = useTrainingLogs();
  const { getSafeArray } = useSafeData();

  // Sécuriser les données
  const safeTrainingLogs = getSafeArray(trainingLogs, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Erreur de chargement
            </h2>
            <p className="text-red-600 dark:text-red-300">
              Une erreur s'est produite lors du chargement des données.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard IA Trading
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Surveillance en temps réel des performances de l'agent IA
          </p>
        </div>

        <ErrorBoundary>
          <MetricsOverview />
        </ErrorBoundary>
        
        {/* Remplacé AIAgentPanel par AgentPerformanceDashboard pour plusieurs agents */}
        <ErrorBoundary>
            <AgentPerformanceDashboard />
        </ErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <TradingStatus />
          </ErrorBoundary>
          <ErrorBoundary>
            <AlertsPanel />
          </ErrorBoundary>
        </div>

        <ErrorBoundary>
          <BestRuns trainings={safeTrainingLogs} />
        </ErrorBoundary>

        <ErrorBoundary>
          <EquityChart />
        </ErrorBoundary>

        {/* TrainingHistory supprimé pour alléger la synthèse */}
        {/* <ErrorBoundary>
          <TrainingHistory />
        </ErrorBoundary> */}
      </div>
    </div>
  );
}
